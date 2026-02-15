"""Tests for plywood.dialect module - all 5 SQL dialects."""
from __future__ import annotations

import pytest
from datetime import datetime, timezone

from plywood.dialect.postgres import PostgresDialect
from plywood.dialect.mysql import MySQLDialect
from plywood.dialect.bigquery import BigQueryDialect
from plywood.dialect.athena import AthenaDialect
from plywood.dialect.druid import DruidDialect


@pytest.fixture
def pg():
    return PostgresDialect()


@pytest.fixture
def mysql():
    return MySQLDialect()


@pytest.fixture
def bq():
    return BigQueryDialect()


@pytest.fixture
def athena():
    return AthenaDialect()


@pytest.fixture
def druid():
    return DruidDialect()


ALL_DIALECTS_PARAMS = [
    "pg", "mysql", "bq", "athena", "druid",
]


# ---------------------------------------------------------------------------
# escape_name
# ---------------------------------------------------------------------------

class TestEscapeName:
    def test_postgres_uses_double_quotes(self, pg):
        assert pg.escape_name("column") == '"column"'

    def test_mysql_uses_backticks(self, mysql):
        assert mysql.escape_name("column") == "`column`"

    def test_bigquery_uses_backticks(self, bq):
        assert bq.escape_name("column") == "`column`"

    def test_athena_uses_double_quotes(self, athena):
        assert athena.escape_name("column") == '"column"'

    def test_druid_uses_double_quotes(self, druid):
        assert druid.escape_name("column") == '"column"'

    def test_postgres_escapes_internal_quotes(self, pg):
        assert pg.escape_name('col"name') == '"col""name"'

    def test_mysql_escapes_internal_backticks(self, mysql):
        assert mysql.escape_name("col`name") == "`col``name`"

    def test_bigquery_escapes_internal_backticks(self, bq):
        assert bq.escape_name("col`name") == "`col``name`"


# ---------------------------------------------------------------------------
# escape_literal
# ---------------------------------------------------------------------------

class TestEscapeLiteral:
    def test_postgres_string(self, pg):
        assert pg.escape_literal("hello") == "'hello'"

    def test_postgres_single_quote_escape(self, pg):
        assert pg.escape_literal("it's") == "'it''s'"

    def test_postgres_none_returns_null(self, pg):
        assert pg.escape_literal(None) == "NULL"

    def test_mysql_string(self, mysql):
        # MySQL uses json.dumps for escaping
        result = mysql.escape_literal("hello")
        assert "hello" in result

    def test_mysql_none_returns_null(self, mysql):
        assert mysql.escape_literal(None) == "NULL"

    def test_druid_string(self, druid):
        assert druid.escape_literal("hello") == "'hello'"


# ---------------------------------------------------------------------------
# time_to_sql
# ---------------------------------------------------------------------------

class TestTimeToSql:
    def test_postgres(self, pg):
        dt = datetime(2025, 6, 15, 12, 30, 0)
        sql = pg.time_to_sql(dt)
        assert "TIMESTAMP" in sql
        assert "2025-06-15" in sql

    def test_mysql(self, mysql):
        dt = datetime(2025, 6, 15, 12, 30, 0)
        sql = mysql.time_to_sql(dt)
        assert "TIMESTAMP" in sql
        assert "2025-06-15" in sql

    def test_bigquery(self, bq):
        dt = datetime(2025, 6, 15, 12, 30, 0)
        sql = bq.time_to_sql(dt)
        assert "TIMESTAMP" in sql
        assert "2025-06-15" in sql

    def test_athena(self, athena):
        dt = datetime(2025, 6, 15, 12, 30, 0)
        sql = athena.time_to_sql(dt)
        assert "from_iso8601_timestamp" in sql
        assert "2025-06-15" in sql

    def test_druid(self, druid):
        dt = datetime(2025, 6, 15, 12, 30, 0)
        sql = druid.time_to_sql(dt)
        assert "TIMESTAMP" in sql
        assert "2025-06-15" in sql

    def test_postgres_midnight_short_format(self, pg):
        dt = datetime(2025, 6, 15, 0, 0, 0)
        sql = pg.time_to_sql(dt)
        assert "2025-06-15" in sql


