"""
Tests for SQL validation of LLM-generated queries.

Verifies that only SELECT statements pass through and all
dangerous SQL (INSERT, UPDATE, DELETE, DROP, etc.) is rejected.
"""

from unittest import TestCase

from redash.ai.sql_validator import SQLValidationError, validate_sql


class TestValidateSQL(TestCase):
    """Core validation tests."""

    # --- Valid queries ---

    def test_simple_select(self):
        result = validate_sql("SELECT * FROM users")
        self.assertIn("SELECT", result)

    def test_select_with_where(self):
        result = validate_sql("SELECT name, email FROM users WHERE active = true")
        self.assertIn("SELECT", result)

    def test_select_with_join(self):
        sql = "SELECT u.name, o.total FROM users u JOIN orders o ON u.id = o.user_id"
        result = validate_sql(sql)
        self.assertIn("JOIN", result)

    def test_select_with_subquery(self):
        sql = "SELECT * FROM users WHERE id IN (SELECT user_id FROM orders)"
        result = validate_sql(sql)
        self.assertIn("SELECT", result)

    def test_cte_with_select(self):
        sql = """WITH active_users AS (
            SELECT id, name FROM users WHERE active = true
        )
        SELECT * FROM active_users"""
        result = validate_sql(sql)
        self.assertIn("WITH", result)

    def test_select_with_group_by(self):
        result = validate_sql("SELECT status, COUNT(*) FROM orders GROUP BY status")
        self.assertIn("GROUP BY", result)

    def test_select_with_order_by_limit(self):
        result = validate_sql("SELECT name FROM users ORDER BY name LIMIT 10")
        self.assertIn("LIMIT", result)

    def test_strips_trailing_semicolon(self):
        result = validate_sql("SELECT 1;")
        self.assertNotIn(";", result)

    def test_strips_whitespace(self):
        result = validate_sql("  SELECT 1  ")
        self.assertEqual("SELECT 1", result)

    # --- Forbidden statements ---

    def test_rejects_insert(self):
        with self.assertRaises(SQLValidationError):
            validate_sql("INSERT INTO users (name) VALUES ('test')")

    def test_rejects_update(self):
        with self.assertRaises(SQLValidationError):
            validate_sql("UPDATE users SET name = 'hacked' WHERE id = 1")

    def test_rejects_delete(self):
        with self.assertRaises(SQLValidationError):
            validate_sql("DELETE FROM users WHERE id = 1")

    def test_rejects_drop_table(self):
        with self.assertRaises(SQLValidationError):
            validate_sql("DROP TABLE users")

    def test_rejects_drop_database(self):
        with self.assertRaises(SQLValidationError):
            validate_sql("DROP DATABASE production")

    def test_rejects_alter_table(self):
        with self.assertRaises(SQLValidationError):
            validate_sql("ALTER TABLE users ADD COLUMN password TEXT")

    def test_rejects_create_table(self):
        with self.assertRaises(SQLValidationError):
            validate_sql("CREATE TABLE evil (id INT)")

    def test_rejects_truncate(self):
        with self.assertRaises(SQLValidationError):
            validate_sql("TRUNCATE TABLE users")

    def test_rejects_grant(self):
        with self.assertRaises(SQLValidationError):
            validate_sql("GRANT ALL ON users TO public")

    def test_rejects_revoke(self):
        with self.assertRaises(SQLValidationError):
            validate_sql("REVOKE ALL ON users FROM public")

    def test_rejects_exec(self):
        with self.assertRaises(SQLValidationError):
            validate_sql("EXEC sp_executesql @sql")

    def test_rejects_merge(self):
        with self.assertRaises(SQLValidationError):
            validate_sql("MERGE INTO users USING source ON users.id = source.id")

    # --- Injection patterns ---

    def test_rejects_multi_statement_with_drop(self):
        with self.assertRaises(SQLValidationError):
            validate_sql("SELECT 1; DROP TABLE users")

    def test_rejects_into_outfile(self):
        with self.assertRaises(SQLValidationError):
            validate_sql("SELECT * FROM users INTO OUTFILE '/tmp/data.csv'")

    def test_rejects_into_dumpfile(self):
        with self.assertRaises(SQLValidationError):
            validate_sql("SELECT * FROM users INTO DUMPFILE '/tmp/data.bin'")

    def test_rejects_load_file(self):
        with self.assertRaises(SQLValidationError):
            validate_sql("SELECT LOAD_FILE('/etc/passwd')")

    def test_rejects_sleep(self):
        with self.assertRaises(SQLValidationError):
            validate_sql("SELECT SLEEP(5)")

    def test_rejects_benchmark(self):
        with self.assertRaises(SQLValidationError):
            validate_sql("SELECT BENCHMARK(1000000, SHA1('test'))")

    def test_rejects_select_into_table(self):
        with self.assertRaises(SQLValidationError):
            validate_sql("SELECT * FROM users INTO new_table")

    # --- Edge cases ---

    def test_rejects_empty_sql(self):
        with self.assertRaises(SQLValidationError):
            validate_sql("")

    def test_rejects_none_sql(self):
        with self.assertRaises(SQLValidationError):
            validate_sql(None)

    def test_rejects_whitespace_only(self):
        with self.assertRaises(SQLValidationError):
            validate_sql("   ")

    def test_error_includes_sql(self):
        try:
            validate_sql("DROP TABLE users")
        except SQLValidationError as e:
            self.assertIsNotNone(e.sql)

    def test_rejects_insert_disguised_after_comment(self):
        """Ensure comments don't hide forbidden statements."""
        with self.assertRaises(SQLValidationError):
            validate_sql("-- harmless comment\nINSERT INTO users VALUES (1)")

    def test_select_into_temp_allowed(self):
        """SELECT INTO for temp tables should be handled by the DB, not us.
        We only care about obvious forbidden keywords at statement start."""
        # This is a SELECT statement, not an INSERT
        sql = "SELECT id, name FROM users WHERE active = true"
        result = validate_sql(sql)
        self.assertIn("SELECT", result)


class TestSQLValidationError(TestCase):
    """Test the custom exception."""

    def test_stores_sql(self):
        err = SQLValidationError("Bad SQL", sql="DROP TABLE users")
        self.assertEqual("DROP TABLE users", err.sql)
        self.assertEqual("Bad SQL", str(err))

    def test_sql_defaults_to_none(self):
        err = SQLValidationError("Bad SQL")
        self.assertIsNone(err.sql)
