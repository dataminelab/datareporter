"""
Tests for NL Query endpoint — generate SQL from natural language.

Tests the API endpoints, schema formatting, and error handling.
Uses BaseTestCase for full Flask app context with mocked providers.
"""

from unittest.mock import MagicMock, patch

from redash import models
from redash.ai.nl_query import format_schema_context
from tests import BaseTestCase


class TestFormatSchemaContext(BaseTestCase):
    """Test schema formatting utility."""

    def test_formats_tables_with_columns(self):
        schema = [
            {"name": "users", "columns": ["id", "name", "email"]},
            {"name": "orders", "columns": ["id", "user_id", "total"]},
        ]
        result = format_schema_context(schema)
        self.assertIn("TABLE: users", result)
        self.assertIn("- id", result)
        self.assertIn("- name", result)
        self.assertIn("TABLE: orders", result)
        self.assertIn("- user_id", result)

    def test_formats_columns_with_types(self):
        schema = [
            {
                "name": "users",
                "columns": [
                    {"name": "id", "type": "integer"},
                    {"name": "name", "type": "varchar"},
                ],
            }
        ]
        result = format_schema_context(schema)
        self.assertIn("- id (integer)", result)
        self.assertIn("- name (varchar)", result)

    def test_handles_empty_schema(self):
        result = format_schema_context([])
        self.assertEqual("No schema information available.", result)

    def test_handles_none_schema(self):
        result = format_schema_context(None)
        self.assertEqual("No schema information available.", result)

    def test_handles_table_without_columns(self):
        schema = [{"name": "empty_table", "columns": []}]
        result = format_schema_context(schema)
        self.assertIn("TABLE: empty_table", result)


class TestNLQueryGenerateEndpoint(BaseTestCase):
    """Test the /api/nl-query/generate endpoint."""

    def _create_data_source(self):
        ds = self.factory.create_data_source()
        return ds

    @patch("redash.ai.nl_query.get_ai_provider")
    def test_generate_success(self, mock_get_provider):
        ds = self._create_data_source()

        # Mock the cached schema
        with patch.object(type(ds), "get_cached_schema", return_value=[
            {"name": "users", "columns": ["id", "name", "email"]},
        ]):
            mock_provider = MagicMock()
            mock_provider.generate_sql.return_value = {
                "sql": "SELECT name FROM users",
                "explanation": "Lists all user names.",
                "tables_used": ["users"],
            }
            mock_get_provider.return_value = mock_provider

            rv = self.make_request(
                "post",
                "/api/nl-query/generate",
                data={
                    "question": "Show me all user names",
                    "data_source_id": ds.id,
                    "provider": "openai",
                },
            )

            self.assertEqual(200, rv.status_code)
            data = rv.json
            self.assertEqual("SELECT name FROM users", data["sql"])
            self.assertEqual("Lists all user names.", data["explanation"])
            self.assertEqual(["users"], data["tables_used"])

    def test_generate_missing_question(self):
        ds = self._create_data_source()
        rv = self.make_request(
            "post",
            "/api/nl-query/generate",
            data={"data_source_id": ds.id},
        )
        self.assertEqual(400, rv.status_code)

    def test_generate_missing_data_source(self):
        rv = self.make_request(
            "post",
            "/api/nl-query/generate",
            data={"question": "Show users"},
        )
        self.assertEqual(400, rv.status_code)

    @patch("redash.ai.nl_query.get_ai_provider")
    def test_generate_returns_422_for_empty_sql(self, mock_get_provider):
        ds = self._create_data_source()

        with patch.object(type(ds), "get_cached_schema", return_value=[
            {"name": "users", "columns": ["id"]},
        ]):
            mock_provider = MagicMock()
            mock_provider.generate_sql.return_value = {
                "sql": "",
                "explanation": "Could not understand the question",
                "tables_used": [],
            }
            mock_get_provider.return_value = mock_provider

            rv = self.make_request(
                "post",
                "/api/nl-query/generate",
                data={
                    "question": "sdkjfhskdjfh",
                    "data_source_id": ds.id,
                },
            )

            self.assertEqual(422, rv.status_code)

    @patch("redash.ai.nl_query.get_ai_provider")
    def test_generate_returns_422_for_dangerous_sql(self, mock_get_provider):
        ds = self._create_data_source()

        with patch.object(type(ds), "get_cached_schema", return_value=[
            {"name": "users", "columns": ["id"]},
        ]):
            mock_provider = MagicMock()
            mock_provider.generate_sql.return_value = {
                "sql": "DROP TABLE users",
                "explanation": "Drops the users table",
                "tables_used": ["users"],
            }
            mock_get_provider.return_value = mock_provider

            rv = self.make_request(
                "post",
                "/api/nl-query/generate",
                data={
                    "question": "Drop the users table",
                    "data_source_id": ds.id,
                },
            )

            self.assertEqual(422, rv.status_code)
            self.assertIn("error", rv.json)

    @patch("redash.ai.nl_query.get_ai_provider")
    def test_generate_includes_conversation_history(self, mock_get_provider):
        ds = self._create_data_source()

        with patch.object(type(ds), "get_cached_schema", return_value=[
            {"name": "users", "columns": ["id", "name"]},
        ]):
            mock_provider = MagicMock()
            mock_provider.generate_sql.return_value = {
                "sql": "SELECT name FROM users LIMIT 5",
                "explanation": "Top 5 users",
                "tables_used": ["users"],
            }
            mock_get_provider.return_value = mock_provider

            rv = self.make_request(
                "post",
                "/api/nl-query/generate",
                data={
                    "question": "Show the top 5",
                    "data_source_id": ds.id,
                    "messages": [
                        {"role": "user", "content": "Show users"},
                        {"role": "assistant", "content": "Here are the users"},
                    ],
                },
            )

            self.assertEqual(200, rv.status_code)
            # Verify history was passed
            call_args = mock_provider.generate_sql.call_args
            self.assertIsNotNone(call_args[1].get("conversation_history") or call_args[0][2] if len(call_args[0]) > 2 else None)


