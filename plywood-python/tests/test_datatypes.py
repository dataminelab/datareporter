"""Tests for plywood.datatypes module."""
from __future__ import annotations

import pytest
from datetime import datetime, timezone

from plywood.datatypes.common import (
    VALID_PLY_TYPES,
    is_set_type,
    unwrap_set_type,
    is_range_type,
    unwrap_range_type,
    valid_type,
    get_value_type,
)
from plywood.datatypes.set import Set
from plywood.datatypes.range import NumberRange, TimeRange
from plywood.datatypes.attribute_info import AttributeInfo
from plywood.datatypes.dataset import Dataset


# ---------------------------------------------------------------------------
# VALID_PLY_TYPES
# ---------------------------------------------------------------------------

class TestValidPlyTypes:
    def test_contains_null(self):
        assert "NULL" in VALID_PLY_TYPES

    def test_contains_boolean(self):
        assert "BOOLEAN" in VALID_PLY_TYPES

    def test_contains_number(self):
        assert "NUMBER" in VALID_PLY_TYPES

    def test_contains_string(self):
        assert "STRING" in VALID_PLY_TYPES

    def test_contains_time(self):
        assert "TIME" in VALID_PLY_TYPES

    def test_contains_time_range(self):
        assert "TIME_RANGE" in VALID_PLY_TYPES

    def test_contains_number_range(self):
        assert "NUMBER_RANGE" in VALID_PLY_TYPES

    def test_contains_dataset(self):
        assert "DATASET" in VALID_PLY_TYPES

    def test_contains_set_string(self):
        assert "SET/STRING" in VALID_PLY_TYPES

    def test_contains_set_number(self):
        assert "SET/NUMBER" in VALID_PLY_TYPES

    def test_contains_set_time(self):
        assert "SET/TIME" in VALID_PLY_TYPES

    def test_contains_ip(self):
        assert "IP" in VALID_PLY_TYPES

    def test_contains_set_ip(self):
        assert "SET/IP" in VALID_PLY_TYPES

    def test_contains_time_series(self):
        assert "TIME_SERIES" in VALID_PLY_TYPES

    def test_does_not_contain_invalid(self):
        assert "INVALID" not in VALID_PLY_TYPES


# ---------------------------------------------------------------------------
# is_set_type / unwrap_set_type
# ---------------------------------------------------------------------------

class TestIsSetType:
    def test_set_string_is_set(self):
        assert is_set_type("SET/STRING") is True

    def test_set_number_is_set(self):
        assert is_set_type("SET/NUMBER") is True

    def test_bare_set_is_set(self):
        assert is_set_type("SET") is True

    def test_string_is_not_set(self):
        assert is_set_type("STRING") is False

    def test_none_is_not_set(self):
        assert is_set_type(None) is False


class TestUnwrapSetType:
    def test_unwrap_set_string(self):
        assert unwrap_set_type("SET/STRING") == "STRING"

    def test_unwrap_set_number(self):
        assert unwrap_set_type("SET/NUMBER") == "NUMBER"

    def test_unwrap_bare_set_returns_none(self):
        assert unwrap_set_type("SET") is None

    def test_unwrap_non_set_returns_as_is(self):
        assert unwrap_set_type("STRING") == "STRING"

    def test_unwrap_none_returns_none(self):
        assert unwrap_set_type(None) is None


# ---------------------------------------------------------------------------
# is_range_type / unwrap_range_type
# ---------------------------------------------------------------------------

class TestIsRangeType:
    def test_number_range_is_range(self):
        assert is_range_type("NUMBER_RANGE") is True

    def test_time_range_is_range(self):
        assert is_range_type("TIME_RANGE") is True

    def test_string_range_is_range(self):
        assert is_range_type("STRING_RANGE") is True

    def test_number_is_not_range(self):
        assert is_range_type("NUMBER") is False

    def test_none_is_not_range(self):
        assert is_range_type(None) is False


class TestUnwrapRangeType:
    def test_unwrap_number_range(self):
        assert unwrap_range_type("NUMBER_RANGE") == "NUMBER"

    def test_unwrap_time_range(self):
        assert unwrap_range_type("TIME_RANGE") == "TIME"

    def test_unwrap_non_range_returns_as_is(self):
        assert unwrap_range_type("NUMBER") == "NUMBER"

    def test_unwrap_none_returns_none(self):
        assert unwrap_range_type(None) is None


# ---------------------------------------------------------------------------
# valid_type
# ---------------------------------------------------------------------------

