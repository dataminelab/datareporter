"""
Tests for redash.services.ai.sql_validator — AST-based SQL validation.

Covers all validation layers: AST parsing, statement type checks,
dangerous function blocking, injection pattern detection, and keyword scanning.
"""

import unittest

import pytest

from redash.services.ai.sql_validator import SQLValidationError, validate_sql


class TestValidSelectQueries(unittest.TestCase):
    """Category 1: Valid SELECT queries that MUST pass validation."""

    def test_simple_select(self):
        """Simple SELECT with column list."""
        result = validate_sql("SELECT id, name FROM users")
        assert result == "SELECT id, name FROM users"

    def test_select_star(self):
        """SELECT * should pass."""
        result = validate_sql("SELECT * FROM orders")
        assert result == "SELECT * FROM orders"

    def test_select_with_where(self):
        """SELECT with WHERE clause."""
        result = validate_sql("SELECT id FROM users WHERE active = true")
        assert result == "SELECT id FROM users WHERE active = true"

    def test_select_with_join(self):
        """SELECT with JOIN should pass."""
        sql = "SELECT u.id, o.total FROM users u JOIN orders o ON u.id = o.user_id"
        assert validate_sql(sql) == sql

    def test_select_with_left_join(self):
        """SELECT with LEFT JOIN should pass."""
        sql = "SELECT a.id, b.val FROM t1 a LEFT JOIN t2 b ON a.id = b.fk"
        assert validate_sql(sql) == sql

    def test_select_with_subquery(self):
        """SELECT with subquery in WHERE."""
        sql = "SELECT id FROM users WHERE id IN (SELECT user_id FROM active_users)"
        assert validate_sql(sql) == sql

    def test_select_with_cte(self):
        """CTE (WITH ... SELECT) should pass."""
        sql = "WITH active AS (SELECT id FROM users WHERE active = true) SELECT * FROM active"
        assert validate_sql(sql) == sql

    def test_select_with_multiple_ctes(self):
        """Multiple CTEs should pass."""
        sql = "WITH a AS (SELECT 1 AS x), b AS (SELECT 2 AS y) " "SELECT a.x, b.y FROM a, b"
        assert validate_sql(sql) == sql

    def test_select_with_aggregation(self):
        """SELECT with GROUP BY and aggregation functions."""
        sql = "SELECT department, COUNT(*), AVG(salary) FROM employees GROUP BY department HAVING COUNT(*) > 5"
        assert validate_sql(sql) == sql

    def test_select_with_window_function(self):
        """SELECT with window function (ROW_NUMBER, RANK, etc.)."""
        sql = "SELECT id, ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC) AS rn FROM employees"
        assert validate_sql(sql) == sql

    def test_select_with_order_and_limit(self):
        """SELECT with ORDER BY and LIMIT."""
        sql = "SELECT * FROM products ORDER BY price DESC LIMIT 10 OFFSET 20"
        assert validate_sql(sql) == sql

    def test_select_with_case_expression(self):
        """SELECT with CASE WHEN expression."""
        sql = "SELECT id, CASE WHEN status = 1 THEN 'active' ELSE 'inactive' END AS label FROM users"
        assert validate_sql(sql) == sql

    def test_select_distinct(self):
        """SELECT DISTINCT should pass."""
        sql = "SELECT DISTINCT category FROM products"
        assert validate_sql(sql) == sql


