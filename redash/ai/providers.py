"""
AI Provider abstraction layer.

Supports OpenAI, Google Gemini, Anthropic Claude, and Ollama.
Each provider implements the same interface for both dashboard chat
and NL-to-SQL query generation.
"""

import logging
import re
from abc import ABC, abstractmethod

import requests
from flask_restful import abort

from redash import settings

logger = logging.getLogger(__name__)


def _get_ai_setting(org, org_key, env_fallback):
    """
    Read an AI setting from org DB settings first, then fall back to env var.

    Args:
        org: Organization model instance (or None for env-only).
        org_key: Key name in organization settings (e.g. 'ai_openai_api_key').
        env_fallback: Value from redash.settings module (env var).

    Returns:
        The configured value.
    """
    if org is not None:
        try:
            val = org.get_setting(org_key, raise_on_missing=False)
            if val:  # non-empty string from DB wins
                return val
        except Exception:
            pass
    return env_fallback

try:
    from google import genai
    from google.genai import types as genai_types
except ImportError:
    genai = None
    genai_types = None


class AIProvider(ABC):
    """Abstract base class for AI providers."""

    @abstractmethod
    def get_answer(self, messages):
        """
        Get an answer from the AI provider.

        Args:
            messages: List of message dicts with 'role' and 'content'.
                      Roles: 'system', 'user', 'assistant'.

        Returns:
            str: The AI response text.
        """
        pass

    def generate_sql(self, question, schema_context, conversation_history=None):
        """
        Generate SQL from a natural language question.

        Args:
            question: The user's natural language question.
            schema_context: Formatted database schema for context.
            conversation_history: Optional list of previous messages.

        Returns:
            dict with 'sql', 'explanation', 'tables_used'.
        """
        system_prompt = self._build_sql_system_prompt(schema_context)

        messages = [{"role": "system", "content": system_prompt}]

        if conversation_history:
            messages.extend(conversation_history)

        messages.append({"role": "user", "content": question})

        response = self.get_answer(messages)
        return self._parse_sql_response(response)

    def _build_sql_system_prompt(self, schema_context):
        return f"""You are a SQL expert. Generate SQL queries from natural language questions.

RULES:
- Generate ONLY SELECT statements. Never generate INSERT, UPDATE, DELETE, DROP, ALTER, CREATE, TRUNCATE, or any DDL/DML.
- Use only tables and columns from the provided schema.
- Always use explicit column names, never SELECT *.
- Include appropriate WHERE clauses for time-based questions.
- Use standard SQL syntax compatible with the database.
- For aggregations, always include GROUP BY.
- Limit results to 10000 rows unless the user specifies otherwise.

DATABASE SCHEMA:
{schema_context}

RESPONSE FORMAT:
Return your response in exactly this format:

```sql
YOUR SQL QUERY HERE
```

EXPLANATION: A brief explanation of what the query does.

TABLES: comma-separated list of tables used."""

    def _parse_sql_response(self, response):
        """Parse the LLM response to extract SQL, explanation, and tables."""
        sql = ""
        explanation = ""
        tables_used = []

        # Extract SQL from code block
        sql_match = re.search(r"```sql\s*(.*?)\s*```", response, re.DOTALL)
        if sql_match:
            sql = sql_match.group(1).strip()
        else:
            # Try to find SQL without code blocks (some models skip formatting)
            lines = response.strip().split("\n")
            sql_lines = []
            for line in lines:
                stripped = line.strip().upper()
                if stripped.startswith(("SELECT", "WITH")) or sql_lines:
                    if stripped.startswith("EXPLANATION:") or stripped.startswith("TABLES:"):
                        break
                    sql_lines.append(line)
            if sql_lines:
                sql = "\n".join(sql_lines).strip()

        # Extract explanation
        explanation_match = re.search(r"EXPLANATION:\s*(.*?)(?:TABLES:|$)", response, re.DOTALL)
        if explanation_match:
            explanation = explanation_match.group(1).strip()

        # Extract tables
        tables_match = re.search(r"TABLES:\s*(.*?)$", response, re.DOTALL | re.MULTILINE)
        if tables_match:
            tables_str = tables_match.group(1).strip()
            tables_used = [t.strip() for t in tables_str.split(",") if t.strip()]

        return {
            "sql": sql,
            "explanation": explanation,
            "tables_used": tables_used,
        }


class OpenAIProvider(AIProvider):
    """OpenAI ChatGPT provider."""

    def __init__(self, model=None, org=None):
        self.model = model or "gpt-4o-mini"
        self.api_key = _get_ai_setting(org, "ai_openai_api_key", settings.OPENAI_API_KEY)

    def get_answer(self, messages):
        if not self.api_key:
            abort(400, message="OpenAI API key not configured. Set OPENAI_API_KEY environment variable.")

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.1,
        }

        try:
            response = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=settings.AI_QUERY_TIMEOUT,
            )

            if response.status_code != 200:
                logger.error("OpenAI API error: %s %s", response.status_code, response.text[:500])
                abort(502, message="Failed to get response from OpenAI.")

            data = response.json()
            return data["choices"][0]["message"]["content"]
        except requests.exceptions.Timeout:
            abort(504, message="OpenAI request timed out.")
        except requests.exceptions.RequestException as e:
            logger.error("OpenAI connection error: %s", str(e))
            abort(502, message=f"Failed to connect to OpenAI: {str(e)}")