# ---------------------------------------------------------------------------
# boolean_to_sql
# ---------------------------------------------------------------------------

class TestBooleanToSql:
    def test_true(self, pg):
        assert pg.boolean_to_sql(True) == "TRUE"

    def test_false(self, pg):
        assert pg.boolean_to_sql(False) == "FALSE"

    def test_mysql_true(self, mysql):
        assert mysql.boolean_to_sql(True) == "TRUE"


# ---------------------------------------------------------------------------
# time_floor_expression
# ---------------------------------------------------------------------------

class TestTimeFloorExpression:
    def test_postgres_p1d(self, pg):
        sql = pg.time_floor_expression('"__time"', "P1D", "Etc/UTC")
        assert "DATE_TRUNC('day'" in sql

    def test_postgres_pt1h(self, pg):
        sql = pg.time_floor_expression('"__time"', "PT1H", "Etc/UTC")
        assert "DATE_TRUNC('hour'" in sql

    def test_postgres_p1m(self, pg):
        sql = pg.time_floor_expression('"__time"', "P1M", "Etc/UTC")
        assert "DATE_TRUNC('month'" in sql

    def test_postgres_with_timezone(self, pg):
        sql = pg.time_floor_expression('"__time"', "P1D", "America/New_York")
        assert "AT TIME ZONE" in sql

    def test_postgres_unsupported_duration_raises(self, pg):
        with pytest.raises(ValueError, match="unsupported duration"):
            pg.time_floor_expression('"__time"', "P13D", "Etc/UTC")

    def test_mysql_p1d(self, mysql):
        sql = mysql.time_floor_expression('"__time"', "P1D", "Etc/UTC")
        assert "DATE_FORMAT" in sql

    def test_bigquery_p1d(self, bq):
        sql = bq.time_floor_expression('"__time"', "P1D", "Etc/UTC")
        assert "FORMAT_DATETIME" in sql

    def test_athena_p1d(self, athena):
        sql = athena.time_floor_expression('"__time"', "P1D", "Etc/UTC")
        assert "DATE_FORMAT" in sql

    def test_druid_p1d(self, druid):
        sql = druid.time_floor_expression('"__time"', "P1D", "Etc/UTC")
        assert "TIME_FLOOR" in sql


# ---------------------------------------------------------------------------
# time_bucket_expression
# ---------------------------------------------------------------------------

class TestTimeBucketExpression:
    def test_postgres_delegates_to_floor(self, pg):
        floor_sql = pg.time_floor_expression('"__time"', "P1D", "Etc/UTC")
        bucket_sql = pg.time_bucket_expression('"__time"', "P1D", "Etc/UTC")
        assert floor_sql == bucket_sql

    def test_druid(self, druid):
        sql = druid.time_bucket_expression('"__time"', "P1D", "Etc/UTC")
        assert "TIME_FLOOR" in sql


# ---------------------------------------------------------------------------
# contains_expression
# ---------------------------------------------------------------------------

class TestContainsExpression:
    def test_postgres_case_sensitive(self, pg):
        sql = pg.contains_expression('"city"', "'Lon'")
        assert "POSITION(" in sql
        assert ">0" in sql

    def test_postgres_case_insensitive(self, pg):
        sql = pg.contains_expression('"city"', "'lon'", insensitive=True)
        assert "LOWER(" in sql
        assert "POSITION(" in sql

    def test_mysql_case_sensitive(self, mysql):
        sql = mysql.contains_expression('`city`', "'Lon'")
        assert "LOCATE(" in sql
        assert ">0" in sql

    def test_mysql_case_insensitive(self, mysql):
        sql = mysql.contains_expression('`city`', "'lon'", insensitive=True)
        assert "LOWER(" in sql

    def test_bigquery(self, bq):
        sql = bq.contains_expression('`city`', "'Lon'")
        assert "STRPOS(" in sql

    def test_athena(self, athena):
        sql = athena.contains_expression('"city"', "'Lon'")
        assert "STRPOS(" in sql

    def test_druid_case_sensitive(self, druid):
        sql = druid.contains_expression('"city"', "'Lon'")
        assert "CONTAINS_STRING(" in sql

    def test_druid_case_insensitive(self, druid):
        sql = druid.contains_expression('"city"', "'lon'", insensitive=True)
        assert "ICONTAINS_STRING(" in sql


