"""
Schema Context Builder — Minimizes database schema information sent to LLMs.

Follows data minimization principle: only table names and column names/types
are sent. No default values, constraints, comments, or system tables.
Truncates to a configurable token budget to control LLM costs and context window.

References:
- OWASP LLM07 (System Prompt Leakage)
- DataReporter Security Spec (PRD-AI-Query-Integration)
"""

# System/internal schemas to exclude from LLM context.
# These contain PostgreSQL internals that should never be queried by users.
EXCLUDED_SCHEMAS = frozenset(
    {
        "pg_catalog",
        "pg_toast",
        "information_schema",
        "pg_temp_1",
        "pg_toast_temp_1",
        # DataReporter internal tables
        "redash",
    }
)

# Tables to exclude even if they're in user schemas.
# These are DataReporter's own metadata tables.
EXCLUDED_TABLE_PREFIXES = (
    "alembic_",
    "celery_",
    "rq_",
)

# Approximate characters per token (conservative estimate for SQL context).
CHARS_PER_TOKEN = 4

# Default maximum tokens for schema context.
DEFAULT_MAX_TOKENS = 4000


def build_schema_context(data_source_schema, max_tokens=DEFAULT_MAX_TOKENS):
    """
    Build a minimized schema context string from a DataSource's cached schema.

    The schema is already cached in DataSource.schema and refreshed every 30 minutes
    by the RQ scheduler. This function filters and formats it for LLM consumption.

    Args:
        data_source_schema: The schema list from DataSource.schema
            (list of dicts with 'name' and 'columns' keys).
        max_tokens: Maximum approximate token budget for the context.

    Returns:
        str: Formatted schema string, truncated to token budget.
    """
    if not data_source_schema:
        return "No schema information available."

    max_chars = max_tokens * CHARS_PER_TOKEN
    lines = []
    current_chars = 0

    for table in data_source_schema:
        table_name = table.get("name", "")

        # Skip system schemas
        if _is_excluded_table(table_name):
            continue

        columns = table.get("columns", [])
        if not columns:
            line = f"TABLE {table_name}: (no columns available)"
        else:
            col_parts = []
            for col in columns:
                col_name = col.get("name", "unknown")
                col_type = col.get("type", "")
                if col_type:
                    col_parts.append(f"{col_name} ({col_type})")
                else:
                    col_parts.append(col_name)
            line = f"TABLE {table_name}: {', '.join(col_parts)}"

        # Check token budget before adding
        line_chars = len(line) + 1  # +1 for newline
        if current_chars + line_chars > max_chars:
            lines.append(f"... ({len(data_source_schema) - len(lines)} more tables truncated due to size limit)")
            break

        lines.append(line)
        current_chars += line_chars

    if not lines:
        return "No user tables found in schema."

    return "\n".join(lines)


def _is_excluded_table(table_name):
    """Check if a table should be excluded from LLM context."""
    # Check schema prefix (e.g., "pg_catalog.pg_class")
    if "." in table_name:
        schema = table_name.split(".")[0]
        if schema in EXCLUDED_SCHEMAS:
            return True

    # Check table name prefixes
    base_name = table_name.split(".")[-1] if "." in table_name else table_name
    if base_name.startswith(EXCLUDED_TABLE_PREFIXES):
        return True

    return False
