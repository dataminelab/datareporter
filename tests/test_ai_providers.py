"""
Tests for the AI provider abstraction layer.

Covers OpenAI, Gemini, Anthropic, and Ollama providers.
All HTTP calls are mocked — no real API keys needed.
"""

from unittest import TestCase
from unittest.mock import MagicMock, patch

from redash.ai.providers import (
    AIProvider,
    AnthropicProvider,
    GeminiProvider,
    OllamaProvider,
    OpenAIProvider,
    get_ai_provider,
)


class TestGetAIProvider(TestCase):
    """Test the provider factory function."""

    def test_returns_openai_provider(self):
        provider = get_ai_provider("openai")
        self.assertIsInstance(provider, OpenAIProvider)

    def test_returns_gemini_provider(self):
        provider = get_ai_provider("gemini")
        self.assertIsInstance(provider, GeminiProvider)

    def test_returns_anthropic_provider(self):
        provider = get_ai_provider("anthropic")
        self.assertIsInstance(provider, AnthropicProvider)

    def test_returns_ollama_provider(self):
        provider = get_ai_provider("ollama")
        self.assertIsInstance(provider, OllamaProvider)

    def test_chatgpt_alias_returns_openai(self):
        provider = get_ai_provider("chatgpt")
        self.assertIsInstance(provider, OpenAIProvider)

    def test_claude_alias_returns_anthropic(self):
        provider = get_ai_provider("claude")
        self.assertIsInstance(provider, AnthropicProvider)

    def test_deepseek_alias_returns_ollama(self):
        provider = get_ai_provider("deepseek")
        self.assertIsInstance(provider, OllamaProvider)

    def test_passes_model_to_provider(self):
        provider = get_ai_provider("openai", model="gpt-4o")
        self.assertEqual("gpt-4o", provider.model)

    def test_unknown_provider_aborts(self):
        from werkzeug.exceptions import BadRequest

        with self.assertRaises(BadRequest):
            # get_ai_provider calls abort(400) which raises BadRequest in test context
            from flask import Flask
            app = Flask(__name__)
            with app.app_context():
                get_ai_provider("nonexistent")


class TestAIProviderBase(TestCase):
    """Test the base class shared behavior."""

    def test_build_sql_system_prompt_contains_schema(self):
        provider = OpenAIProvider()
        prompt = provider._build_sql_system_prompt("TABLE: users\n  - id\n  - name")
        self.assertIn("TABLE: users", prompt)
        self.assertIn("SELECT", prompt)
        self.assertIn("Never generate INSERT", prompt)

    def test_parse_sql_response_extracts_sql_block(self):
        provider = OpenAIProvider()
        response = """Here's the query:

```sql
SELECT name, COUNT(*) as cnt FROM users GROUP BY name
```

EXPLANATION: Groups users by name and counts them.

TABLES: users"""

        result = provider._parse_sql_response(response)
        self.assertEqual("SELECT name, COUNT(*) as cnt FROM users GROUP BY name", result["sql"])
        self.assertEqual("Groups users by name and counts them.", result["explanation"])
        self.assertEqual(["users"], result["tables_used"])

    def test_parse_sql_response_handles_no_code_block(self):
        provider = OpenAIProvider()
        response = """SELECT id, name FROM users WHERE active = true

EXPLANATION: Selects active users.

TABLES: users"""

        result = provider._parse_sql_response(response)
        self.assertIn("SELECT", result["sql"])
        self.assertEqual(["users"], result["tables_used"])

    def test_parse_sql_response_handles_empty_response(self):
        provider = OpenAIProvider()
        result = provider._parse_sql_response("")
        self.assertEqual("", result["sql"])
        self.assertEqual("", result["explanation"])
        self.assertEqual([], result["tables_used"])

    def test_parse_sql_response_multiple_tables(self):
        provider = OpenAIProvider()
        response = """```sql
SELECT u.name, o.total FROM users u JOIN orders o ON u.id = o.user_id
```

EXPLANATION: Joins users with their orders.

TABLES: users, orders"""

        result = provider._parse_sql_response(response)
        self.assertEqual(["users", "orders"], result["tables_used"])