# ---------------------------------------------------------------------------
# concat_expression
# ---------------------------------------------------------------------------

class TestConcatExpression:
    def test_postgres_uses_pipe_pipe(self, pg):
        sql = pg.concat_expression('"a"', '"b"')
        assert "||" in sql

    def test_mysql_uses_concat(self, mysql):
        sql = mysql.concat_expression('`a`', '`b`')
        assert "CONCAT(" in sql

    def test_bigquery_uses_concat(self, bq):
        sql = bq.concat_expression('`a`', '`b`')
        assert "CONCAT(" in sql

    def test_athena_uses_concat(self, athena):
        sql = athena.concat_expression('"a"', '"b"')
        assert "CONCAT(" in sql

    def test_druid_uses_pipe_pipe(self, druid):
        sql = druid.concat_expression('"a"', '"b"')
        assert "||" in sql


# ---------------------------------------------------------------------------
# cast_expression
# ---------------------------------------------------------------------------

class TestCastExpression:
    def test_postgres_identity(self, pg):
        sql = pg.cast_expression("STRING", '"col"', "STRING")
        assert sql == '"col"'

    def test_postgres_number_to_string(self, pg):
        sql = pg.cast_expression("NUMBER", '"price"', "STRING")
        assert "::text" in sql

    def test_mysql_identity(self, mysql):
        sql = mysql.cast_expression("STRING", '`col`', "STRING")
        assert sql == '`col`'

    def test_mysql_number_to_string(self, mysql):
        sql = mysql.cast_expression("NUMBER", '`price`', "STRING")
        assert "CAST" in sql or "CHAR" in sql

    def test_bigquery_identity(self, bq):
        sql = bq.cast_expression("STRING", '`col`', "STRING")
        assert sql == '`col`'

    def test_bigquery_number_to_string(self, bq):
        sql = bq.cast_expression("NUMBER", '`price`', "STRING")
        assert "cast" in sql.lower() or "string" in sql.lower()

    def test_athena_identity(self, athena):
        sql = athena.cast_expression("STRING", '"col"', "STRING")
        assert sql == '"col"'

    def test_druid_identity(self, druid):
        sql = druid.cast_expression("STRING", '"col"', "STRING")
        assert sql == '"col"'

    def test_druid_number_to_string(self, druid):
        sql = druid.cast_expression("NUMBER", '"price"', "STRING")
        assert "CAST" in sql or "VARCHAR" in sql


# ---------------------------------------------------------------------------
# aggregate_filter_if_needed
# ---------------------------------------------------------------------------

class TestAggregateFilterIfNeeded:
    def test_no_filter(self, pg):
        result = pg.aggregate_filter_if_needed('"main"', '"price"')
        assert result == '"price"'

    def test_with_filter(self, pg):
        result = pg.aggregate_filter_if_needed('"main" WHERE "active"=TRUE', '"price"', "0")
        assert "CASE WHEN" in result
        assert "THEN" in result
        assert "ELSE" in result

    def test_with_filter_no_else(self, pg):
        result = pg.aggregate_filter_if_needed('"main" WHERE "active"=TRUE', '"price"')
        assert "CASE WHEN" in result


# ---------------------------------------------------------------------------
# if_then_else_expression
# ---------------------------------------------------------------------------

class TestIfThenElseExpression:
    def test_basic(self, pg):
        sql = pg.if_then_else_expression("condition", "yes_val")
        assert sql == "CASE WHEN condition THEN yes_val END"

    def test_with_else(self, pg):
        sql = pg.if_then_else_expression("condition", "yes_val", "no_val")
        assert sql == "CASE WHEN condition THEN yes_val ELSE no_val END"


# ---------------------------------------------------------------------------
# coalesce_expression
# ---------------------------------------------------------------------------

class TestCoalesceExpression:
    def test_coalesce(self, pg):
        sql = pg.coalesce_expression('"city"', "'Unknown'")
        assert sql == "COALESCE(\"city\", 'Unknown')"


# ---------------------------------------------------------------------------
# Cross-dialect comparisons
# ---------------------------------------------------------------------------

