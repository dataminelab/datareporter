"""Tests for plywood.library.PlywoodLibrary."""
from __future__ import annotations

import pytest

from plywood.library import PlywoodLibrary


# ---------------------------------------------------------------------------
# get_supported_engines
# ---------------------------------------------------------------------------

class TestGetSupportedEngines:
    def test_returns_all_six(self):
        engines = PlywoodLibrary.get_supported_engines()
        assert len(engines) == 6

    def test_contains_postgres(self):
        assert "postgres" in PlywoodLibrary.get_supported_engines()

    def test_contains_mysql(self):
        assert "mysql" in PlywoodLibrary.get_supported_engines()

    def test_contains_bigquery(self):
        assert "bigquery" in PlywoodLibrary.get_supported_engines()

    def test_contains_athena(self):
        assert "athena" in PlywoodLibrary.get_supported_engines()

    def test_contains_druid(self):
        assert "druid" in PlywoodLibrary.get_supported_engines()

    def test_contains_json(self):
        assert "json" in PlywoodLibrary.get_supported_engines()


# ---------------------------------------------------------------------------
# convert_attributes
# ---------------------------------------------------------------------------

class TestConvertAttributes:
    def test_pg_integer(self):
        result = PlywoodLibrary.convert_attributes("pg", [
            {"name": "id", "type": "INTEGER"},
        ])
        assert result[0]["type"] == "NUMBER"

    def test_pg_varchar(self):
        result = PlywoodLibrary.convert_attributes("pg", [
            {"name": "city", "type": "VARCHAR"},
        ])
        assert result[0]["type"] == "STRING"

    def test_pg_timestamp(self):
        result = PlywoodLibrary.convert_attributes("pg", [
            {"name": "created", "type": "TIMESTAMP"},
        ])
        assert result[0]["type"] == "TIME"

    def test_mysql(self):
        result = PlywoodLibrary.convert_attributes("mysql", [
            {"name": "id", "type": "INT"},
            {"name": "name", "type": "VARCHAR(100)"},
        ])
        assert result[0]["type"] == "NUMBER"
        assert result[1]["type"] == "STRING"

    def test_bigquery(self):
        result = PlywoodLibrary.convert_attributes("bigquery", [
            {"name": "id", "type": "INT64"},
        ])
        assert result[0]["type"] == "NUMBER"

    def test_druid(self):
        result = PlywoodLibrary.convert_attributes("druid", [
            {"name": "__time", "type": "TIMESTAMP"},
            {"name": "count", "type": "BIGINT"},
        ])
        assert result[0]["type"] == "TIME"
        assert result[1]["type"] == "NUMBER"

    def test_json(self):
        result = PlywoodLibrary.convert_attributes("json", [
            {"name": "created", "type": "DATETIME"},
        ])
        assert result[0]["type"] == "TIME"


# ---------------------------------------------------------------------------
# filter_to_hash / hash_to_filter round-trip
# ---------------------------------------------------------------------------

class TestFilterHashRoundTrip:
    def test_simple_roundtrip(self):
        obj = {"op": "is", "value": "test"}
        hashed = PlywoodLibrary.filter_to_hash(obj)
        restored = PlywoodLibrary.hash_to_filter(hashed)
        assert restored == obj

    def test_complex_roundtrip(self):
        obj = {
            "filter": {
                "op": "and",
                "operands": [
                    {"op": "is", "operand": {"op": "ref", "name": "city"}, "expression": {"op": "literal", "value": "London"}},
                ],
            },
        }
        hashed = PlywoodLibrary.filter_to_hash(obj)
        restored = PlywoodLibrary.hash_to_filter(hashed)
        assert restored == obj

    def test_empty_object_roundtrip(self):
        obj = {}
        hashed = PlywoodLibrary.filter_to_hash(obj)
        restored = PlywoodLibrary.hash_to_filter(hashed)
        assert restored == obj


# ---------------------------------------------------------------------------
# _redash_db_name_to_plywood
# ---------------------------------------------------------------------------

class TestRedashDbNameToPlywood:
    def test_pg_to_postgres(self):
        assert PlywoodLibrary._redash_db_name_to_plywood("pg") == "postgres"

    def test_bigquery(self):
        assert PlywoodLibrary._redash_db_name_to_plywood("bigquery") == "bigquery"

    def test_mysql(self):
        assert PlywoodLibrary._redash_db_name_to_plywood("mysql") == "mysql"

    def test_druid(self):
        assert PlywoodLibrary._redash_db_name_to_plywood("druid") == "druid"

    def test_json(self):
        assert PlywoodLibrary._redash_db_name_to_plywood("json") == "json"

    def test_unknown_passes_through_lowered(self):
        assert PlywoodLibrary._redash_db_name_to_plywood("Oracle") == "oracle"

    def test_case_insensitive(self):
        assert PlywoodLibrary._redash_db_name_to_plywood("PG") == "postgres"