class TestOpenAIProvider(TestCase):
    """Test OpenAI provider with mocked HTTP."""

    @patch("redash.ai.providers.requests.post")
    @patch("redash.ai.providers.settings")
    def test_get_answer_success(self, mock_settings, mock_post):
        mock_settings.OPENAI_API_KEY = "test-key"
        mock_settings.AI_MODEL = None
        mock_settings.AI_QUERY_TIMEOUT = 60

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "choices": [{"message": {"content": "Hello from GPT!"}}]
        }
        mock_post.return_value = mock_response

        provider = OpenAIProvider()
        result = provider.get_answer([{"role": "user", "content": "Hi"}])

        self.assertEqual("Hello from GPT!", result)
        mock_post.assert_called_once()
        call_args = mock_post.call_args
        self.assertEqual("https://api.openai.com/v1/chat/completions", call_args[0][0])
        self.assertIn("Bearer test-key", call_args[1]["headers"]["Authorization"])

    @patch("redash.ai.providers.requests.post")
    @patch("redash.ai.providers.settings")
    def test_get_answer_uses_custom_model(self, mock_settings, mock_post):
        mock_settings.OPENAI_API_KEY = "test-key"
        mock_settings.AI_MODEL = None
        mock_settings.AI_QUERY_TIMEOUT = 60

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "choices": [{"message": {"content": "ok"}}]
        }
        mock_post.return_value = mock_response

        provider = OpenAIProvider(model="gpt-4o")
        provider.get_answer([{"role": "user", "content": "Hi"}])

        payload = mock_post.call_args[1]["json"]
        self.assertEqual("gpt-4o", payload["model"])

    @patch("redash.ai.providers.settings")
    def test_get_answer_missing_api_key(self, mock_settings):
        mock_settings.OPENAI_API_KEY = ""
        mock_settings.AI_MODEL = None

        from werkzeug.exceptions import BadRequest
        from flask import Flask
        app = Flask(__name__)
        with app.app_context():
            provider = OpenAIProvider()
            with self.assertRaises(BadRequest):
                provider.get_answer([{"role": "user", "content": "Hi"}])


class TestGeminiProvider(TestCase):
    """Test Gemini provider with mocked SDK."""

    @patch("redash.ai.providers.genai_types")
    @patch("redash.ai.providers.genai")
    @patch("redash.ai.providers.settings")
    def test_get_answer_success(self, mock_settings, mock_genai, mock_types):
        mock_settings.GEMINI_API_KEY = "test-key"
        mock_settings.AI_QUERY_TIMEOUT = 60

        mock_response = MagicMock()
        mock_response.text = "Hello from Gemini!"
        mock_client = MagicMock()
        mock_client.models.generate_content.return_value = mock_response
        mock_genai.Client.return_value = mock_client

        # Mock types to return passthrough objects
        mock_types.Content = MagicMock(side_effect=lambda **kw: kw)
        mock_types.Part = MagicMock(side_effect=lambda **kw: kw)
        mock_types.GenerateContentConfig.return_value = MagicMock()

        provider = GeminiProvider()
        result = provider.get_answer([
            {"role": "system", "content": "Be helpful"},
            {"role": "user", "content": "Hi"},
        ])

        self.assertEqual("Hello from Gemini!", result)
        mock_genai.Client.assert_called_once_with(api_key="test-key")

    @patch("redash.ai.providers.genai_types")
    @patch("redash.ai.providers.genai")
    @patch("redash.ai.providers.settings")
    def test_system_instruction_via_config(self, mock_settings, mock_genai, mock_types):
        mock_settings.GEMINI_API_KEY = "test-key"
        mock_settings.AI_QUERY_TIMEOUT = 60

        mock_response = MagicMock()
        mock_response.text = "ok"
        mock_client = MagicMock()
        mock_client.models.generate_content.return_value = mock_response
        mock_genai.Client.return_value = mock_client

        # Mock types to return passthrough objects
        mock_types.Content = MagicMock(side_effect=lambda **kw: kw)
        mock_types.Part = MagicMock(side_effect=lambda **kw: kw)
        mock_config = MagicMock()
        mock_types.GenerateContentConfig.return_value = mock_config

        provider = GeminiProvider()
        provider.get_answer([
            {"role": "system", "content": "System prompt"},
            {"role": "user", "content": "User question"},
        ])

        call_args = mock_client.models.generate_content.call_args
        contents = call_args[1]["contents"]
        config = call_args[1]["config"]
        # System instruction should be set via config, not prepended to user message
        self.assertEqual(config.system_instruction, "System prompt")
        # Contents should only have user message, no system content mixed in
        self.assertEqual(1, len(contents))
        self.assertEqual("user", contents[0]["role"])


