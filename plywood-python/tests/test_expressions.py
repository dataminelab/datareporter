"""Tests for plywood.expressions module - all expression types."""
from __future__ import annotations

import pytest
from datetime import datetime, timezone

# Importing the package triggers registration of all expression types
import plywood.expressions
from plywood.expressions.base import Expression
from plywood.expressions.ref import RefExpression
from plywood.expressions.literal import LiteralExpression
from plywood.expressions.aggregate import (
    CountExpression, SumExpression, AverageExpression,
    MinExpression, MaxExpression, CountDistinctExpression,
    QuantileExpression, CardinalityExpression,
)
from plywood.expressions.chain import (
    FilterExpression, ApplyExpression, SortExpression, LimitExpression,
)
from plywood.expressions.comparison import (
    IsExpression, OverlapExpression,
    LessThanExpression, LessThanOrEqualExpression,
    GreaterThanExpression, GreaterThanOrEqualExpression,
)
from plywood.expressions.logical import AndExpression, OrExpression, NotExpression
from plywood.expressions.arithmetic import (
    AddExpression, SubtractExpression, MultiplyExpression, DivideExpression,
)
from plywood.expressions.time import (
    TimeBucketExpression, TimeFloorExpression, TimePartExpression,
    TimeRangeExpression, TimeShiftExpression,
)
from plywood.expressions.string import (
    ContainsExpression, MatchExpression, LengthExpression,
    IndexOfExpression, SubstrExpression, TransformCaseExpression,
    ConcatExpression, ExtractExpression,
)
from plywood.expressions.misc import (
    CastExpression, FallbackExpression, ThenExpression,
    NumberBucketExpression, AbsoluteExpression, PowerExpression,
    LookupExpression,
)
from plywood.expressions.sql_ref import (
    SqlRefExpression, SqlAggregateExpression,
    CustomAggregateExpression, CustomTransformExpression,
)
from plywood.dialect.postgres import PostgresDialect
from plywood.datatypes.set import Set
from plywood.datatypes.range import NumberRange, TimeRange


@pytest.fixture
def pg():
    return PostgresDialect()


# ---------------------------------------------------------------------------
# Ref Expression
# ---------------------------------------------------------------------------

class TestRefExpression:
    def test_from_js(self):
        expr = RefExpression.from_js({"op": "ref", "name": "city"})
        assert expr.op == "ref"
        assert expr.name == "city"

    def test_get_sql(self, pg):
        expr = RefExpression.from_js({"op": "ref", "name": "city"})
        assert expr.get_sql(pg) == '"city"'

    def test_get_sql_with_table(self, pg):
        pg.set_table("t")
        expr = RefExpression.from_js({"op": "ref", "name": "city"})
        assert expr.get_sql(pg) == 't."city"'

    def test_get_free_references(self):
        expr = RefExpression.from_js({"op": "ref", "name": "city"})
        assert expr.get_free_references() == ["city"]

    def test_equals_same(self):
        e1 = RefExpression.from_js({"op": "ref", "name": "city"})
        e2 = RefExpression.from_js({"op": "ref", "name": "city"})
        assert e1.equals(e2) is True

    def test_equals_different(self):
        e1 = RefExpression.from_js({"op": "ref", "name": "city"})
        e2 = RefExpression.from_js({"op": "ref", "name": "country"})
        assert e1.equals(e2) is False

    def test_to_js_roundtrip(self):
        js = {"op": "ref", "name": "city"}
        expr = RefExpression.from_js(js)
        out = expr.to_js()
        assert out["op"] == "ref"
        assert out["name"] == "city"


# ---------------------------------------------------------------------------
# Literal Expression
# ---------------------------------------------------------------------------