class TestCrossDialectComparisons:
    @pytest.mark.parametrize("dialect_fixture,expected_quote", [
        ("pg", '"'),
        ("mysql", "`"),
        ("bq", "`"),
        ("athena", '"'),
        ("druid", '"'),
    ])
    def test_escape_name_uses_correct_quote(self, dialect_fixture, expected_quote, request):
        dialect = request.getfixturevalue(dialect_fixture)
        result = dialect.escape_name("test_col")
        assert result.startswith(expected_quote)
        assert result.endswith(expected_quote)

    def test_postgres_and_druid_use_same_quote_char(self, pg, druid):
        assert pg.escape_name("col")[0] == druid.escape_name("col")[0]

    def test_mysql_and_bigquery_use_same_quote_char(self, mysql, bq):
        assert mysql.escape_name("col")[0] == bq.escape_name("col")[0]

    def test_null_constant_universal(self, pg, mysql, bq, athena, druid):
        for d in [pg, mysql, bq, athena, druid]:
            assert d.null_constant() == "NULL"


# ---------------------------------------------------------------------------
# float_division
# ---------------------------------------------------------------------------

class TestFloatDivision:
    def test_postgres_standard(self, pg):
        sql = pg.float_division("a", "b")
        assert sql == "(a/b)"

    def test_druid_multiplies_by_1_0(self, druid):
        sql = druid.float_division("a", "b")
        assert "1.0" in sql


# ---------------------------------------------------------------------------
# is_not_distinct_from_expression
# ---------------------------------------------------------------------------

class TestIsNotDistinctFrom:
    def test_postgres_normal(self, pg):
        sql = pg.is_not_distinct_from_expression('"a"', '"b"')
        assert "IS NOT DISTINCT FROM" in sql

    def test_postgres_null_rhs(self, pg):
        sql = pg.is_not_distinct_from_expression('"a"', "NULL")
        assert '"a" IS NULL' == sql

    def test_postgres_null_lhs(self, pg):
        sql = pg.is_not_distinct_from_expression("NULL", '"b"')
        assert '"b" IS NULL' == sql

    def test_mysql_uses_spaceship(self, mysql):
        sql = mysql.is_not_distinct_from_expression('`a`', '`b`')
        assert "<=>" in sql

    def test_bigquery_uses_equals(self, bq):
        sql = bq.is_not_distinct_from_expression('`a`', '`b`')
        assert "=" in sql

    def test_druid_uses_equals(self, druid):
        sql = druid.is_not_distinct_from_expression('"a"', '"b"')
        assert "=" in sql


# ---------------------------------------------------------------------------
# regexp_expression
# ---------------------------------------------------------------------------

class TestRegexpExpression:
    def test_postgres_uses_tilde(self, pg):
        sql = pg.regexp_expression('"col"', "^test")
        assert "~" in sql

    def test_bigquery_uses_regexp_contains(self, bq):
        sql = bq.regexp_expression('`col`', "^test")
        assert "REGEXP_CONTAINS" in sql

    def test_athena_uses_regexp_like(self, athena):
        sql = athena.regexp_expression('"col"', "^test")
        assert "regexp_like" in sql

    def test_druid_uses_regexp_like(self, druid):
        sql = druid.regexp_expression('"col"', "^test")
        assert "REGEXP_LIKE" in sql


# ---------------------------------------------------------------------------
# in_expression (range containment)
# ---------------------------------------------------------------------------

class TestInExpression:
    def test_basic_half_open(self, pg):
        sql = pg.in_expression('"x"', "10", "20", "[)")
        assert "10<=" in sql
        assert "<20" in sql

    def test_closed_equal(self, pg):
        sql = pg.in_expression('"x"', "5", "5", "[]")
        assert '"x"=5' == sql

    def test_null_start(self, pg):
        sql = pg.in_expression('"x"', "NULL", "20", "[)")
        assert "<20" in sql
        assert "NULL" not in sql.replace("NULL", "", 1)  # only the parameter, not in sql

    def test_null_both(self, pg):
        sql = pg.in_expression('"x"', "NULL", "NULL", "[)")
        assert sql == "TRUE"


# ---------------------------------------------------------------------------
# length_expression
# ---------------------------------------------------------------------------

class TestLengthExpression:
    def test_default(self, pg):
        sql = pg.length_expression('"city"')
        assert "CHAR_LENGTH(" in sql