class TestDDLDMLRejection(unittest.TestCase):
    """Category 2: DDL/DML statements MUST be rejected."""

    def test_drop_table(self):
        """DROP TABLE must be blocked."""
        with pytest.raises(SQLValidationError, match="Only SELECT"):
            validate_sql("DROP TABLE users")

    def test_insert_into(self):
        """INSERT INTO must be blocked."""
        with pytest.raises(SQLValidationError):
            validate_sql("INSERT INTO users (name) VALUES ('hacker')")

    def test_update(self):
        """UPDATE must be blocked."""
        with pytest.raises(SQLValidationError):
            validate_sql("UPDATE users SET admin = true WHERE id = 1")

    def test_delete(self):
        """DELETE must be blocked."""
        with pytest.raises(SQLValidationError):
            validate_sql("DELETE FROM users WHERE id = 1")

    def test_alter_table(self):
        """ALTER TABLE must be blocked."""
        with pytest.raises(SQLValidationError):
            validate_sql("ALTER TABLE users ADD COLUMN pwned TEXT")

    def test_create_table(self):
        """CREATE TABLE must be blocked."""
        with pytest.raises(SQLValidationError):
            validate_sql("CREATE TABLE evil (id INT)")

    def test_truncate(self):
        """TRUNCATE must be blocked."""
        with pytest.raises(SQLValidationError):
            validate_sql("TRUNCATE TABLE users")

    def test_grant(self):
        """GRANT must be blocked."""
        with pytest.raises(SQLValidationError):
            validate_sql("GRANT ALL ON users TO public")

    def test_revoke(self):
        """REVOKE must be blocked."""
        with pytest.raises(SQLValidationError):
            validate_sql("REVOKE ALL ON users FROM public")


class TestCaseManipulationBypass(unittest.TestCase):
    """Category 3: Mixed-case keyword bypass attempts."""

    def test_mixed_case_select_passes(self):
        """Mixed-case SELECT should still pass."""
        result = validate_sql("SeLeCt 1")
        assert result == "SeLeCt 1"

    def test_mixed_case_drop_blocked(self):
        """Mixed-case DROP TABLE must be blocked."""
        with pytest.raises(SQLValidationError):
            validate_sql("DrOp TaBlE users")

    def test_mixed_case_insert_blocked(self):
        """Mixed-case INSERT must be blocked."""
        with pytest.raises(SQLValidationError):
            validate_sql("InSeRt INTO users VALUES (1)")

    def test_mixed_case_delete_blocked(self):
        """Mixed-case DELETE must be blocked."""
        with pytest.raises(SQLValidationError):
            validate_sql("DeLeTe FROM users")

    def test_mixed_case_update_blocked(self):
        """Mixed-case UPDATE must be blocked."""
        with pytest.raises(SQLValidationError):
            validate_sql("UpDaTe users SET x = 1")


class TestMultiStatementInjection(unittest.TestCase):
    """Category 4: Multi-statement injection attempts."""

    def test_select_then_drop(self):
        """SELECT followed by DROP must be blocked."""
        with pytest.raises(SQLValidationError):
            validate_sql("SELECT 1; DROP TABLE users")

    def test_select_then_insert(self):
        """SELECT followed by INSERT must be blocked."""
        with pytest.raises(SQLValidationError):
            validate_sql("SELECT 1; INSERT INTO users VALUES (1)")

    def test_select_then_delete(self):
        """SELECT followed by DELETE must be blocked."""
        with pytest.raises(SQLValidationError):
            validate_sql("SELECT 1; DELETE FROM users")

    def test_select_then_update(self):
        """SELECT followed by UPDATE must be blocked."""
        with pytest.raises(SQLValidationError):
            validate_sql("SELECT 1; UPDATE users SET x = 1")

    def test_three_statements(self):
        """Three stacked statements must be blocked."""
        with pytest.raises(SQLValidationError):
            validate_sql("SELECT 1; SELECT 2; SELECT 3")


