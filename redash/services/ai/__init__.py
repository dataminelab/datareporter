"""
AI Service — Main interface for all AI-powered features in DataReporter.

This is the single entry point for NL-to-SQL, NL-to-OLAP, and dashboard chat.
All security controls (input sanitization, prompt hardening, SQL validation,
audit logging) are enforced here — handlers never bypass this layer.

Architecture:
    Handler → AIService.generate_sql() → sanitize → build prompt → LLM → parse → validate → audit → return
"""

import logging
import time

from redash.services.ai.audit import log_ai_query
from redash.services.ai.input_sanitizer import InputSanitizationError, sanitize_input
from redash.services.ai.prompts.nl_to_sql import build_messages, parse_llm_response
from redash.services.ai.providers import AIProviderError, get_provider, list_providers
from redash.services.ai.schema_context import build_schema_context
from redash.services.ai.sql_validator import SQLValidationError, validate_sql

logger = logging.getLogger(__name__)


class AIService:
    """
    Main AI service class. Orchestrates the full NL-to-SQL pipeline
    with security controls at every stage.
    """

    @staticmethod
    def generate_sql(question, data_source, user, org, provider_id=None, model=None, conversation=None):
        """
        Generate SQL from a natural language question.

        Full pipeline:
        1. Sanitize input (prompt injection defense)
        2. Build schema context (data minimization)
        3. Build hardened prompt
        4. Call LLM provider
        5. Parse response
        6. Validate generated SQL (AST + pattern matching)
        7. Audit log

        Args:
            question: Raw natural language question from user.
            data_source: DataSource model instance.
            user: Current user model instance.
            org: Current organization model instance.
            provider_id: Optional provider override ('openai', 'gemini', 'anthropic', 'ollama').
            model: Optional model override.
            conversation: Optional list of (question, sql) tuples for context.

        Returns:
            dict: {
                'sql': str,             # Validated SQL query
                'explanation': str,     # Human-readable explanation
                'tables_used': list,    # Tables referenced in the query
                'provider': str,        # Provider ID used
                'model': str,           # Model used
                'generation_time_ms': int,  # Time taken for LLM call
            }

        Raises:
            InputSanitizationError: If input fails sanitization.
            SQLValidationError: If generated SQL fails validation.
            AIProviderError: If the LLM API call fails.
            ValueError: If data source has no schema.
        """
        provider_instance = None
        generated_sql = None
        validation_passed = None

        try:
            # Step 1: Sanitize input
            clean_question = sanitize_input(question)

            # Step 2: Get provider
            provider_instance = get_provider(provider_id, model)

            # Step 3: Build schema context (cache-first to avoid blocking DB calls)
            schema = data_source.schema
            if not schema:
                # Fall back to live query if cache is empty
                schema = data_source.query_runner.get_schema() if hasattr(data_source, "query_runner") else None
            if not schema:
                raise ValueError(
                    "No schema available for this data source. "
                    "Go to Settings > Data Sources and click 'Refresh Schema'."
                )

            schema_context = build_schema_context(schema)

            # Step 4: Determine engine type from query runner
            engine_type = _get_engine_type(data_source)

            # Step 5: Build messages
            from redash import settings

            max_rows = int(getattr(settings, "AI_MAX_RESULT_ROWS", 10000))

            messages = build_messages(
                question=clean_question,
                engine_type=engine_type,
                schema_context=schema_context,
                max_rows=max_rows,
                conversation=conversation,
            )

            # Step 6: Call LLM
            start_time = time.time()
            raw_response = provider_instance.get_completion(messages)
            generation_time_ms = int((time.time() - start_time) * 1000)

            # Step 7: Parse response
            generated_sql, refusal_reason = parse_llm_response(raw_response)

            if refusal_reason:
                log_ai_query(
                    org=org,
                    user=user,
                    data_source_id=data_source.id,
                    question=clean_question,
                    provider=provider_instance.provider_id,
                    model=provider_instance._model,
                    sql=None,
                    validation_passed=None,
                    executed=False,
                    error=refusal_reason,
                )
                return {
                    "sql": None,
                    "explanation": refusal_reason,
                    "tables_used": [],
                    "provider": provider_instance.provider_id,
                    "model": provider_instance._model,
                    "generation_time_ms": generation_time_ms,
                    "refused": True,
                }

            # Step 8: Validate SQL (security-critical)
            generated_sql = validate_sql(generated_sql)
            validation_passed = True

            # Step 9: Extract tables used (best-effort parsing)
            tables_used = _extract_tables(generated_sql)

            # Step 10: Build explanation
            explanation = _build_explanation(clean_question, generated_sql, tables_used, engine_type)

            # Step 11: Audit log (success)
            log_ai_query(
                org=org,
                user=user,
                data_source_id=data_source.id,
                question=clean_question,
                provider=provider_instance.provider_id,
                model=provider_instance._model,
                sql=generated_sql,
                validation_passed=True,
                executed=False,
            )

            return {
                "sql": generated_sql,
                "explanation": explanation,
                "tables_used": tables_used,
                "provider": provider_instance.provider_id,
                "model": provider_instance._model,
                "generation_time_ms": generation_time_ms,
            }

        except (InputSanitizationError, SQLValidationError, AIProviderError, ValueError) as e:
            # Log the failure
            log_ai_query(
                org=org,
                user=user,
                data_source_id=data_source.id,
                question=question[:500],
                provider=provider_instance.provider_id if provider_instance else provider_id,
                model=model,
                sql=generated_sql,
                validation_passed=validation_passed,
                executed=False,
                error=str(e),
            )
            raise

    @staticmethod
    def get_providers():
        """List all available AI providers (no API keys exposed)."""
        return list_providers()