class TestAnthropicProvider(TestCase):
    """Test Anthropic Claude provider with mocked HTTP."""

    @patch("redash.ai.providers.requests.post")
    @patch("redash.ai.providers.settings")
    def test_get_answer_success(self, mock_settings, mock_post):
        mock_settings.ANTHROPIC_API_KEY = "test-key"
        mock_settings.AI_MODEL = None
        mock_settings.AI_QUERY_TIMEOUT = 60

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "content": [{"type": "text", "text": "Hello from Claude!"}]
        }
        mock_post.return_value = mock_response

        provider = AnthropicProvider()
        result = provider.get_answer([
            {"role": "system", "content": "Be helpful"},
            {"role": "user", "content": "Hi"},
        ])

        self.assertEqual("Hello from Claude!", result)
        call_args = mock_post.call_args
        self.assertEqual("https://api.anthropic.com/v1/messages", call_args[0][0])
        self.assertEqual("test-key", call_args[1]["headers"]["x-api-key"])
        self.assertEqual("2023-06-01", call_args[1]["headers"]["anthropic-version"])

    @patch("redash.ai.providers.requests.post")
    @patch("redash.ai.providers.settings")
    def test_system_prompt_sent_separately(self, mock_settings, mock_post):
        mock_settings.ANTHROPIC_API_KEY = "test-key"
        mock_settings.AI_MODEL = None
        mock_settings.AI_QUERY_TIMEOUT = 60

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "content": [{"type": "text", "text": "ok"}]
        }
        mock_post.return_value = mock_response

        provider = AnthropicProvider()
        provider.get_answer([
            {"role": "system", "content": "System prompt"},
            {"role": "user", "content": "Hello"},
        ])

        payload = mock_post.call_args[1]["json"]
        self.assertEqual("System prompt", payload["system"])
        # Messages should only have user/assistant, not system
        for msg in payload["messages"]:
            self.assertNotEqual("system", msg["role"])

    @patch("redash.ai.providers.requests.post")
    @patch("redash.ai.providers.settings")
    def test_handles_multiple_content_blocks(self, mock_settings, mock_post):
        mock_settings.ANTHROPIC_API_KEY = "test-key"
        mock_settings.AI_MODEL = None
        mock_settings.AI_QUERY_TIMEOUT = 60

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "content": [
                {"type": "text", "text": "Part 1"},
                {"type": "text", "text": "Part 2"},
            ]
        }
        mock_post.return_value = mock_response

        provider = AnthropicProvider()
        result = provider.get_answer([{"role": "user", "content": "Hi"}])
        self.assertEqual("Part 1\nPart 2", result)

    @patch("redash.ai.providers.settings")
    def test_get_answer_missing_api_key(self, mock_settings):
        mock_settings.ANTHROPIC_API_KEY = ""
        mock_settings.AI_MODEL = None

        from werkzeug.exceptions import BadRequest
        from flask import Flask
        app = Flask(__name__)
        with app.app_context():
            provider = AnthropicProvider()
            with self.assertRaises(BadRequest):
                provider.get_answer([{"role": "user", "content": "Hi"}])

    @patch("redash.ai.providers.requests.post")
    @patch("redash.ai.providers.settings")
    def test_default_model_is_claude_sonnet(self, mock_settings, mock_post):
        mock_settings.ANTHROPIC_API_KEY = "test-key"
        mock_settings.AI_MODEL = None
        mock_settings.AI_QUERY_TIMEOUT = 60

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "content": [{"type": "text", "text": "ok"}]
        }
        mock_post.return_value = mock_response

        provider = AnthropicProvider()
        self.assertEqual("claude-sonnet-4-20250514", provider.model)