class TestNLQueryConfigEndpoint(BaseTestCase):
    """Test the /api/nl-query/config endpoint."""

    @patch("redash.ai.nl_query.settings")
    def test_config_returns_providers(self, mock_settings):
        mock_settings.OPENAI_API_KEY = "sk-test"
        mock_settings.GEMINI_API_KEY = ""
        mock_settings.ANTHROPIC_API_KEY = "ant-test"
        mock_settings.OLLAMA_API_URL = ""
        mock_settings.AI_PROVIDER = "openai"

        rv = self.make_request("get", "/api/nl-query/config")

        self.assertEqual(200, rv.status_code)
        data = rv.json
        self.assertIn("providers", data)
        self.assertIn("data_sources", data)

        provider_ids = [p["id"] for p in data["providers"]]
        self.assertIn("openai", provider_ids)
        self.assertIn("anthropic", provider_ids)
        self.assertNotIn("gemini", provider_ids)
        self.assertNotIn("ollama", provider_ids)

    @patch("redash.ai.nl_query.settings")
    def test_config_returns_all_providers_when_configured(self, mock_settings):
        mock_settings.OPENAI_API_KEY = "sk-test"
        mock_settings.GEMINI_API_KEY = "gem-test"
        mock_settings.ANTHROPIC_API_KEY = "ant-test"
        mock_settings.OLLAMA_API_URL = "http://localhost:11434"
        mock_settings.AI_PROVIDER = "openai"

        rv = self.make_request("get", "/api/nl-query/config")

        self.assertEqual(200, rv.status_code)
        provider_ids = [p["id"] for p in rv.json["providers"]]
        self.assertEqual(4, len(provider_ids))

    def test_config_returns_accessible_data_sources(self):
        ds = self.factory.create_data_source()

        with patch("redash.ai.nl_query.settings") as mock_settings:
            mock_settings.OPENAI_API_KEY = "sk-test"
            mock_settings.GEMINI_API_KEY = ""
            mock_settings.ANTHROPIC_API_KEY = ""
            mock_settings.OLLAMA_API_URL = ""
            mock_settings.AI_PROVIDER = "openai"

            rv = self.make_request("get", "/api/nl-query/config")

            self.assertEqual(200, rv.status_code)
            self.assertIn("data_sources", rv.json)