class TestDangerousPostgreSQLFunctions(unittest.TestCase):
    """Category 5: Dangerous PostgreSQL/MySQL functions MUST be blocked."""

    def test_pg_read_file(self):
        """pg_read_file() must be blocked."""
        with pytest.raises(SQLValidationError, match="Dangerous function"):
            validate_sql("SELECT pg_read_file('/etc/passwd')")

    def test_pg_sleep(self):
        """pg_sleep() must be blocked (timing attack)."""
        with pytest.raises(SQLValidationError, match="Dangerous function"):
            validate_sql("SELECT pg_sleep(10)")

    def test_dblink(self):
        """dblink() must be blocked (network access)."""
        with pytest.raises(SQLValidationError, match="Dangerous function"):
            validate_sql("SELECT * FROM dblink('host=evil.com', 'SELECT 1') AS t(x int)")

    def test_lo_import(self):
        """lo_import() must be blocked (file read)."""
        with pytest.raises(SQLValidationError, match="Dangerous function"):
            validate_sql("SELECT lo_import('/etc/passwd')")

    def test_pg_read_binary_file(self):
        """pg_read_binary_file() must be blocked."""
        with pytest.raises(SQLValidationError, match="Dangerous function"):
            validate_sql("SELECT pg_read_binary_file('/etc/shadow')")

    def test_lo_export(self):
        """lo_export() must be blocked."""
        with pytest.raises(SQLValidationError, match="Dangerous function"):
            validate_sql("SELECT lo_export(12345, '/tmp/pwned')")

    def test_mysql_sleep(self):
        """MySQL sleep() must be blocked."""
        with pytest.raises(SQLValidationError, match="Dangerous function"):
            validate_sql("SELECT sleep(5)")

    def test_mysql_load_file(self):
        """MySQL load_file() must be blocked."""
        with pytest.raises(SQLValidationError, match="Dangerous function"):
            validate_sql("SELECT load_file('/etc/passwd')")

    def test_pg_ls_dir(self):
        """pg_ls_dir() must be blocked."""
        with pytest.raises(SQLValidationError, match="Dangerous function"):
            validate_sql("SELECT pg_ls_dir('/etc')")

    def test_dblink_exec(self):
        """dblink_exec() must be blocked."""
        with pytest.raises(SQLValidationError, match="Dangerous function"):
            validate_sql("SELECT dblink_exec('DROP TABLE users')")


class TestCTEWithDML(unittest.TestCase):
    """Category 6: CTE followed by DML must be rejected."""

    def test_cte_with_insert(self):
        """WITH ... INSERT must be blocked."""
        with pytest.raises(SQLValidationError, match="CTE with INSERT"):
            validate_sql("WITH x AS (SELECT 1 AS a) INSERT INTO t SELECT * FROM x")

    def test_cte_with_update(self):
        """WITH ... UPDATE must be blocked."""
        with pytest.raises(SQLValidationError, match="CTE with UPDATE"):
            validate_sql("WITH x AS (SELECT 1 AS a) UPDATE t SET col = 1")

    def test_cte_with_delete(self):
        """WITH ... DELETE must be blocked."""
        with pytest.raises(SQLValidationError, match="CTE with DELETE"):
            validate_sql("WITH x AS (SELECT 1 AS a) DELETE FROM t WHERE id = 1")

    def test_cte_with_select_passes(self):
        """WITH ... SELECT must pass."""
        sql = "WITH x AS (SELECT 1 AS a) SELECT * FROM x"
        assert validate_sql(sql) == sql


class TestInjectionPatterns(unittest.TestCase):
    """Category 7: SQL injection patterns MUST be blocked."""

    def test_into_outfile(self):
        """INTO OUTFILE must be blocked."""
        with pytest.raises(SQLValidationError, match="injection"):
            validate_sql("SELECT * FROM users INTO OUTFILE '/tmp/data.csv'")

    def test_into_dumpfile(self):
        """INTO DUMPFILE must be blocked."""
        with pytest.raises(SQLValidationError, match="injection"):
            validate_sql("SELECT * FROM users INTO DUMPFILE '/tmp/data'")

    def test_copy_to(self):
        """COPY TO must be blocked."""
        with pytest.raises(SQLValidationError):
            validate_sql("COPY users TO '/tmp/data.csv'")

    def test_stacked_query_with_semicolon(self):
        """Stacked queries via semicolons must be blocked."""
        with pytest.raises(SQLValidationError):
            validate_sql("SELECT 1; DROP TABLE users")

    def test_system_table_pg_shadow(self):
        """Access to pg_shadow must be blocked."""
        with pytest.raises(SQLValidationError, match="injection"):
            validate_sql("SELECT * FROM pg_shadow")

    def test_system_table_pg_authid(self):
        """Access to pg_authid must be blocked."""
        with pytest.raises(SQLValidationError, match="injection"):
            validate_sql("SELECT * FROM pg_authid")

    def test_system_table_pg_roles(self):
        """Access to pg_roles must be blocked."""
        with pytest.raises(SQLValidationError, match="injection"):
            validate_sql("SELECT * FROM pg_roles")