class TestValidType:
    def test_valid_string(self):
        assert valid_type("STRING") is True

    def test_valid_number(self):
        assert valid_type("NUMBER") is True

    def test_valid_dataset(self):
        assert valid_type("DATASET") is True

    def test_invalid_type(self):
        assert valid_type("BANANA") is False

    def test_empty_string(self):
        assert valid_type("") is False


# ---------------------------------------------------------------------------
# get_value_type
# ---------------------------------------------------------------------------

class TestGetValueType:
    def test_none_is_null(self):
        assert get_value_type(None) == "NULL"

    def test_bool_true_is_boolean(self):
        assert get_value_type(True) == "BOOLEAN"

    def test_bool_false_is_boolean(self):
        assert get_value_type(False) == "BOOLEAN"

    def test_int_is_number(self):
        assert get_value_type(42) == "NUMBER"

    def test_float_is_number(self):
        assert get_value_type(3.14) == "NUMBER"

    def test_string_is_string(self):
        assert get_value_type("hello") == "STRING"

    def test_datetime_is_time(self):
        assert get_value_type(datetime(2025, 1, 1)) == "TIME"

    def test_number_range_is_number_range(self):
        nr = NumberRange(0, 10)
        assert get_value_type(nr) == "NUMBER_RANGE"

    def test_time_range_is_time_range(self):
        tr = TimeRange(datetime(2025, 1, 1), datetime(2025, 2, 1))
        assert get_value_type(tr) == "TIME_RANGE"

    def test_set_returns_set_type(self):
        s = Set("SET/STRING", ["a", "b"])
        assert get_value_type(s) == "SET/STRING"

    def test_dataset_is_dataset(self):
        ds = Dataset()
        assert get_value_type(ds) == "DATASET"


# ---------------------------------------------------------------------------
# Set
# ---------------------------------------------------------------------------

class TestSet:
    def test_creation(self):
        s = Set("SET/STRING", ["a", "b", "c"])
        assert s.set_type == "SET/STRING"
        assert s.elements == ["a", "b", "c"]

    def test_size(self):
        s = Set("SET/STRING", ["a", "b", "c"])
        assert s.size() == 3

    def test_size_empty(self):
        s = Set("SET/STRING", [])
        assert s.size() == 0

    def test_contains_present(self):
        s = Set("SET/STRING", ["a", "b", "c"])
        assert s.contains("a") is True

    def test_contains_absent(self):
        s = Set("SET/STRING", ["a", "b", "c"])
        assert s.contains("z") is False

    def test_empty_true(self):
        s = Set("SET/STRING", [])
        assert s.empty() is True

    def test_empty_false(self):
        s = Set("SET/STRING", ["a"])
        assert s.empty() is False

    def test_equals_same(self):
        s1 = Set("SET/STRING", ["a", "b"])
        s2 = Set("SET/STRING", ["b", "a"])
        assert s1.equals(s2) is True

    def test_equals_different_type(self):
        s1 = Set("SET/STRING", ["a"])
        s2 = Set("SET/NUMBER", [1])
        assert s1.equals(s2) is False

    def test_equals_different_elements(self):
        s1 = Set("SET/STRING", ["a"])
        s2 = Set("SET/STRING", ["b"])
        assert s1.equals(s2) is False

    def test_equals_non_set(self):
        s = Set("SET/STRING", ["a"])
        assert s.equals("not a set") is False

    def test_from_js_list_strings(self):
        s = Set.from_js(["a", "b", "c"])
        assert s.set_type == "SET/STRING"
        assert s.elements == ["a", "b", "c"]

    def test_from_js_list_numbers(self):
        s = Set.from_js([1, 2, 3])
        assert s.set_type == "SET/NUMBER"
        assert s.elements == [1, 2, 3]

    def test_from_js_empty_list(self):
        s = Set.from_js([])
        assert s.set_type == "SET/STRING"
        assert s.elements == []

    def test_from_js_dict(self):
        s = Set.from_js({"setType": "NUMBER", "elements": [1, 2, 3]})
        assert s.set_type == "SET/NUMBER"
        assert s.elements == [1, 2, 3]

    def test_from_js_dict_default_type(self):
        s = Set.from_js({"elements": ["x", "y"]})
        assert s.set_type == "SET/STRING"

    def test_from_js_non_list_non_dict(self):
        s = Set.from_js(42)
        assert s.set_type == "SET/STRING"
        assert s.elements == []

    def test_to_js(self):
        s = Set("SET/NUMBER", [1, 2, 3])
        js = s.to_js()
        assert js == {"setType": "NUMBER", "elements": [1, 2, 3]}

    def test_is_set_type_static(self):
        assert Set.is_set_type("SET/STRING") is True
        assert Set.is_set_type("STRING") is False
        assert Set.is_set_type(None) is False

    def test_unwrap_set_type_static(self):
        assert Set.unwrap_set_type("SET/NUMBER") == "NUMBER"
        assert Set.unwrap_set_type("SET") is None
        assert Set.unwrap_set_type(None) is None

    def test_is_atomic_type(self):
        assert Set.is_atomic_type("STRING") is True
        assert Set.is_atomic_type("NUMBER") is True
        assert Set.is_atomic_type("BOOLEAN") is True
        assert Set.is_atomic_type("SET/STRING") is False
        assert Set.is_atomic_type(None) is False