class TestLiteralExpression:
    def test_from_js_number(self):
        expr = LiteralExpression.from_js({"op": "literal", "value": 42, "type": "NUMBER"})
        assert expr.value == 42
        assert expr.type == "NUMBER"

    def test_from_js_string(self):
        expr = LiteralExpression.from_js({"op": "literal", "value": "hello", "type": "STRING"})
        assert expr.value == "hello"
        assert expr.type == "STRING"

    def test_from_js_boolean(self):
        expr = LiteralExpression.from_js({"op": "literal", "value": True, "type": "BOOLEAN"})
        assert expr.value is True
        assert expr.type == "BOOLEAN"

    def test_from_js_null(self):
        expr = LiteralExpression.from_js({"op": "literal", "value": None, "type": "NULL"})
        assert expr.value is None
        assert expr.type == "NULL"

    def test_from_js_time(self):
        expr = LiteralExpression.from_js({
            "op": "literal",
            "value": "2025-01-01T00:00:00Z",
            "type": "TIME",
        })
        assert isinstance(expr.value, datetime)
        assert expr.type == "TIME"

    def test_from_js_time_range(self):
        expr = LiteralExpression.from_js({
            "op": "literal",
            "type": "TIME_RANGE",
            "value": {
                "start": "2025-01-01T00:00:00Z",
                "end": "2025-02-01T00:00:00Z",
            },
        })
        assert isinstance(expr.value, TimeRange)

    def test_from_js_number_range(self):
        expr = LiteralExpression.from_js({
            "op": "literal",
            "type": "NUMBER_RANGE",
            "value": {"start": 0, "end": 100},
        })
        assert isinstance(expr.value, NumberRange)
        assert expr.value.start == 0
        assert expr.value.end == 100

    def test_from_js_set_list(self):
        expr = LiteralExpression.from_js({
            "op": "literal",
            "type": "SET",
            "value": ["a", "b", "c"],
        })
        assert isinstance(expr.value, Set)
        assert expr.value.size() == 3

    def test_from_js_set_dict(self):
        expr = LiteralExpression.from_js({
            "op": "literal",
            "type": "SET",
            "value": {"setType": "NUMBER", "elements": [1, 2, 3]},
        })
        assert isinstance(expr.value, Set)
        assert expr.value.set_type == "SET/NUMBER"

    def test_get_sql_number(self, pg):
        expr = LiteralExpression.from_js({"op": "literal", "value": 42, "type": "NUMBER"})
        assert expr.get_sql(pg) == "42"

    def test_get_sql_string(self, pg):
        expr = LiteralExpression.from_js({"op": "literal", "value": "hello", "type": "STRING"})
        assert expr.get_sql(pg) == "'hello'"

    def test_get_sql_boolean_true(self, pg):
        expr = LiteralExpression.from_js({"op": "literal", "value": True, "type": "BOOLEAN"})
        assert expr.get_sql(pg) == "TRUE"

    def test_get_sql_boolean_false(self, pg):
        expr = LiteralExpression.from_js({"op": "literal", "value": False, "type": "BOOLEAN"})
        assert expr.get_sql(pg) == "FALSE"

    def test_get_sql_null(self, pg):
        expr = LiteralExpression.from_js({"op": "literal", "value": None, "type": "NULL"})
        assert expr.get_sql(pg) == "NULL"

    def test_get_sql_time(self, pg):
        expr = LiteralExpression.from_js({
            "op": "literal",
            "value": "2025-01-01T00:00:00Z",
            "type": "TIME",
        })
        sql = expr.get_sql(pg)
        assert "TIMESTAMP" in sql
        assert "2025-01-01" in sql

    def test_get_literal_value(self):
        expr = LiteralExpression.from_js({"op": "literal", "value": 42, "type": "NUMBER"})
        assert expr.get_literal_value() == 42

    def test_equals_same(self):
        e1 = LiteralExpression.from_js({"op": "literal", "value": 42, "type": "NUMBER"})
        e2 = LiteralExpression.from_js({"op": "literal", "value": 42, "type": "NUMBER"})
        assert e1.equals(e2) is True

    def test_equals_different(self):
        e1 = LiteralExpression.from_js({"op": "literal", "value": 42, "type": "NUMBER"})
        e2 = LiteralExpression.from_js({"op": "literal", "value": 99, "type": "NUMBER"})
        assert e1.equals(e2) is False


# ---------------------------------------------------------------------------
# Aggregate Expressions
# ---------------------------------------------------------------------------

class TestCountExpression:
    def test_from_js(self):
        expr = CountExpression.from_js({"op": "count", "operand": {"op": "ref", "name": "main"}})
        assert expr.op == "count"
        assert expr.type == "NUMBER"

    def test_get_sql_simple(self, pg):
        expr = CountExpression.from_js({"op": "count", "operand": {"op": "ref", "name": "main"}})
        sql = expr.get_sql(pg)
        assert sql == "COUNT(*)"


class TestSumExpression:
    def test_from_js(self):
        expr = SumExpression.from_js({
            "op": "sum",
            "operand": {"op": "ref", "name": "main"},
            "expression": {"op": "ref", "name": "price"},
        })
        assert expr.op == "sum"

    def test_get_sql(self, pg):
        expr = SumExpression.from_js({
            "op": "sum",
            "operand": {"op": "ref", "name": "main"},
            "expression": {"op": "ref", "name": "price"},
        })
        sql = expr.get_sql(pg)
        assert "SUM(" in sql
        assert '"price"' in sql


class TestAverageExpression:
    def test_from_js_and_sql(self, pg):
        expr = AverageExpression.from_js({
            "op": "average",
            "operand": {"op": "ref", "name": "main"},
            "expression": {"op": "ref", "name": "score"},
        })
        sql = expr.get_sql(pg)
        assert "AVG(" in sql
        assert '"score"' in sql


class TestMinExpression:
    def test_from_js_and_sql(self, pg):
        expr = MinExpression.from_js({
            "op": "min",
            "operand": {"op": "ref", "name": "main"},
            "expression": {"op": "ref", "name": "price"},
        })
        sql = expr.get_sql(pg)
        assert "MIN(" in sql


class TestMaxExpression:
    def test_from_js_and_sql(self, pg):
        expr = MaxExpression.from_js({
            "op": "max",
            "operand": {"op": "ref", "name": "main"},
            "expression": {"op": "ref", "name": "price"},
        })
        sql = expr.get_sql(pg)
        assert "MAX(" in sql


class TestCountDistinctExpression:
    def test_from_js_and_sql(self, pg):
        expr = CountDistinctExpression.from_js({
            "op": "countDistinct",
            "operand": {"op": "ref", "name": "main"},
            "expression": {"op": "ref", "name": "user_id"},
        })
        sql = expr.get_sql(pg)
        assert "COUNT(DISTINCT" in sql
        assert '"user_id"' in sql