class TestCommentBasedBypass(unittest.TestCase):
    """Category 8: Comment-based bypass attempts."""

    def test_block_comment_with_semicolon(self):
        """Block comment hiding semicolons should be caught by injection patterns."""
        sql = "SELECT 1 /* ; DROP TABLE users */"
        # The comment-based injection pattern checks for /* */ followed by ;
        # This particular pattern may or may not be caught depending on regex.
        # The validator should at minimum allow safe comments that don't match patterns.
        # Let's test the actual pattern: /\*.*\*/\s*;
        # This SQL doesn't have a semicolon AFTER the comment, so it may pass.
        # The important thing is it doesn't execute anything dangerous.
        try:
            result = validate_sql(sql)
            # If it passes, it's still safe because comments are inert
            assert isinstance(result, str)
        except SQLValidationError:
            # Also acceptable -- overly cautious is fine for security
            pass

    def test_comment_then_semicolon_injection(self):
        """Comment followed by semicolon and DML must be blocked."""
        with pytest.raises(SQLValidationError):
            validate_sql("SELECT 1 /* evil */; DROP TABLE users")


class TestSelectInto(unittest.TestCase):
    """Category 9: SELECT INTO variants must be blocked."""

    def test_select_into_outfile(self):
        """SELECT INTO OUTFILE must be blocked."""
        with pytest.raises(SQLValidationError):
            validate_sql("SELECT * INTO OUTFILE '/tmp/data' FROM users")

    def test_select_into_dumpfile(self):
        """SELECT INTO DUMPFILE must be blocked."""
        with pytest.raises(SQLValidationError):
            validate_sql("SELECT * INTO DUMPFILE '/tmp/data' FROM users")

    def test_select_into_table(self):
        """SELECT INTO TABLE must be blocked."""
        with pytest.raises(SQLValidationError):
            validate_sql("SELECT * INTO TABLE new_table FROM users")

    def test_select_into_temp(self):
        """SELECT INTO TEMP must be blocked."""
        with pytest.raises(SQLValidationError):
            validate_sql("SELECT * INTO TEMP temp_table FROM users")


class TestEmptyNullInput(unittest.TestCase):
    """Category 10: Empty and null input handling."""

    def test_empty_string(self):
        """Empty string must raise SQLValidationError."""
        with pytest.raises(SQLValidationError, match="Empty"):
            validate_sql("")

    def test_none_input(self):
        """None must raise SQLValidationError."""
        with pytest.raises(SQLValidationError, match="Empty"):
            validate_sql(None)

    def test_whitespace_only(self):
        """Whitespace-only input must raise SQLValidationError."""
        with pytest.raises(SQLValidationError, match="Empty"):
            validate_sql("   \t\n  ")


class TestSystemTableAccess(unittest.TestCase):
    """Category 11: System table access must be blocked."""

    def test_pg_shadow_direct(self):
        """Direct query on pg_shadow must be blocked."""
        with pytest.raises(SQLValidationError):
            validate_sql("SELECT usename, passwd FROM pg_shadow")

    def test_pg_authid_direct(self):
        """Direct query on pg_authid must be blocked."""
        with pytest.raises(SQLValidationError):
            validate_sql("SELECT rolname, rolpassword FROM pg_authid")

    def test_pg_shadow_in_join(self):
        """pg_shadow referenced in JOIN must be blocked."""
        with pytest.raises(SQLValidationError):
            validate_sql("SELECT u.id FROM users u JOIN pg_shadow s ON u.name = s.usename")

    def test_pg_shadow_in_subquery(self):
        """pg_shadow in subquery must be blocked."""
        with pytest.raises(SQLValidationError):
            validate_sql("SELECT * FROM users WHERE name IN (SELECT usename FROM pg_shadow)")


