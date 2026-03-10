"""Ollama Provider — Self-hosted open-source models via Ollama API."""

import logging

import requests

from redash import settings
from redash.services.ai.providers.base import AIProvider, AIProviderError

logger = logging.getLogger(__name__)

OLLAMA_MODELS = ["deepseek-r1:7b", "llama3:8b", "codellama:13b", "qwen2.5-coder:7b"]
DEFAULT_MODEL = "deepseek-r1:7b"


class OllamaProvider(AIProvider):
    def __init__(self, model_override=None):
        self._model = model_override or DEFAULT_MODEL

    @property
    def provider_id(self):
        return "ollama"

    @property
    def provider_name(self):
        return "Ollama (Self-Hosted)"

    def is_available(self):
        return bool(getattr(settings, "OLLAMA_API_URL", ""))

    def list_models(self):
        return OLLAMA_MODELS

    def default_model(self):
        return DEFAULT_MODEL

    def get_completion(self, messages):
        base_url = getattr(settings, "OLLAMA_API_URL", "")
        if not base_url:
            raise AIProviderError("Ollama API URL not configured", provider="ollama")

        # Ollama's /api/chat endpoint supports the OpenAI-compatible message format
        url = f"{base_url.rstrip('/')}/api/chat"

        # Clean messages: Ollama doesn't support 'system' role in all models,
        # but /api/chat does support it natively
        ollama_messages = []
        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            ollama_messages.append({"role": role, "content": content})

        payload = {
            "model": self._model,
            "messages": ollama_messages,
            "stream": False,
            "options": {
                "temperature": 0,
            },
        }

        try:
            response = requests.post(url, json=payload, timeout=120)

            if response.status_code != 200:
                raise AIProviderError(
                    f"Ollama API error (status {response.status_code})",
                    provider="ollama",
                    status_code=response.status_code,
                )

            data = response.json()
            content = data.get("message", {}).get("content", "")

            # Strip thinking tags if present (common in reasoning models like DeepSeek)
            if "<think>" in content:
                import re

                content = re.sub(r"<think>.*?</think>", "", content, flags=re.DOTALL)

            return content.strip()
        except requests.exceptions.Timeout:
            raise AIProviderError("Ollama request timed out (120s)", provider="ollama")
        except requests.exceptions.ConnectionError:
            raise AIProviderError(
                f"Cannot connect to Ollama at {base_url}. " "Verify the server is running and accessible.",
                provider="ollama",
            )
        except requests.exceptions.RequestException as e:
            raise AIProviderError(f"Ollama connection error: {e}", provider="ollama")