class TestQuantileExpression:
    def test_from_js(self):
        expr = QuantileExpression.from_js({
            "op": "quantile",
            "operand": {"op": "ref", "name": "main"},
            "expression": {"op": "ref", "name": "latency"},
            "value": 0.95,
        })
        assert expr.quantile_value == 0.95

    def test_default_quantile_value(self):
        expr = QuantileExpression.from_js({
            "op": "quantile",
            "operand": {"op": "ref", "name": "main"},
            "expression": {"op": "ref", "name": "latency"},
        })
        assert expr.quantile_value == 0.5


class TestCardinalityExpression:
    def test_from_js_and_sql(self, pg):
        expr = CardinalityExpression.from_js({
            "op": "cardinality",
            "operand": {"op": "ref", "name": "tags"},
        })
        sql = expr.get_sql(pg)
        assert "COUNT(DISTINCT" in sql


# ---------------------------------------------------------------------------
# Chain Expressions: filter, apply, sort, limit
# ---------------------------------------------------------------------------

class TestFilterExpression:
    def test_from_js(self):
        expr = FilterExpression.from_js({
            "op": "filter",
            "operand": {"op": "ref", "name": "main"},
            "expression": {"op": "ref", "name": "is_active"},
        })
        assert expr.op == "filter"

    def test_get_sql_contains_where(self, pg):
        expr = FilterExpression.from_js({
            "op": "filter",
            "operand": {"op": "ref", "name": "main"},
            "expression": {
                "op": "is",
                "operand": {"op": "ref", "name": "city"},
                "expression": {"op": "literal", "value": "London", "type": "STRING"},
            },
        })
        sql = expr.get_sql(pg)
        assert "WHERE" in sql


class TestApplyExpression:
    def test_from_js(self):
        expr = ApplyExpression.from_js({
            "op": "apply",
            "name": "total",
            "operand": {"op": "ref", "name": "main"},
            "expression": {
                "op": "sum",
                "operand": {"op": "ref", "name": "main"},
                "expression": {"op": "ref", "name": "price"},
            },
        })
        assert expr.name == "total"

    def test_get_sql_has_as(self, pg):
        expr = ApplyExpression.from_js({
            "op": "apply",
            "name": "total",
            "operand": {"op": "ref", "name": "main"},
            "expression": {
                "op": "sum",
                "operand": {"op": "ref", "name": "main"},
                "expression": {"op": "ref", "name": "price"},
            },
        })
        sql = expr.get_sql(pg)
        assert "AS" in sql
        assert '"total"' in sql


class TestSortExpression:
    def test_from_js_ascending(self):
        expr = SortExpression.from_js({
            "op": "sort",
            "operand": {"op": "ref", "name": "main"},
            "expression": {"op": "ref", "name": "price"},
            "direction": "ascending",
        })
        assert expr.direction == "ascending"

    def test_from_js_descending(self):
        expr = SortExpression.from_js({
            "op": "sort",
            "operand": {"op": "ref", "name": "main"},
            "expression": {"op": "ref", "name": "price"},
            "direction": "descending",
        })
        assert expr.direction == "descending"

    def test_get_sql_ascending(self, pg):
        expr = SortExpression.from_js({
            "op": "sort",
            "operand": {"op": "ref", "name": "main"},
            "expression": {"op": "ref", "name": "price"},
            "direction": "ascending",
        })
        sql = expr.get_sql(pg)
        assert "ORDER BY" in sql
        assert "ASC" in sql

    def test_get_sql_descending(self, pg):
        expr = SortExpression.from_js({
            "op": "sort",
            "operand": {"op": "ref", "name": "main"},
            "expression": {"op": "ref", "name": "price"},
            "direction": "descending",
        })
        sql = expr.get_sql(pg)
        assert "ORDER BY" in sql
        assert "DESC" in sql


class TestLimitExpression:
    def test_from_js(self):
        expr = LimitExpression.from_js({
            "op": "limit",
            "operand": {"op": "ref", "name": "main"},
            "value": 10,
        })
        assert expr.value == 10

    def test_get_sql(self, pg):
        expr = LimitExpression.from_js({
            "op": "limit",
            "operand": {"op": "ref", "name": "main"},
            "value": 10,
        })
        assert expr.get_sql(pg) == "LIMIT 10"


# ---------------------------------------------------------------------------
# Comparison Expressions
# ---------------------------------------------------------------------------

class TestIsExpression:
    def test_from_js(self):
        expr = IsExpression.from_js({
            "op": "is",
            "operand": {"op": "ref", "name": "city"},
            "expression": {"op": "literal", "value": "London", "type": "STRING"},
        })
        assert expr.op == "is"

    def test_get_sql_string(self, pg):
        expr = IsExpression.from_js({
            "op": "is",
            "operand": {"op": "ref", "name": "city"},
            "expression": {"op": "literal", "value": "London", "type": "STRING"},
        })
        sql = expr.get_sql(pg)
        assert "IS NOT DISTINCT FROM" in sql
        assert "'London'" in sql

    def test_get_sql_set(self, pg):
        expr = IsExpression.from_js({
            "op": "is",
            "operand": {"op": "ref", "name": "city"},
            "expression": {
                "op": "literal",
                "type": "SET",
                "value": {"setType": "STRING", "elements": ["London", "Paris"]},
            },
        })
        sql = expr.get_sql(pg)
        assert "IN" in sql

    def test_get_sql_empty_set(self, pg):
        expr = IsExpression.from_js({
            "op": "is",
            "operand": {"op": "ref", "name": "city"},
            "expression": {
                "op": "literal",
                "type": "SET",
                "value": {"setType": "STRING", "elements": []},
            },
        })
        sql = expr.get_sql(pg)
        assert sql == "FALSE"

    def test_get_sql_null_literal(self, pg):
        expr = IsExpression.from_js({
            "op": "is",
            "operand": {"op": "ref", "name": "city"},
            "expression": {"op": "literal", "value": None, "type": "NULL"},
        })
        sql = expr.get_sql(pg)
        assert "IS NULL" in sql