# ---------------------------------------------------------------------------
# substr_expression
# ---------------------------------------------------------------------------

class TestSubstrExpression:
    def test_default(self, pg):
        sql = pg.substr_expression('"city"', 0, 3)
        assert "SUBSTR(" in sql
        assert ",1," in sql  # position 0 -> SQL position 1

    def test_druid_uses_substring(self, druid):
        sql = druid.substr_expression('"city"', 0, 3)
        assert "SUBSTRING(" in sql


# ---------------------------------------------------------------------------
# empty_group_by
# ---------------------------------------------------------------------------

class TestEmptyGroupBy:
    def test_postgres_empty(self, pg):
        assert pg.empty_group_by() == ""

    def test_mysql_has_group_by(self, mysql):
        result = mysql.empty_group_by()
        assert "GROUP BY" in result

    def test_bigquery_empty(self, bq):
        assert bq.empty_group_by() == ""

    def test_athena_empty(self, athena):
        assert athena.empty_group_by() == ""

    def test_druid_has_group_by(self, druid):
        result = druid.empty_group_by()
        assert "GROUP BY" in result


# ---------------------------------------------------------------------------
# set_table / maybe_namespaced_name
# ---------------------------------------------------------------------------

class TestMaybeNamespacedName:
    def test_without_table(self, pg):
        assert pg.maybe_namespaced_name("col") == '"col"'

    def test_with_table(self, pg):
        pg.set_table("t")
        assert pg.maybe_namespaced_name("col") == 't."col"'

    def test_with_long_table_name(self, pg):
        pg.set_table("my_table")
        result = pg.maybe_namespaced_name("col")
        assert '"my_table"."col"' == result

    def test_clear_table(self, pg):
        pg.set_table("t")
        pg.set_table(None)
        assert pg.maybe_namespaced_name("col") == '"col"'


# ---------------------------------------------------------------------------
# time_shift_expression
# ---------------------------------------------------------------------------

class TestTimeShiftExpression:
    def test_postgres_step_zero(self, pg):
        sql = pg.time_shift_expression('"__time"', "P1D", 0, "Etc/UTC")
        assert sql == '"__time"'

    def test_postgres_step_positive(self, pg):
        sql = pg.time_shift_expression('"__time"', "P1D", 1, "Etc/UTC")
        assert "DATE_ADD" in sql or "INTERVAL" in sql

    def test_druid(self, druid):
        sql = druid.time_shift_expression('"__time"', "P1D", 1, "Etc/UTC")
        assert "TIME_SHIFT" in sql


# ---------------------------------------------------------------------------
# extract_expression
# ---------------------------------------------------------------------------

class TestExtractExpression:
    def test_postgres(self, pg):
        sql = pg.extract_expression('"url"', "(\\d+)")
        assert "REGEXP_MATCHES" in sql

    def test_druid(self, druid):
        sql = druid.extract_expression('"url"', "(\\d+)")
        assert "REGEXP_EXTRACT" in sql

    def test_mysql_raises(self, mysql):
        with pytest.raises(NotImplementedError):
            mysql.extract_expression('`url`', "(\\d+)")


# ---------------------------------------------------------------------------
# index_of_expression
# ---------------------------------------------------------------------------

class TestIndexOfExpression:
    def test_postgres(self, pg):
        sql = pg.index_of_expression('"city"', "'o'")
        assert "POSITION(" in sql
        assert "- 1" in sql

    def test_mysql(self, mysql):
        sql = mysql.index_of_expression('`city`', "'o'")
        assert "LOCATE(" in sql
        assert "- 1" in sql

    def test_druid(self, druid):
        sql = druid.index_of_expression('"city"', "'o'")
        assert "POSITION(" in sql
        assert "- 1" in sql


# ---------------------------------------------------------------------------
# Druid-specific: lookup_expression
# ---------------------------------------------------------------------------

class TestDruidLookup:
    def test_lookup(self, druid):
        sql = druid.lookup_expression('"country_code"', "country_names")
        assert "LOOKUP(" in sql

    def test_postgres_raises(self, pg):
        with pytest.raises(NotImplementedError):
            pg.lookup_expression('"x"', "lkp")
