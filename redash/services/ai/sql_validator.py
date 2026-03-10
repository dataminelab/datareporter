"""
SQL Validator — AST-based validation for AI-generated SQL.

Security-critical module. All AI-generated SQL MUST pass through validate_sql()
before reaching any query runner. Defense-in-depth: AST parsing + keyword blocking
+ dangerous function detection.

References:
- OWASP LLM02 (Insecure Output Handling)
- OWASP LLM06 (Excessive Agency)
- DataReporter Security Spec (PRD-AI-Query-Integration)
"""

import re

import sqlparse
from sqlparse.tokens import DDL, DML, Keyword


class SQLValidationError(Exception):
    """Raised when AI-generated SQL fails validation."""

    def __init__(self, message, sql=None, violation_type=None):
        super().__init__(message)
        self.sql = sql
        self.violation_type = violation_type


# Dangerous PostgreSQL functions that can read files, execute commands, or
# access the network. These MUST be blocked regardless of statement type.
DANGEROUS_FUNCTIONS = frozenset(
    {
        # File system access
        "pg_read_file",
        "pg_read_binary_file",
        "pg_ls_dir",
        "pg_ls_logdir",
        "pg_ls_waldir",
        "pg_ls_tmpdir",
        "pg_ls_archive_statusdir",
        "pg_stat_file",
        # Large object operations (can read/write files)
        "lo_import",
        "lo_export",
        "lo_create",
        "lo_unlink",
        "lo_get",
        "lo_put",
        "lo_from_bytea",
        # Network / external access
        "dblink",
        "dblink_exec",
        "dblink_connect",
        "dblink_send_query",
        # Command execution
        "pg_execute_server_program",
        # Copy operations (can write to filesystem)
        "pg_catalog.pg_read_file",
        # Sleep / timing attacks
        "pg_sleep",
        "pg_sleep_for",
        "pg_sleep_until",
        # Session/config manipulation (can disable logging, change search_path)
        "set_config",
        "current_setting",
        # Advisory locks (can deadlock the database — DoS)
        "pg_advisory_lock",
        "pg_advisory_lock_shared",
        "pg_try_advisory_lock",
        "pg_try_advisory_lock_shared",
        "pg_advisory_unlock",
        "pg_advisory_unlock_shared",
        "pg_advisory_unlock_all",
        # Backend control (can kill other users' sessions)
        "pg_terminate_backend",
        "pg_cancel_backend",
        "pg_reload_conf",
        # XML functions that execute arbitrary SQL internally
        "query_to_xml",
        "query_to_xml_and_xmlschema",
        "cursor_to_xml",
        "table_to_xml",
        "table_to_xml_and_xmlschema",
        # Infrastructure info disclosure
        "inet_server_addr",
        "inet_server_port",
        "inet_client_addr",
        "inet_client_port",
        # MySQL equivalents (for MySQL data sources)
        "sleep",
        "benchmark",
        "load_file",
        # BigQuery equivalents
        "session_user",
        "external_query",
    }
)

# SQL keywords that indicate non-SELECT operations.
# Checked via AST first, then keyword scan as defense-in-depth.
FORBIDDEN_KEYWORDS = frozenset(
    {
        "INSERT",
        "UPDATE",
        "DELETE",
        "DROP",
        "ALTER",
        "CREATE",
        "TRUNCATE",
        "REPLACE",
        "MERGE",
        "GRANT",
        "REVOKE",
        "EXECUTE",
        "EXEC",
        "CALL",
        "EXPLAIN",  # Can leak query plans / internal structure
    }
)

# Patterns that indicate SQL injection attempts or bypass techniques.
INJECTION_PATTERNS = [
    # Multi-statement execution (semicolons followed by new statements)
    re.compile(r";\s*(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|GRANT|REVOKE)", re.IGNORECASE),
    # File output operations
    re.compile(r"INTO\s+(OUTFILE|DUMPFILE|LOCAL)", re.IGNORECASE),
    # COPY TO/FROM (PostgreSQL file operations)
    re.compile(r"\bCOPY\b.*\b(TO|FROM)\b", re.IGNORECASE),
    # Stacked queries via comment tricks
    re.compile(r"/\*.*\*/\s*;", re.IGNORECASE),
    # SELECT INTO (creates tables/files in PostgreSQL, MySQL, MSSQL)
    # Catches all variants: INTO OUTFILE, INTO TABLE, and bare SELECT INTO <name>
    re.compile(r"\bSELECT\b[^;]*\bINTO\b", re.IGNORECASE),
    # System table direct access
    re.compile(r"\bpg_shadow\b|\bpg_authid\b|\bpg_roles\b", re.IGNORECASE),
]


