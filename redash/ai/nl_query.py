"""
NL Query handler — generates SQL from natural language questions.

Pipeline:
1. Load data source schema
2. Build system prompt with schema context
3. Call LLM provider to generate SQL
4. Validate SQL (SELECT only)
5. Optionally execute against data source
6. Return results
"""

import logging

from flask import request
from flask_login import current_user
from flask_restful import abort

from redash import models, settings
from redash.handlers.base import BaseResource, get_object_or_404, record_event
from redash.permissions import require_access, require_permission, view_only

from .providers import _get_ai_setting, get_ai_provider
from .sql_validator import SQLValidationError, validate_sql

logger = logging.getLogger(__name__)


def format_schema_context(schema):
    """
    Format database schema into a readable context for LLM prompts.

    Args:
        schema: List of table dicts from data_source.get_cached_schema()
                Each dict has 'name' and 'columns' keys.

    Returns:
        str: Formatted schema text.
    """
    if not schema:
        return "No schema information available."

    lines = []
    for table in schema:
        table_name = table.get("name", "unknown")
        columns = table.get("columns", [])

        if not columns:
            lines.append(f"TABLE: {table_name}")
            continue

        col_defs = []
        for col in columns:
            if isinstance(col, str):
                col_defs.append(f"  - {col}")
            elif isinstance(col, dict):
                col_name = col.get("name", "unknown")
                col_type = col.get("type", "")
                if col_type:
                    col_defs.append(f"  - {col_name} ({col_type})")
                else:
                    col_defs.append(f"  - {col_name}")

        lines.append(f"TABLE: {table_name}")
        lines.extend(col_defs)
        lines.append("")

    return "\n".join(lines)


class NLQueryGenerateResource(BaseResource):
    """
    Generate SQL from natural language questions.

    POST /api/nl-query/generate
    """

    @require_permission("view_query")
    def post(self):
        data = request.get_json(force=True)

        question = data.get("question", "").strip()
        data_source_id = data.get("data_source_id")
        provider_type = data.get("provider", settings.AI_PROVIDER or "openai")
        model = data.get("model")
        execute = data.get("execute", False)
        messages = data.get("messages", [])

        # Validation
        if not question:
            abort(400, message="Missing 'question' in request body.")

        if not data_source_id:
            abort(400, message="Missing 'data_source_id' in request body.")

        # Get data source and verify access
        data_source = get_object_or_404(
            models.DataSource.get_by_id_and_org,
            data_source_id,
            self.current_org,
        )
        require_access(data_source, self.current_user, view_only)

        # Load schema
        schema = data_source.get_cached_schema()
        if not schema:
            abort(400, message="No schema available for this data source. "
                  "Go to Settings > Data Sources and click 'Refresh Schema' "
                  "on the data source, or wait for the automatic refresh.")

        schema_context = format_schema_context(schema)

        # Get AI provider (org settings override env vars)
        provider = get_ai_provider(provider_type, model=model, org=self.current_org)

        # Build conversation history for follow-up context
        conversation_history = []
        for msg in messages:
            if msg.get("role") in ("user", "assistant"):
                conversation_history.append(msg)

        # Generate SQL
        try:
            result = provider.generate_sql(
                question=question,
                schema_context=schema_context,
                conversation_history=conversation_history if conversation_history else None,
            )
        except Exception as e:
            logger.error("SQL generation failed: %s", str(e))
            abort(502, message=f"Failed to generate SQL: {str(e)}")

        sql = result.get("sql", "")
        explanation = result.get("explanation", "")
        tables_used = result.get("tables_used", [])

        # Validate SQL safety
        if sql:
            try:
                sql = validate_sql(sql)
            except SQLValidationError as e:
                logger.warning("Generated SQL failed validation: %s", str(e))
                return {
                    "sql": "",
                    "explanation": explanation,
                    "tables_used": tables_used,
                    "error": str(e),
                    "generated_sql": sql if settings.AI_SHOW_FAILED_SQL else None,
                }, 422
        else:
            return {
                "sql": "",
                "explanation": "Could not generate a SQL query for this question. "
                               "Try being more specific about what data you want.",
                "tables_used": [],
                "error": "No SQL generated",
            }, 422

        # Record event
        record_event(
            self.current_org,
            self.current_user,
            {
                "action": "nl_query_generate",
                "object_type": "data_source",
                "object_id": data_source.id,
                "question": question[:500],
                "provider": provider_type,
                "tables_used": tables_used,
            },
        )

        response = {
            "sql": sql,
            "explanation": explanation,
            "tables_used": tables_used,
            "data_source_id": data_source.id,
        }

        # Optionally execute the query
        if execute:
            try:
                execution_result = self._execute_query(data_source, sql)
                response["query_result"] = execution_result
            except Exception as e:
                logger.error("Query execution failed: %s", str(e))
                response["execution_error"] = str(e)

        return response

    def _execute_query(self, data_source, sql):
        """Execute a SQL query against a data source and return results."""
        from redash.tasks.queries import enqueue_query
        from redash.serializers import serialize_job

        max_rows = settings.AI_MAX_RESULT_ROWS

        # Add LIMIT if not present (use word boundary to avoid matching column names)
        import re
        if not re.search(r"\bLIMIT\b", sql, re.IGNORECASE):
            sql = f"{sql}\nLIMIT {max_rows}"

        job = enqueue_query(
            sql,
            data_source,
            current_user.id,
            current_user.is_api_user(),
            metadata={
                "Username": current_user.get_actual_user(),
                "source": "nl_query",
            },
        )
        return serialize_job(job)


class NLQueryConfigResource(BaseResource):
    """
    Get NL Query configuration (available providers, data sources).

    GET /api/nl-query/config
    """

    @require_permission("view_query")
    def get(self):
        org = self.current_org

        # Get available data sources for this user
        data_sources = models.DataSource.all(org)
        accessible = []
        for ds in data_sources:
            try:
                require_access(ds, self.current_user, view_only)
                accessible.append({"id": ds.id, "name": ds.name, "type": ds.type})
            except Exception:
                pass

        # Determine which providers are configured (org DB settings override env vars)
        providers = []
        if _get_ai_setting(org, "ai_openai_api_key", settings.OPENAI_API_KEY):
            providers.append({"id": "openai", "name": "OpenAI", "models": ["gpt-4o", "gpt-4o-mini", "gpt-4.1-mini", "gpt-4.1"]})
        if _get_ai_setting(org, "ai_gemini_api_key", settings.GEMINI_API_KEY):
            providers.append({"id": "gemini", "name": "Google Gemini", "models": ["gemini-2.5-flash", "gemini-2.5-pro"]})
        if _get_ai_setting(org, "ai_anthropic_api_key", settings.ANTHROPIC_API_KEY):
            providers.append({"id": "anthropic", "name": "Anthropic Claude", "models": ["claude-sonnet-4-20250514", "claude-haiku-4-5-20251001"]})
        if _get_ai_setting(org, "ai_ollama_url", settings.OLLAMA_API_URL):
            providers.append({"id": "ollama", "name": "Ollama (Self-hosted)", "models": ["deepseek-r1:7b", "llama3:8b"]})

        default_provider = _get_ai_setting(org, "ai_default_provider", settings.AI_PROVIDER)
        if not default_provider:
            # Auto-detect first available provider
            default_provider = providers[0]["id"] if providers else None

        return {
            "data_sources": accessible,
            "providers": providers,
            "default_provider": default_provider,
            "default_model": _get_ai_setting(org, "ai_default_model", settings.AI_MODEL),
        }