class TestOverlapExpression:
    def test_from_js(self):
        expr = OverlapExpression.from_js({
            "op": "overlap",
            "operand": {"op": "ref", "name": "__time"},
            "expression": {
                "op": "literal",
                "type": "TIME_RANGE",
                "value": {
                    "start": "2025-01-01T00:00:00Z",
                    "end": "2025-02-01T00:00:00Z",
                },
            },
        })
        assert expr.op == "overlap"

    def test_get_sql_time_range(self, pg):
        expr = OverlapExpression.from_js({
            "op": "overlap",
            "operand": {"op": "ref", "name": "__time"},
            "expression": {
                "op": "literal",
                "type": "TIME_RANGE",
                "value": {
                    "start": "2025-01-01T00:00:00Z",
                    "end": "2025-02-01T00:00:00Z",
                },
            },
        })
        sql = expr.get_sql(pg)
        assert "TIMESTAMP" in sql

    def test_get_sql_number_range(self, pg):
        expr = OverlapExpression.from_js({
            "op": "overlap",
            "operand": {"op": "ref", "name": "age"},
            "expression": {
                "op": "literal",
                "type": "NUMBER_RANGE",
                "value": {"start": 18, "end": 65},
            },
        })
        sql = expr.get_sql(pg)
        assert "18" in sql
        assert "65" in sql


class TestLessThanExpression:
    def test_get_sql(self, pg):
        expr = LessThanExpression.from_js({
            "op": "lessThan",
            "operand": {"op": "ref", "name": "price"},
            "expression": {"op": "literal", "value": 100, "type": "NUMBER"},
        })
        sql = expr.get_sql(pg)
        assert "<" in sql
        assert "100" in sql


class TestLessThanOrEqualExpression:
    def test_get_sql(self, pg):
        expr = LessThanOrEqualExpression.from_js({
            "op": "lessThanOrEqual",
            "operand": {"op": "ref", "name": "price"},
            "expression": {"op": "literal", "value": 100, "type": "NUMBER"},
        })
        sql = expr.get_sql(pg)
        assert "<=" in sql


class TestGreaterThanExpression:
    def test_get_sql(self, pg):
        expr = GreaterThanExpression.from_js({
            "op": "greaterThan",
            "operand": {"op": "ref", "name": "price"},
            "expression": {"op": "literal", "value": 0, "type": "NUMBER"},
        })
        sql = expr.get_sql(pg)
        assert ">" in sql
        assert "0" in sql


class TestGreaterThanOrEqualExpression:
    def test_get_sql(self, pg):
        expr = GreaterThanOrEqualExpression.from_js({
            "op": "greaterThanOrEqual",
            "operand": {"op": "ref", "name": "price"},
            "expression": {"op": "literal", "value": 0, "type": "NUMBER"},
        })
        sql = expr.get_sql(pg)
        assert ">=" in sql


# ---------------------------------------------------------------------------
# Logical Expressions
# ---------------------------------------------------------------------------

class TestAndExpression:
    def test_from_js(self):
        expr = AndExpression.from_js({
            "op": "and",
            "operand": {
                "op": "is",
                "operand": {"op": "ref", "name": "city"},
                "expression": {"op": "literal", "value": "London", "type": "STRING"},
            },
            "expression": {
                "op": "greaterThan",
                "operand": {"op": "ref", "name": "price"},
                "expression": {"op": "literal", "value": 0, "type": "NUMBER"},
            },
        })
        assert expr.op == "and"

    def test_get_sql(self, pg):
        expr = AndExpression.from_js({
            "op": "and",
            "operand": {
                "op": "is",
                "operand": {"op": "ref", "name": "city"},
                "expression": {"op": "literal", "value": "London", "type": "STRING"},
            },
            "expression": {
                "op": "greaterThan",
                "operand": {"op": "ref", "name": "price"},
                "expression": {"op": "literal", "value": 0, "type": "NUMBER"},
            },
        })
        sql = expr.get_sql(pg)
        assert " AND " in sql


class TestOrExpression:
    def test_get_sql(self, pg):
        expr = OrExpression.from_js({
            "op": "or",
            "operand": {
                "op": "is",
                "operand": {"op": "ref", "name": "city"},
                "expression": {"op": "literal", "value": "London", "type": "STRING"},
            },
            "expression": {
                "op": "is",
                "operand": {"op": "ref", "name": "city"},
                "expression": {"op": "literal", "value": "Paris", "type": "STRING"},
            },
        })
        sql = expr.get_sql(pg)
        assert " OR " in sql