def validate_sql(sql, allow_explain=False):
    """
    Validate AI-generated SQL using AST parsing and pattern matching.

    This is the ONLY gateway between LLM output and query execution.
    Returns the cleaned SQL string if valid, raises SQLValidationError if not.

    Defense-in-depth layers:
    1. Parse with sqlparse — reject if not valid SQL
    2. AST statement type check — only SELECT allowed
    3. Multi-statement check — reject compound queries
    4. Dangerous function scan — block file/network/timing functions
    5. Injection pattern scan — catch bypass attempts
    6. Keyword scan — final safety net

    Args:
        sql: The SQL string to validate.
        allow_explain: If True, allows EXPLAIN SELECT (for debugging). Default False.

    Returns:
        str: The validated, cleaned SQL string.

    Raises:
        SQLValidationError: If validation fails at any layer.
    """
    if not sql or not sql.strip():
        raise SQLValidationError("Empty SQL query", sql=sql, violation_type="empty")

    sql = sql.strip()

    # Remove any trailing semicolons (common LLM artifact)
    sql = sql.rstrip(";").strip()

    # Layer 1: Parse with sqlparse
    try:
        parsed = sqlparse.parse(sql)
    except Exception as e:
        raise SQLValidationError(f"Failed to parse SQL: {e}", sql=sql, violation_type="parse_error")

    if not parsed:
        raise SQLValidationError("No valid SQL statements found", sql=sql, violation_type="parse_error")

    # Layer 2: Multi-statement check — only one statement allowed
    # Filter out empty/whitespace-only statements
    statements = [s for s in parsed if s.tokens and str(s).strip()]
    if len(statements) != 1:
        raise SQLValidationError(
            f"Multiple statements detected ({len(statements)}). Only single SELECT is allowed.",
            sql=sql,
            violation_type="multi_statement",
        )

    stmt = statements[0]

    # Layer 3: AST statement type — must be SELECT (or WITH...SELECT for CTEs)
    _validate_statement_type(stmt, sql, allow_explain)

    # NOTE: EXPLAIN path does NOT return early. Layers 4-6 still run on the
    # full SQL string because EXPLAIN ANALYZE *executes* the query in
    # PostgreSQL. Skipping these layers would allow dangerous functions,
    # injection patterns, and forbidden keywords inside EXPLAIN statements.

    # Layer 4: Dangerous function scan
    sql_lower = sql.lower()
    for func_name in DANGEROUS_FUNCTIONS:
        if func_name.lower() in sql_lower:
            # Double-check it's actually a function call, not a column name
            pattern = re.compile(r"\b" + re.escape(func_name) + r"\s*\(", re.IGNORECASE)
            if pattern.search(sql):
                raise SQLValidationError(
                    f"Dangerous function detected: {func_name}",
                    sql=sql,
                    violation_type="dangerous_function",
                )

    # Layer 5: Injection pattern scan
    for pattern in INJECTION_PATTERNS:
        if pattern.search(sql):
            raise SQLValidationError(
                "Potential SQL injection pattern detected",
                sql=sql,
                violation_type="injection_pattern",
            )

    # Layer 6: Keyword scan (defense-in-depth — catches anything AST missed)
    for token in stmt.flatten():
        if token.ttype in (DML, DDL, Keyword):
            word = token.value.upper()
            if word in FORBIDDEN_KEYWORDS:
                if word == "EXPLAIN" and allow_explain:
                    continue
                raise SQLValidationError(
                    f"Forbidden keyword detected: {word}",
                    sql=sql,
                    violation_type="forbidden_keyword",
                )

    return sql


def _get_first_meaningful_token(stmt):
    """Get the first non-whitespace, non-comment token value."""
    for token in stmt.tokens:
        if token.ttype in (
            sqlparse.tokens.Whitespace,
            sqlparse.tokens.Newline,
            sqlparse.tokens.Comment.Single,
            sqlparse.tokens.Comment.Multiline,
        ):
            continue
        if hasattr(token, "value"):
            return token.value.split()[0] if token.value.strip() else None
    return None


def _validate_statement_type(stmt, sql, allow_explain):
    """Validate that the statement is SELECT, WITH...SELECT, or allowed EXPLAIN."""
    first_token = _get_first_meaningful_token(stmt)
    if first_token is None:
        raise SQLValidationError("Could not determine statement type", sql=sql, violation_type="unknown_type")

    first_word = first_token.upper()

    if first_word == "EXPLAIN":
        if not allow_explain:
            raise SQLValidationError(
                "EXPLAIN statements are not allowed",
                sql=sql,
                violation_type="forbidden_keyword",
            )
        explain_match = re.match(r"^\s*EXPLAIN\s+(ANALYZE\s+)?", sql, re.IGNORECASE)
        if explain_match:
            inner_sql = sql[explain_match.end() :]
            inner_first = _get_first_meaningful_token(sqlparse.parse(inner_sql)[0]) if inner_sql.strip() else None
            if inner_first and inner_first.upper() not in ("SELECT", "WITH"):
                raise SQLValidationError(
                    f"Only SELECT statements are allowed inside EXPLAIN. Got: {inner_first.upper()}",
                    sql=sql,
                    violation_type="non_select",
                )
        return first_word

    if first_word not in ("SELECT", "WITH"):
        raise SQLValidationError(
            f"Only SELECT statements are allowed. Got: {first_word}",
            sql=sql,
            violation_type="non_select",
        )

    if first_word == "WITH":
        _validate_cte_is_select(sql)

    return first_word


def _validate_cte_is_select(sql):
    """
    Validate that a CTE (WITH ... AS ...) ends with a SELECT, not DML.
    CTEs can legitimately wrap INSERT/UPDATE/DELETE (WITH ... INSERT INTO ...).
    We must reject these.
    """
    # Find the last AS (...) block and check what comes after
    # Simple heuristic: the final statement after the last closing paren
    # before any DML keyword
    for keyword in ("INSERT", "UPDATE", "DELETE", "MERGE"):
        # Check if keyword appears outside of CTE definitions
        # Pattern: ) <keyword> (not inside quotes or CTE body)
        pattern = re.compile(r"\)\s*" + keyword + r"\b", re.IGNORECASE)
        if pattern.search(sql):
            raise SQLValidationError(
                f"CTE with {keyword} detected. Only CTE with SELECT is allowed.",
                sql=sql,
                violation_type="cte_dml",
            )