class TestOllamaProvider(TestCase):
    """Test Ollama provider with mocked HTTP."""

    @patch("redash.ai.providers.requests.post")
    @patch("redash.ai.providers.settings")
    def test_get_answer_success(self, mock_settings, mock_post):
        mock_settings.OLLAMA_API_URL = "http://localhost:11434"
        mock_settings.AI_MODEL = None
        mock_settings.AI_QUERY_TIMEOUT = 60

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "message": {"content": "Hello from Ollama!"}
        }
        mock_post.return_value = mock_response

        provider = OllamaProvider()
        result = provider.get_answer([{"role": "user", "content": "Hi"}])

        self.assertEqual("Hello from Ollama!", result)
        call_args = mock_post.call_args
        self.assertEqual("http://localhost:11434/api/chat", call_args[0][0])

    @patch("redash.ai.providers.requests.post")
    @patch("redash.ai.providers.settings")
    def test_strips_think_tags(self, mock_settings, mock_post):
        mock_settings.OLLAMA_API_URL = "http://localhost:11434"
        mock_settings.AI_MODEL = None
        mock_settings.AI_QUERY_TIMEOUT = 60

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "message": {"content": "<think>Internal reasoning here</think>Here is the answer."}
        }
        mock_post.return_value = mock_response

        provider = OllamaProvider()
        result = provider.get_answer([{"role": "user", "content": "Hi"}])

        self.assertEqual("Here is the answer.", result)
        self.assertNotIn("<think>", result)

    @patch("redash.ai.providers.requests.post")
    @patch("redash.ai.providers.settings")
    def test_uses_correct_model(self, mock_settings, mock_post):
        mock_settings.OLLAMA_API_URL = "http://localhost:11434"
        mock_settings.AI_MODEL = None
        mock_settings.AI_QUERY_TIMEOUT = 60

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "message": {"content": "ok"}
        }
        mock_post.return_value = mock_response

        provider = OllamaProvider(model="llama3:8b")
        provider.get_answer([{"role": "user", "content": "Hi"}])

        payload = mock_post.call_args[1]["json"]
        self.assertEqual("llama3:8b", payload["model"])
        self.assertFalse(payload["stream"])


class TestGenerateSQL(TestCase):
    """Test the generate_sql method shared across providers."""

    @patch("redash.ai.providers.requests.post")
    @patch("redash.ai.providers.settings")
    def test_generate_sql_calls_get_answer_with_schema(self, mock_settings, mock_post):
        mock_settings.OPENAI_API_KEY = "test-key"
        mock_settings.AI_MODEL = None
        mock_settings.AI_QUERY_TIMEOUT = 60

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "choices": [{
                "message": {
                    "content": "```sql\nSELECT COUNT(*) FROM users\n```\n\nEXPLANATION: Counts all users.\n\nTABLES: users"
                }
            }]
        }
        mock_post.return_value = mock_response

        provider = OpenAIProvider()
        result = provider.generate_sql(
            question="How many users?",
            schema_context="TABLE: users\n  - id\n  - name",
        )

        self.assertEqual("SELECT COUNT(*) FROM users", result["sql"])
        self.assertEqual("Counts all users.", result["explanation"])
        self.assertEqual(["users"], result["tables_used"])

    @patch("redash.ai.providers.requests.post")
    @patch("redash.ai.providers.settings")
    def test_generate_sql_includes_conversation_history(self, mock_settings, mock_post):
        mock_settings.OPENAI_API_KEY = "test-key"
        mock_settings.AI_MODEL = None
        mock_settings.AI_QUERY_TIMEOUT = 60

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "choices": [{
                "message": {"content": "```sql\nSELECT 1\n```\n\nEXPLANATION: ok\n\nTABLES: t"}
            }]
        }
        mock_post.return_value = mock_response

        provider = OpenAIProvider()
        provider.generate_sql(
            question="And the last 5?",
            schema_context="TABLE: orders\n  - id",
            conversation_history=[
                {"role": "user", "content": "Show orders"},
                {"role": "assistant", "content": "Here are the orders"},
            ],
        )

        payload = mock_post.call_args[1]["json"]
        messages = payload["messages"]
        # system + 2 history + 1 current = 4 messages
        self.assertEqual(4, len(messages))
        self.assertEqual("system", messages[0]["role"])
        self.assertEqual("user", messages[1]["role"])
        self.assertEqual("assistant", messages[2]["role"])
        self.assertEqual("user", messages[3]["role"])
        self.assertEqual("And the last 5?", messages[3]["content"])