class GeminiProvider(AIProvider):
    """Google Gemini provider."""

    def __init__(self, model=None, org=None):
        self.model = model or "gemini-2.5-flash"
        self.api_key = _get_ai_setting(org, "ai_gemini_api_key", settings.GEMINI_API_KEY)

    def get_answer(self, messages):
        if not self.api_key:
            abort(400, message="Gemini API key not configured. Set GEMINI_API_KEY environment variable.")

        if genai is None or genai_types is None:
            abort(400, message="Google Gemini library not installed. Install google-genai package.")

        try:
            client = genai.Client(api_key=self.api_key)

            # Separate system instruction from conversation messages
            system_content = ""
            gemini_contents = []

            for msg in messages:
                role = msg.get("role", "user")
                content = msg.get("content", "")

                if role == "system":
                    system_content += content + "\n\n"
                    continue

                gemini_role = "model" if role == "assistant" else "user"
                gemini_contents.append(
                    genai_types.Content(
                        role=gemini_role,
                        parts=[genai_types.Part(text=content)],
                    )
                )

            # Use config for system instruction and temperature
            config = genai_types.GenerateContentConfig(
                temperature=0.1,
            )
            if system_content.strip():
                config.system_instruction = system_content.strip()

            response = client.models.generate_content(
                model=self.model,
                contents=gemini_contents,
                config=config,
            )

            return response.text
        except Exception as e:
            logger.error("Gemini API error: %s", str(e))
            abort(502, message=f"Failed to get response from Gemini: {str(e)}")


class AnthropicProvider(AIProvider):
    """Anthropic Claude provider."""

    def __init__(self, model=None, org=None):
        self.model = model or "claude-sonnet-4-20250514"
        self.api_key = _get_ai_setting(org, "ai_anthropic_api_key", settings.ANTHROPIC_API_KEY)

    def get_answer(self, messages):
        if not self.api_key:
            abort(400, message="Anthropic API key not configured. Set ANTHROPIC_API_KEY environment variable.")

        # Claude Messages API expects system prompt separately
        system_prompt = ""
        claude_messages = []

        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")

            if role == "system":
                system_prompt += content + "\n\n"
            else:
                claude_messages.append({
                    "role": role,
                    "content": content,
                })

        # Ensure messages alternate user/assistant (Claude requirement)
        # If first message is assistant, prepend a user message
        if claude_messages and claude_messages[0]["role"] == "assistant":
            claude_messages.insert(0, {"role": "user", "content": "Hello."})

        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        }

        payload = {
            "model": self.model,
            "max_tokens": 4096,
            "temperature": 0.1,
            "messages": claude_messages,
        }

        if system_prompt.strip():
            payload["system"] = system_prompt.strip()

        try:
            response = requests.post(
                "https://api.anthropic.com/v1/messages",
                headers=headers,
                json=payload,
                timeout=settings.AI_QUERY_TIMEOUT,
            )

            if response.status_code != 200:
                logger.error("Anthropic API error: %s %s", response.status_code, response.text[:500])
                abort(502, message="Failed to get response from Anthropic.")

            data = response.json()
            # Claude returns content as array of blocks
            content_blocks = data.get("content", [])
            text_parts = [block["text"] for block in content_blocks if block.get("type") == "text"]
            return "\n".join(text_parts)
        except requests.exceptions.Timeout:
            abort(504, message="Anthropic request timed out.")
        except requests.exceptions.RequestException as e:
            logger.error("Anthropic connection error: %s", str(e))
            abort(502, message=f"Failed to connect to Anthropic: {str(e)}")


class OllamaProvider(AIProvider):
    """Ollama provider for self-hosted models (DeepSeek, Llama, etc.)."""

    def __init__(self, model=None, org=None):
        self.model = model or "deepseek-r1:7b"
        self.base_url = _get_ai_setting(org, "ai_ollama_url", settings.OLLAMA_API_URL)

    def get_answer(self, messages):
        try:
            # Ollama supports the OpenAI-compatible chat endpoint
            payload = {
                "model": self.model,
                "messages": messages,
                "stream": False,
                "options": {
                    "temperature": 0.1,
                },
            }

            response = requests.post(
                f"{self.base_url}/api/chat",
                json=payload,
                timeout=settings.AI_QUERY_TIMEOUT,
            )

            if response.status_code != 200:
                logger.error("Ollama API error: %s %s", response.status_code, response.text[:500])
                abort(502, message="Failed to get response from Ollama.")

            data = response.json()
            content = data.get("message", {}).get("content", "")

            # Clean thinking tags if present (DeepSeek models)
            content = re.sub(r"<think>.*?</think>", "", content, flags=re.DOTALL)
            return content.strip()
        except requests.exceptions.Timeout:
            abort(504, message="Ollama request timed out.")
        except requests.exceptions.RequestException as e:
            logger.error("Ollama connection error: %s", str(e))
            abort(502, message=f"Failed to connect to Ollama: {str(e)}")


# Provider registry
PROVIDERS = {
    "openai": OpenAIProvider,
    "chatgpt": OpenAIProvider,  # Backward compatibility alias
    "gemini": GeminiProvider,
    "anthropic": AnthropicProvider,
    "claude": AnthropicProvider,  # Alias
    "ollama": OllamaProvider,
    "deepseek": OllamaProvider,  # Backward compatibility alias
}


def get_ai_provider(provider_type, model=None, org=None):
    """
    Factory function to get the appropriate AI provider.

    Args:
        provider_type: One of 'openai', 'gemini', 'anthropic', 'ollama' (and aliases).
        model: Optional model override.
        org: Optional Organization instance for DB-configured settings.

    Returns:
        AIProvider instance.
    """
    provider_class = PROVIDERS.get(provider_type)
    if not provider_class:
        abort(400, message=f"Unknown AI provider: {provider_type}. "
              f"Supported: {', '.join(sorted(set(PROVIDERS.keys())))}")

    return provider_class(model=model, org=org)