# ---------------------------------------------------------------------------
# NumberRange
# ---------------------------------------------------------------------------

class TestNumberRange:
    def test_creation(self):
        nr = NumberRange(0, 10)
        assert nr.start == 0
        assert nr.end == 10
        assert nr.bounds == "[)"

    def test_creation_custom_bounds(self):
        nr = NumberRange(0, 10, "[]")
        assert nr.bounds == "[]"

    def test_from_js(self):
        nr = NumberRange.from_js({"start": 5, "end": 15})
        assert nr.start == 5
        assert nr.end == 15
        assert nr.bounds == "[)"

    def test_from_js_custom_bounds(self):
        nr = NumberRange.from_js({"start": 0, "end": 100, "bounds": "()"})
        assert nr.bounds == "()"

    def test_to_js_default_bounds(self):
        nr = NumberRange(0, 10)
        js = nr.to_js()
        assert js == {"start": 0, "end": 10}
        assert "bounds" not in js

    def test_to_js_custom_bounds(self):
        nr = NumberRange(0, 10, "[]")
        js = nr.to_js()
        assert js == {"start": 0, "end": 10, "bounds": "[]"}

    def test_equals_same(self):
        nr1 = NumberRange(0, 10)
        nr2 = NumberRange(0, 10)
        assert nr1.equals(nr2) is True

    def test_equals_different_start(self):
        nr1 = NumberRange(0, 10)
        nr2 = NumberRange(1, 10)
        assert nr1.equals(nr2) is False

    def test_equals_different_bounds(self):
        nr1 = NumberRange(0, 10, "[)")
        nr2 = NumberRange(0, 10, "[]")
        assert nr1.equals(nr2) is False

    def test_equals_non_range(self):
        nr = NumberRange(0, 10)
        assert nr.equals("not a range") is False

    def test_number_bucket(self):
        result = NumberRange.number_bucket(7, 5)
        assert result.start == 5
        assert result.end == 10
        assert result.bounds == "[)"

    def test_number_bucket_with_offset(self):
        result = NumberRange.number_bucket(7, 5, 2)
        assert result.start == 7
        assert result.end == 12

    def test_number_bucket_negative(self):
        result = NumberRange.number_bucket(-3, 5)
        assert result.start == -5
        assert result.end == 0

    def test_are_equivalent_bounds_same(self):
        assert NumberRange.are_equivalent_bounds("[)", "[)") is True

    def test_are_equivalent_bounds_none_default(self):
        assert NumberRange.are_equivalent_bounds(None, "[)") is True

    def test_are_equivalent_bounds_both_none(self):
        assert NumberRange.are_equivalent_bounds(None, None) is True

    def test_are_equivalent_bounds_different(self):
        assert NumberRange.are_equivalent_bounds("[)", "[]") is False


# ---------------------------------------------------------------------------
# TimeRange
# ---------------------------------------------------------------------------

