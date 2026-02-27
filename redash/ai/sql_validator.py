"""
SQL validation for LLM-generated queries.

Defense-in-depth: validates that generated SQL is safe to present to users.
Only SELECT statements are allowed. DDL and DML are rejected.
"""

import logging
import re

import sqlparse

logger = logging.getLogger(__name__)

# Dangerous statement types that must never pass through
FORBIDDEN_KEYWORDS = {
    "INSERT",
    "UPDATE",
    "DELETE",
    "DROP",
    "ALTER",
    "CREATE",
    "TRUNCATE",
    "GRANT",
    "REVOKE",
    "EXEC",
    "EXECUTE",
    "CALL",
    "MERGE",
    "REPLACE",
    "LOAD",
    "COPY",
    "VACUUM",
    "REINDEX",
    "CLUSTER",
    "COMMENT",
    "LOCK",
    "UNLOCK",
    "RENAME",
}


class SQLValidationError(Exception):
    """Raised when generated SQL fails safety validation."""

    def __init__(self, message, sql=None):
        self.sql = sql
        super().__init__(message)


def validate_sql(sql):
    """
    Validate that SQL is safe (SELECT only).

    Args:
        sql: The SQL string to validate.

    Returns:
        str: The validated SQL string (cleaned up).

    Raises:
        SQLValidationError: If SQL contains forbidden statements.
    """
    if not sql or not sql.strip():
        raise SQLValidationError("Empty SQL query generated.")

    cleaned = sql.strip()

    # Remove trailing semicolons for cleaner handling
    cleaned = cleaned.rstrip(";").strip()

    # Parse with sqlparse
    parsed_statements = sqlparse.parse(cleaned)

    if not parsed_statements:
        raise SQLValidationError("Could not parse generated SQL.", sql=cleaned)

    for statement in parsed_statements:
        stmt_type = statement.get_type()

        # sqlparse returns 'SELECT' for SELECT, 'UNKNOWN' for CTEs etc.
        # We allow SELECT and UNKNOWN (CTEs with WITH...SELECT are typed UNKNOWN)
        if stmt_type and stmt_type.upper() not in ("SELECT", "UNKNOWN", None):
            raise SQLValidationError(
                f"Forbidden SQL statement type: {stmt_type}. Only SELECT queries are allowed.",
                sql=cleaned,
            )

    # Additional keyword-based check (belt AND suspenders)
    # Check the first significant token of each statement
    for statement in parsed_statements:
        first_token = _get_first_keyword(statement)
        if first_token and first_token.upper() in FORBIDDEN_KEYWORDS:
            raise SQLValidationError(
                f"Forbidden SQL keyword: {first_token}. Only SELECT queries are allowed.",
                sql=cleaned,
            )

    # Check for multi-statement injection attempts (semicolons hiding additional commands)
    # After splitting, we should have at most one real statement
    real_statements = [s for s in parsed_statements if s.get_type() is not None or str(s).strip()]
    if len(real_statements) > 1:
        # Check if any non-first statement is dangerous
        for stmt in real_statements[1:]:
            first_kw = _get_first_keyword(stmt)
            if first_kw and first_kw.upper() in FORBIDDEN_KEYWORDS:
                raise SQLValidationError(
                    "Multi-statement SQL injection detected. Only single SELECT queries are allowed.",
                    sql=cleaned,
                )

    # Final regex check for common injection patterns
    upper_sql = cleaned.upper()
    injection_patterns = [
        r"\bSELECT\b.*\bINTO\s+(?!@)\w",  # SELECT INTO table (but allow INTO @var)
        r"\bINTO\s+OUTFILE\b",
        r"\bINTO\s+DUMPFILE\b",
        r"\bLOAD_FILE\b",
        r"\bSLEEP\s*\(",
        r"\bBENCHMARK\s*\(",
        r"\bEXP\s*\(\s*~",
    ]
    for pattern in injection_patterns:
        if re.search(pattern, upper_sql):
            raise SQLValidationError(
                "Potentially dangerous SQL pattern detected.",
                sql=cleaned,
            )

    return cleaned


def _get_first_keyword(statement):
    """Get the first keyword token from a SQL statement."""
    for token in statement.tokens:
        if token.ttype is sqlparse.tokens.Keyword or token.ttype is sqlparse.tokens.Keyword.DDL or token.ttype is sqlparse.tokens.Keyword.DML:
            return str(token).strip()
        if token.ttype is sqlparse.tokens.Keyword.CTE:
            return str(token).strip()
        # Skip whitespace and comments
        if token.is_whitespace or token.ttype in (sqlparse.tokens.Comment.Single, sqlparse.tokens.Comment.Multiline):
            continue
        # If first real token is not a keyword, check its text
        text = str(token).strip().split()[0] if str(token).strip() else ""
        if text:
            return text
    return None