class TestNotExpression:
    def test_get_sql(self, pg):
        expr = NotExpression.from_js({
            "op": "not",
            "operand": {
                "op": "is",
                "operand": {"op": "ref", "name": "city"},
                "expression": {"op": "literal", "value": "London", "type": "STRING"},
            },
        })
        sql = expr.get_sql(pg)
        assert "NOT(" in sql


# ---------------------------------------------------------------------------
# Arithmetic Expressions
# ---------------------------------------------------------------------------

class TestAddExpression:
    def test_get_sql(self, pg):
        expr = AddExpression.from_js({
            "op": "add",
            "operand": {"op": "ref", "name": "price"},
            "expression": {"op": "literal", "value": 10, "type": "NUMBER"},
        })
        sql = expr.get_sql(pg)
        assert "+" in sql

    def test_type_is_number(self):
        expr = AddExpression.from_js({
            "op": "add",
            "operand": {"op": "ref", "name": "price"},
            "expression": {"op": "literal", "value": 10, "type": "NUMBER"},
        })
        assert expr.type == "NUMBER"


class TestSubtractExpression:
    def test_get_sql(self, pg):
        expr = SubtractExpression.from_js({
            "op": "subtract",
            "operand": {"op": "ref", "name": "price"},
            "expression": {"op": "literal", "value": 5, "type": "NUMBER"},
        })
        sql = expr.get_sql(pg)
        assert "-" in sql


class TestMultiplyExpression:
    def test_get_sql(self, pg):
        expr = MultiplyExpression.from_js({
            "op": "multiply",
            "operand": {"op": "ref", "name": "price"},
            "expression": {"op": "literal", "value": 2, "type": "NUMBER"},
        })
        sql = expr.get_sql(pg)
        assert "*" in sql


class TestDivideExpression:
    def test_get_sql(self, pg):
        expr = DivideExpression.from_js({
            "op": "divide",
            "operand": {"op": "ref", "name": "total"},
            "expression": {"op": "ref", "name": "count"},
        })
        sql = expr.get_sql(pg)
        assert "/" in sql


# ---------------------------------------------------------------------------
# Time Expressions
# ---------------------------------------------------------------------------

class TestTimeBucketExpression:
    def test_from_js(self):
        expr = TimeBucketExpression.from_js({
            "op": "timeBucket",
            "operand": {"op": "ref", "name": "__time"},
            "duration": "P1D",
            "timezone": "Etc/UTC",
        })
        assert expr.duration == "P1D"
        assert expr.timezone == "Etc/UTC"

    def test_get_sql(self, pg):
        expr = TimeBucketExpression.from_js({
            "op": "timeBucket",
            "operand": {"op": "ref", "name": "__time"},
            "duration": "P1D",
            "timezone": "Etc/UTC",
        })
        sql = expr.get_sql(pg)
        assert "DATE_TRUNC" in sql
        assert "'day'" in sql


class TestTimeFloorExpression:
    def test_from_js(self):
        expr = TimeFloorExpression.from_js({
            "op": "timeFloor",
            "operand": {"op": "ref", "name": "__time"},
            "duration": "PT1H",
            "timezone": "Etc/UTC",
        })
        assert expr.duration == "PT1H"

    def test_get_sql_hour(self, pg):
        expr = TimeFloorExpression.from_js({
            "op": "timeFloor",
            "operand": {"op": "ref", "name": "__time"},
            "duration": "PT1H",
            "timezone": "Etc/UTC",
        })
        sql = expr.get_sql(pg)
        assert "DATE_TRUNC" in sql
        assert "'hour'" in sql

    def test_get_sql_day(self, pg):
        expr = TimeFloorExpression.from_js({
            "op": "timeFloor",
            "operand": {"op": "ref", "name": "__time"},
            "duration": "P1D",
            "timezone": "Etc/UTC",
        })
        sql = expr.get_sql(pg)
        assert "'day'" in sql


class TestTimePartExpression:
    def test_from_js(self):
        expr = TimePartExpression.from_js({
            "op": "timePart",
            "operand": {"op": "ref", "name": "__time"},
            "part": "HOUR_OF_DAY",
            "timezone": "Etc/UTC",
        })
        assert expr.part == "HOUR_OF_DAY"

    def test_get_sql(self, pg):
        expr = TimePartExpression.from_js({
            "op": "timePart",
            "operand": {"op": "ref", "name": "__time"},
            "part": "HOUR_OF_DAY",
            "timezone": "Etc/UTC",
        })
        sql = expr.get_sql(pg)
        assert "DATE_PART" in sql or "hour" in sql.lower()


class TestTimeRangeExpression:
    def test_from_js(self):
        expr = TimeRangeExpression.from_js({
            "op": "timeRange",
            "operand": {"op": "ref", "name": "__time"},
            "duration": "P1D",
            "step": 1,
        })
        assert expr.duration == "P1D"
        assert expr.step == 1

    def test_get_sql(self, pg):
        expr = TimeRangeExpression.from_js({
            "op": "timeRange",
            "operand": {"op": "ref", "name": "__time"},
            "duration": "P1D",
        })
        sql = expr.get_sql(pg)
        assert "DATE_TRUNC" in sql