class TestTimeRange:
    def test_creation(self):
        start = datetime(2025, 1, 1, tzinfo=timezone.utc)
        end = datetime(2025, 2, 1, tzinfo=timezone.utc)
        tr = TimeRange(start, end)
        assert tr.start == start
        assert tr.end == end
        assert tr.bounds == "[)"

    def test_from_js_iso_strings(self):
        tr = TimeRange.from_js({
            "start": "2025-01-01T00:00:00Z",
            "end": "2025-02-01T00:00:00Z",
        })
        assert tr.start == datetime(2025, 1, 1, tzinfo=timezone.utc)
        assert tr.end == datetime(2025, 2, 1, tzinfo=timezone.utc)

    def test_from_js_custom_bounds(self):
        tr = TimeRange.from_js({
            "start": "2025-01-01T00:00:00Z",
            "end": "2025-02-01T00:00:00Z",
            "bounds": "[]",
        })
        assert tr.bounds == "[]"

    def test_to_js(self):
        start = datetime(2025, 1, 1, tzinfo=timezone.utc)
        end = datetime(2025, 2, 1, tzinfo=timezone.utc)
        tr = TimeRange(start, end)
        js = tr.to_js()
        assert "start" in js
        assert "end" in js
        assert "Z" in js["start"]
        assert "Z" in js["end"]

    def test_to_js_no_bounds_for_default(self):
        start = datetime(2025, 1, 1, tzinfo=timezone.utc)
        end = datetime(2025, 2, 1, tzinfo=timezone.utc)
        tr = TimeRange(start, end)
        js = tr.to_js()
        assert "bounds" not in js

    def test_equals_same(self):
        start = datetime(2025, 1, 1, tzinfo=timezone.utc)
        end = datetime(2025, 2, 1, tzinfo=timezone.utc)
        tr1 = TimeRange(start, end)
        tr2 = TimeRange(start, end)
        assert tr1.equals(tr2) is True

    def test_equals_different(self):
        start = datetime(2025, 1, 1, tzinfo=timezone.utc)
        end1 = datetime(2025, 2, 1, tzinfo=timezone.utc)
        end2 = datetime(2025, 3, 1, tzinfo=timezone.utc)
        tr1 = TimeRange(start, end1)
        tr2 = TimeRange(start, end2)
        assert tr1.equals(tr2) is False

    def test_equals_non_range(self):
        start = datetime(2025, 1, 1, tzinfo=timezone.utc)
        end = datetime(2025, 2, 1, tzinfo=timezone.utc)
        tr = TimeRange(start, end)
        assert tr.equals("not a range") is False


# ---------------------------------------------------------------------------
# AttributeInfo
# ---------------------------------------------------------------------------

class TestAttributeInfo:
    def test_creation(self):
        ai = AttributeInfo(name="price", type="NUMBER")
        assert ai.name == "price"
        assert ai.type == "NUMBER"
        assert ai.native_type is None

    def test_creation_with_native_type(self):
        ai = AttributeInfo(name="price", type="NUMBER", native_type="DOUBLE")
        assert ai.native_type == "DOUBLE"

    def test_from_js_minimal(self):
        ai = AttributeInfo.from_js({"name": "city"})
        assert ai.name == "city"
        assert ai.type == "STRING"

    def test_from_js_full(self):
        ai = AttributeInfo.from_js({
            "name": "price",
            "type": "NUMBER",
            "nativeType": "FLOAT8",
        })
        assert ai.name == "price"
        assert ai.type == "NUMBER"
        assert ai.native_type == "FLOAT8"

    def test_to_js_minimal(self):
        ai = AttributeInfo(name="city", type="STRING")
        js = ai.to_js()
        assert js == {"name": "city", "type": "STRING"}

    def test_to_js_with_native_type(self):
        ai = AttributeInfo(name="price", type="NUMBER", native_type="DOUBLE")
        js = ai.to_js()
        assert js == {"name": "price", "type": "NUMBER", "nativeType": "DOUBLE"}

    def test_drop_origin_info(self):
        ai = AttributeInfo(name="price", type="NUMBER", native_type="DOUBLE")
        dropped = ai.drop_origin_info()
        assert dropped.name == "price"
        assert dropped.type == "NUMBER"
        assert dropped.native_type is None


# ---------------------------------------------------------------------------
# Dataset
# ---------------------------------------------------------------------------

class TestDataset:
    def test_creation_default(self):
        ds = Dataset()
        assert ds.keys == []
        assert ds.data == [{}]

    def test_creation_custom(self):
        ds = Dataset(keys=["a"], data=[{"a": 1}])
        assert ds.keys == ["a"]
        assert ds.data == [{"a": 1}]

    def test_basis_true(self):
        ds = Dataset()
        assert ds.basis() is True

    def test_basis_false_non_empty_datum(self):
        ds = Dataset(data=[{"x": 1}])
        assert ds.basis() is False

    def test_basis_false_multiple_data(self):
        ds = Dataset(data=[{}, {}])
        assert ds.basis() is False

    def test_from_js(self):
        ds = Dataset.from_js({"keys": ["a", "b"], "data": [{"a": 1, "b": 2}]})
        assert ds.keys == ["a", "b"]
        assert ds.data == [{"a": 1, "b": 2}]

    def test_from_js_defaults(self):
        ds = Dataset.from_js({})
        assert ds.keys == []
        assert ds.data == [{}]