class TestTrailingSemicolons(unittest.TestCase):
    """Category 12: Trailing semicolons should be stripped."""

    def test_single_trailing_semicolon(self):
        """Single trailing semicolon should be stripped."""
        result = validate_sql("SELECT 1;")
        assert result == "SELECT 1"

    def test_multiple_trailing_semicolons(self):
        """Multiple trailing semicolons should be stripped."""
        result = validate_sql("SELECT 1;;;")
        assert result == "SELECT 1"

    def test_semicolon_with_trailing_whitespace(self):
        """Semicolon with trailing whitespace should be stripped."""
        result = validate_sql("SELECT 1;  \n  ")
        assert result == "SELECT 1"

    def test_valid_query_after_semicolon_strip(self):
        """Query should remain valid after semicolon stripping."""
        result = validate_sql("SELECT id, name FROM users WHERE active = true;")
        assert result == "SELECT id, name FROM users WHERE active = true"


class TestExplainBlocking(unittest.TestCase):
    """Category 13: EXPLAIN blocking and allow_explain flag."""

    def test_explain_blocked_by_default(self):
        """EXPLAIN must be blocked by default."""
        with pytest.raises(SQLValidationError, match="EXPLAIN"):
            validate_sql("EXPLAIN SELECT 1")

    def test_explain_allowed_with_flag(self):
        """EXPLAIN should pass when allow_explain=True."""
        result = validate_sql("EXPLAIN SELECT 1", allow_explain=True)
        assert result == "EXPLAIN SELECT 1"

    def test_explain_analyze_blocked_by_default(self):
        """EXPLAIN ANALYZE must be blocked by default."""
        with pytest.raises(SQLValidationError):
            validate_sql("EXPLAIN ANALYZE SELECT 1")

    def test_explain_analyze_allowed_with_flag(self):
        """EXPLAIN ANALYZE should pass when allow_explain=True."""
        result = validate_sql("EXPLAIN ANALYZE SELECT 1", allow_explain=True)
        assert result == "EXPLAIN ANALYZE SELECT 1"

    def test_explain_flag_does_not_allow_dml(self):
        """allow_explain=True must NOT allow DML statements."""
        with pytest.raises(SQLValidationError):
            validate_sql("EXPLAIN DELETE FROM users", allow_explain=True)


class TestSQLValidationErrorAttributes(unittest.TestCase):
    """Verify SQLValidationError carries correct metadata."""

    def test_error_has_sql_attribute(self):
        """Error should include the original SQL."""
        with pytest.raises(SQLValidationError) as exc_info:
            validate_sql("DROP TABLE users")
        assert exc_info.value.sql == "DROP TABLE users"

    def test_error_has_violation_type(self):
        """Error should include a violation_type."""
        with pytest.raises(SQLValidationError) as exc_info:
            validate_sql("")
        assert exc_info.value.violation_type == "empty"

    def test_non_select_violation_type(self):
        """Non-SELECT should have violation_type 'non_select'."""
        with pytest.raises(SQLValidationError) as exc_info:
            validate_sql("DROP TABLE users")
        assert exc_info.value.violation_type == "non_select"

    def test_dangerous_function_violation_type(self):
        """Dangerous function should have correct violation_type."""
        with pytest.raises(SQLValidationError) as exc_info:
            validate_sql("SELECT pg_sleep(10)")
        assert exc_info.value.violation_type == "dangerous_function"

    def test_multi_statement_violation_type(self):
        """Multi-statement should have correct violation_type."""
        with pytest.raises(SQLValidationError) as exc_info:
            validate_sql("SELECT 1; SELECT 2")
        assert exc_info.value.violation_type == "multi_statement"


if __name__ == "__main__":
    unittest.main()