class TestTimeShiftExpression:
    def test_from_js(self):
        expr = TimeShiftExpression.from_js({
            "op": "timeShift",
            "operand": {"op": "ref", "name": "__time"},
            "duration": "P1D",
            "step": 1,
        })
        assert expr.duration == "P1D"
        assert expr.step == 1

    def test_get_sql(self, pg):
        expr = TimeShiftExpression.from_js({
            "op": "timeShift",
            "operand": {"op": "ref", "name": "__time"},
            "duration": "P1D",
            "step": 1,
        })
        sql = expr.get_sql(pg)
        assert "DATE_ADD" in sql or "INTERVAL" in sql


# ---------------------------------------------------------------------------
# String Expressions
# ---------------------------------------------------------------------------

class TestContainsExpression:
    def test_from_js(self):
        expr = ContainsExpression.from_js({
            "op": "contains",
            "operand": {"op": "ref", "name": "city"},
            "expression": {"op": "literal", "value": "Lon", "type": "STRING"},
        })
        assert expr.op == "contains"

    def test_get_sql_case_sensitive(self, pg):
        expr = ContainsExpression.from_js({
            "op": "contains",
            "operand": {"op": "ref", "name": "city"},
            "expression": {"op": "literal", "value": "Lon", "type": "STRING"},
            "compare": "normal",
        })
        sql = expr.get_sql(pg)
        assert "POSITION(" in sql

    def test_get_sql_case_insensitive(self, pg):
        expr = ContainsExpression.from_js({
            "op": "contains",
            "operand": {"op": "ref", "name": "city"},
            "expression": {"op": "literal", "value": "lon", "type": "STRING"},
            "compare": "ignoreCase",
        })
        sql = expr.get_sql(pg)
        assert "LOWER(" in sql


class TestMatchExpression:
    def test_from_js(self):
        expr = MatchExpression.from_js({
            "op": "match",
            "operand": {"op": "ref", "name": "city"},
            "regexp": "^L.*",
        })
        assert expr.regexp == "^L.*"

    def test_get_sql(self, pg):
        expr = MatchExpression.from_js({
            "op": "match",
            "operand": {"op": "ref", "name": "city"},
            "regexp": "^L.*",
        })
        sql = expr.get_sql(pg)
        assert "~" in sql
        assert "^L.*" in sql


class TestLengthExpression:
    def test_get_sql(self, pg):
        expr = LengthExpression.from_js({
            "op": "length",
            "operand": {"op": "ref", "name": "city"},
        })
        sql = expr.get_sql(pg)
        assert "CHAR_LENGTH(" in sql


class TestIndexOfExpression:
    def test_get_sql(self, pg):
        expr = IndexOfExpression.from_js({
            "op": "indexOf",
            "operand": {"op": "ref", "name": "city"},
            "expression": {"op": "literal", "value": "o", "type": "STRING"},
        })
        sql = expr.get_sql(pg)
        assert "POSITION(" in sql
        assert "- 1" in sql


class TestSubstrExpression:
    def test_from_js(self):
        expr = SubstrExpression.from_js({
            "op": "substr",
            "operand": {"op": "ref", "name": "city"},
            "position": 0,
            "len": 3,
        })
        assert expr.position == 0
        assert expr.len == 3

    def test_get_sql(self, pg):
        expr = SubstrExpression.from_js({
            "op": "substr",
            "operand": {"op": "ref", "name": "city"},
            "position": 0,
            "len": 3,
        })
        sql = expr.get_sql(pg)
        assert "SUBSTR(" in sql


class TestTransformCaseExpression:
    def test_uppercase(self, pg):
        expr = TransformCaseExpression.from_js({
            "op": "transformCase",
            "operand": {"op": "ref", "name": "city"},
            "transformType": "upperCase",
        })
        sql = expr.get_sql(pg)
        assert "UPPER(" in sql

    def test_lowercase(self, pg):
        expr = TransformCaseExpression.from_js({
            "op": "transformCase",
            "operand": {"op": "ref", "name": "city"},
            "transformType": "lowerCase",
        })
        sql = expr.get_sql(pg)
        assert "LOWER(" in sql


class TestConcatExpression:
    def test_get_sql(self, pg):
        expr = ConcatExpression.from_js({
            "op": "concat",
            "operand": {"op": "ref", "name": "first_name"},
            "expression": {"op": "ref", "name": "last_name"},
        })
        sql = expr.get_sql(pg)
        assert "||" in sql


class TestExtractExpression:
    def test_from_js(self):
        expr = ExtractExpression.from_js({
            "op": "extract",
            "operand": {"op": "ref", "name": "url"},
            "regexp": "(\\d+)",
        })
        assert expr.regexp == "(\\d+)"

    def test_get_sql(self, pg):
        expr = ExtractExpression.from_js({
            "op": "extract",
            "operand": {"op": "ref", "name": "url"},
            "regexp": "(\\d+)",
        })
        sql = expr.get_sql(pg)
        assert "REGEXP_MATCHES" in sql


# ---------------------------------------------------------------------------
# Misc Expressions
# ---------------------------------------------------------------------------

class TestCastExpression:
    def test_from_js(self):
        expr = CastExpression.from_js({
            "op": "cast",
            "operand": {"op": "ref", "name": "price", "type": "NUMBER"},
            "outputType": "STRING",
        })
        assert expr.output_type == "STRING"

    def test_get_sql_identity(self, pg):
        expr = CastExpression.from_js({
            "op": "cast",
            "operand": {"op": "ref", "name": "price", "type": "STRING"},
            "outputType": "STRING",
        })
        sql = expr.get_sql(pg)
        assert '"price"' in sql

    def test_get_sql_number_to_string(self, pg):
        expr = CastExpression.from_js({
            "op": "cast",
            "operand": {"op": "ref", "name": "price", "type": "NUMBER"},
            "outputType": "STRING",
        })
        sql = expr.get_sql(pg)
        assert "::text" in sql