def _get_engine_type(data_source):
    """Extract a human-readable engine type from a data source."""
    runner_type = data_source.type
    # Map common query runner types to SQL dialect names
    engine_map = {
        "pg": "PostgreSQL",
        "mysql": "MySQL",
        "bigquery": "BigQuery",
        "sqlite": "SQLite",
        "mssql": "SQL Server",
        "oracle": "Oracle",
        "redshift": "Amazon Redshift",
        "snowflake": "Snowflake",
        "clickhouse": "ClickHouse",
        "presto": "Presto",
        "athena": "Amazon Athena",
        "databricks": "Databricks SQL",
    }
    return engine_map.get(runner_type, runner_type)


def _extract_tables(sql):
    """
    Best-effort extraction of table names from SQL.
    Uses sqlparse for basic FROM/JOIN clause parsing.
    """
    import sqlparse
    from sqlparse.sql import Identifier, IdentifierList
    from sqlparse.tokens import DML, Keyword

    tables = []
    parsed = sqlparse.parse(sql)
    if not parsed:
        return tables

    stmt = parsed[0]
    from_seen = False

    for token in stmt.tokens:
        if token.ttype is Keyword and token.value.upper() in (
            "FROM",
            "JOIN",
            "INNER JOIN",
            "LEFT JOIN",
            "RIGHT JOIN",
            "FULL JOIN",
            "CROSS JOIN",
        ):
            from_seen = True
            continue

        if from_seen:
            if isinstance(token, Identifier):
                name = token.get_real_name()
                if name:
                    tables.append(name)
                from_seen = False
            elif isinstance(token, IdentifierList):
                for identifier in token.get_identifiers():
                    if isinstance(identifier, Identifier):
                        name = identifier.get_real_name()
                        if name:
                            tables.append(name)
                from_seen = False
            elif token.ttype is not sqlparse.tokens.Whitespace:
                from_seen = False

    return list(dict.fromkeys(tables))  # Deduplicate preserving order


def _build_explanation(question, sql, tables_used, engine_type):
    """Build a simple human-readable explanation of the generated query."""
    table_list = ", ".join(tables_used) if tables_used else "the database"
    return f'Generated a {engine_type} query against {table_list} to answer: "{question}"'