class TestFallbackExpression:
    def test_get_sql(self, pg):
        expr = FallbackExpression.from_js({
            "op": "fallback",
            "operand": {"op": "ref", "name": "city"},
            "expression": {"op": "literal", "value": "Unknown", "type": "STRING"},
        })
        sql = expr.get_sql(pg)
        assert "COALESCE(" in sql


class TestThenExpression:
    def test_get_sql(self, pg):
        expr = ThenExpression.from_js({
            "op": "then",
            "operand": {
                "op": "is",
                "operand": {"op": "ref", "name": "status"},
                "expression": {"op": "literal", "value": "active", "type": "STRING"},
            },
            "expression": {"op": "literal", "value": "Yes", "type": "STRING"},
        })
        sql = expr.get_sql(pg)
        assert "CASE WHEN" in sql
        assert "THEN" in sql


class TestNumberBucketExpression:
    def test_from_js(self):
        expr = NumberBucketExpression.from_js({
            "op": "numberBucket",
            "operand": {"op": "ref", "name": "price"},
            "size": 10,
            "offset": 0,
        })
        assert expr.size == 10
        assert expr.offset == 0

    def test_get_sql_no_offset(self, pg):
        expr = NumberBucketExpression.from_js({
            "op": "numberBucket",
            "operand": {"op": "ref", "name": "price"},
            "size": 10,
            "offset": 0,
        })
        sql = expr.get_sql(pg)
        assert "FLOOR(" in sql
        assert "/10" in sql
        assert "*10" in sql

    def test_get_sql_with_offset(self, pg):
        expr = NumberBucketExpression.from_js({
            "op": "numberBucket",
            "operand": {"op": "ref", "name": "price"},
            "size": 10,
            "offset": 5,
        })
        sql = expr.get_sql(pg)
        assert "FLOOR(" in sql
        assert "-5" in sql
        assert "+5" in sql


class TestAbsoluteExpression:
    def test_get_sql(self, pg):
        expr = AbsoluteExpression.from_js({
            "op": "absolute",
            "operand": {"op": "ref", "name": "delta"},
        })
        sql = expr.get_sql(pg)
        assert "ABS(" in sql


class TestPowerExpression:
    def test_get_sql(self, pg):
        expr = PowerExpression.from_js({
            "op": "power",
            "operand": {"op": "ref", "name": "base"},
            "expression": {"op": "literal", "value": 2, "type": "NUMBER"},
        })
        sql = expr.get_sql(pg)
        assert "POWER(" in sql


class TestLookupExpression:
    def test_from_js(self):
        expr = LookupExpression.from_js({
            "op": "lookup",
            "operand": {"op": "ref", "name": "country_code"},
            "lookupFn": "country_names",
        })
        assert expr.lookup_fn == "country_names"


# ---------------------------------------------------------------------------
# SQL Ref Expressions
# ---------------------------------------------------------------------------

class TestSqlRefExpression:
    def test_from_js(self):
        expr = SqlRefExpression.from_js({"op": "sqlRef", "sql": "custom_column"})
        assert expr.sql == "custom_column"
        assert expr.op == "sqlRef"

    def test_get_sql(self, pg):
        expr = SqlRefExpression.from_js({"op": "sqlRef", "sql": "custom_column"})
        assert expr.get_sql(pg) == "custom_column"

    def test_is_sql_function_true(self):
        expr = SqlRefExpression.from_js({"op": "sqlRef", "sql": "COUNT(DISTINCT x)"})
        assert expr.is_sql_function("COUNT") is True

    def test_is_sql_function_false(self):
        expr = SqlRefExpression.from_js({"op": "sqlRef", "sql": "custom_column"})
        assert expr.is_sql_function("COUNT") is False


class TestSqlAggregateExpression:
    def test_from_js(self):
        expr = SqlAggregateExpression.from_js({
            "op": "sqlAggregate",
            "operand": {"op": "ref", "name": "main"},
            "sql": "SUM(price)",
        })
        assert expr.sql == "SUM(price)"

    def test_get_sql(self, pg):
        expr = SqlAggregateExpression.from_js({
            "op": "sqlAggregate",
            "operand": {"op": "ref", "name": "main"},
            "sql": "SUM(price)",
        })
        sql = expr.get_sql(pg)
        assert "SUM(price)" in sql


class TestCustomAggregateExpression:
    def test_from_js(self):
        expr = CustomAggregateExpression.from_js({
            "op": "customAggregate",
            "operand": {"op": "ref", "name": "main"},
            "custom": "MY_CUSTOM_AGG(x)",
        })
        assert expr.custom == "MY_CUSTOM_AGG(x)"

    def test_get_sql(self, pg):
        expr = CustomAggregateExpression.from_js({
            "op": "customAggregate",
            "operand": {"op": "ref", "name": "main"},
            "custom": "MY_CUSTOM_AGG(x)",
        })
        assert expr.get_sql(pg) == "MY_CUSTOM_AGG(x)"


class TestCustomTransformExpression:
    def test_from_js(self):
        expr = CustomTransformExpression.from_js({
            "op": "customTransform",
            "operand": {"op": "ref", "name": "city"},
            "custom": "CUSTOM_FN(city)",
        })
        assert expr.custom == "CUSTOM_FN(city)"

    def test_get_sql(self, pg):
        expr = CustomTransformExpression.from_js({
            "op": "customTransform",
            "operand": {"op": "ref", "name": "city"},
            "custom": "CUSTOM_FN(city)",
        })
        assert expr.get_sql(pg) == "CUSTOM_FN(city)"


# ---------------------------------------------------------------------------
# Expression.from_js dispatch (registry)
# ---------------------------------------------------------------------------

class TestExpressionDispatch:
    def test_dispatch_ref(self):
        expr = Expression.from_js({"op": "ref", "name": "city"})
        assert isinstance(expr, RefExpression)

    def test_dispatch_literal(self):
        expr = Expression.from_js({"op": "literal", "value": 42, "type": "NUMBER"})
        assert isinstance(expr, LiteralExpression)

    def test_dispatch_count(self):
        expr = Expression.from_js({"op": "count", "operand": {"op": "ref", "name": "main"}})
        assert isinstance(expr, CountExpression)

    def test_dispatch_is(self):
        expr = Expression.from_js({
            "op": "is",
            "operand": {"op": "ref", "name": "city"},
            "expression": {"op": "literal", "value": "X", "type": "STRING"},
        })
        assert isinstance(expr, IsExpression)

    def test_dispatch_and(self):
        expr = Expression.from_js({
            "op": "and",
            "operand": {"op": "literal", "value": True, "type": "BOOLEAN"},
            "expression": {"op": "literal", "value": False, "type": "BOOLEAN"},
        })
        assert isinstance(expr, AndExpression)

    def test_dispatch_add(self):
        expr = Expression.from_js({
            "op": "add",
            "operand": {"op": "ref", "name": "a"},
            "expression": {"op": "ref", "name": "b"},
        })
        assert isinstance(expr, AddExpression)

    def test_dispatch_filter(self):
        expr = Expression.from_js({
            "op": "filter",
            "operand": {"op": "ref", "name": "main"},
            "expression": {"op": "literal", "value": True, "type": "BOOLEAN"},
        })
        assert isinstance(expr, FilterExpression)

    def test_dispatch_timeBucket(self):
        expr = Expression.from_js({
            "op": "timeBucket",
            "operand": {"op": "ref", "name": "__time"},
            "duration": "P1D",
        })
        assert isinstance(expr, TimeBucketExpression)

    def test_dispatch_sqlRef(self):
        expr = Expression.from_js({"op": "sqlRef", "sql": "foo"})
        assert isinstance(expr, SqlRefExpression)

    def test_dispatch_custom_back_compat(self):
        expr = Expression.from_js({
            "op": "custom",
            "operand": {"op": "ref", "name": "main"},
            "custom": "MY_AGG()",
        })
        assert isinstance(expr, CustomAggregateExpression)

    def test_dispatch_unsupported_raises(self):
        with pytest.raises(ValueError, match="unsupported"):
            Expression.from_js({"op": "noSuchOp"})

    def test_dispatch_empty_raises(self):
        with pytest.raises(ValueError, match="must have"):
            Expression.from_js({})

    def test_dispatch_no_op_raises(self):
        with pytest.raises(ValueError, match="op must be defined"):
            Expression.from_js({"name": "city"})


# ---------------------------------------------------------------------------
# Nested Expressions
# ---------------------------------------------------------------------------

class TestNestedExpressions:
    def test_filter_with_is_comparison(self, pg):
        expr = FilterExpression.from_js({
            "op": "filter",
            "operand": {"op": "ref", "name": "main"},
            "expression": {
                "op": "is",
                "operand": {"op": "ref", "name": "country"},
                "expression": {"op": "literal", "value": "UK", "type": "STRING"},
            },
        })
        sql = expr.get_sql(pg)
        assert "WHERE" in sql
        assert "'UK'" in sql

    def test_and_with_comparison_children(self, pg):
        expr = AndExpression.from_js({
            "op": "and",
            "operand": {
                "op": "greaterThan",
                "operand": {"op": "ref", "name": "age"},
                "expression": {"op": "literal", "value": 18, "type": "NUMBER"},
            },
            "expression": {
                "op": "lessThan",
                "operand": {"op": "ref", "name": "age"},
                "expression": {"op": "literal", "value": 65, "type": "NUMBER"},
            },
        })
        sql = expr.get_sql(pg)
        assert " AND " in sql
        assert "18" in sql
        assert "65" in sql

    def test_apply_with_sum_expression(self, pg):
        expr = ApplyExpression.from_js({
            "op": "apply",
            "name": "revenue",
            "operand": {"op": "ref", "name": "main"},
            "expression": {
                "op": "sum",
                "operand": {"op": "ref", "name": "main"},
                "expression": {
                    "op": "multiply",
                    "operand": {"op": "ref", "name": "price"},
                    "expression": {"op": "ref", "name": "quantity"},
                },
            },
        })
        sql = expr.get_sql(pg)
        assert "SUM(" in sql
        assert '"revenue"' in sql
        assert "*" in sql
