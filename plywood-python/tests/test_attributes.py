"""Tests for plywood.attributes module - all 6 attribute parsers + factory."""
from __future__ import annotations

import pytest

from plywood.attributes.postgres import PostgresParser
from plywood.attributes.mysql import MySQLParser
from plywood.attributes.bigquery import BigQueryParser
from plywood.attributes.athena import AthenaParser
from plywood.attributes.druid import DruidParser
from plywood.attributes.json_parser import JsonParser
from plywood.attributes.factory import AttributeParserFactory


# ---------------------------------------------------------------------------
# PostgresParser
# ---------------------------------------------------------------------------

class TestPostgresParser:
    def test_integer_to_number(self):
        parser = PostgresParser([{"name": "id", "type": "INTEGER"}])
        result = parser.parse_attributes()
        assert result[0]["type"] == "NUMBER"

    def test_varchar_to_string(self):
        parser = PostgresParser([{"name": "city", "type": "VARCHAR"}])
        result = parser.parse_attributes()
        assert result[0]["type"] == "STRING"

    def test_text_to_string(self):
        parser = PostgresParser([{"name": "desc", "type": "TEXT"}])
        result = parser.parse_attributes()
        assert result[0]["type"] == "STRING"

    def test_timestamp_to_time(self):
        parser = PostgresParser([{"name": "created", "type": "TIMESTAMP"}])
        result = parser.parse_attributes()
        assert result[0]["type"] == "TIME"

    def test_timestamp_with_tz_to_time(self):
        parser = PostgresParser([{"name": "created", "type": "TIMESTAMP WITH TIME ZONE"}])
        result = parser.parse_attributes()
        assert result[0]["type"] == "TIME"

    def test_boolean_to_boolean(self):
        parser = PostgresParser([{"name": "active", "type": "BOOLEAN"}])
        result = parser.parse_attributes()
        assert result[0]["type"] == "BOOLEAN"

    def test_array_to_set_string(self):
        parser = PostgresParser([{"name": "tags", "type": "ARRAY"}])
        result = parser.parse_attributes()
        assert result[0]["type"] == "SET/STRING"

    def test_bigint_to_number(self):
        parser = PostgresParser([{"name": "count", "type": "BIGINT"}])
        result = parser.parse_attributes()
        assert result[0]["type"] == "NUMBER"

    def test_double_precision_to_number(self):
        parser = PostgresParser([{"name": "val", "type": "DOUBLE PRECISION"}])
        result = parser.parse_attributes()
        assert result[0]["type"] == "NUMBER"

    def test_native_type_preserved(self):
        parser = PostgresParser([{"name": "id", "type": "INTEGER"}])
        result = parser.parse_attributes()
        assert result[0]["nativeType"] == "INTEGER"

    def test_multiple_attributes(self):
        parser = PostgresParser([
            {"name": "id", "type": "INTEGER"},
            {"name": "name", "type": "VARCHAR"},
            {"name": "created", "type": "TIMESTAMP"},
        ])
        result = parser.parse_attributes()
        assert len(result) == 3
        assert result[0]["type"] == "NUMBER"
        assert result[1]["type"] == "STRING"
        assert result[2]["type"] == "TIME"


# ---------------------------------------------------------------------------
# MySQLParser
# ---------------------------------------------------------------------------

class TestMySQLParser:
    def test_int_to_number(self):
        parser = MySQLParser([{"name": "id", "type": "INT"}])
        result = parser.parse_attributes()
        assert result[0]["type"] == "NUMBER"

    def test_varchar_to_string(self):
        parser = MySQLParser([{"name": "city", "type": "VARCHAR(255)"}])
        result = parser.parse_attributes()
        assert result[0]["type"] == "STRING"

    def test_datetime_to_time(self):
        parser = MySQLParser([{"name": "created", "type": "DATETIME"}])
        result = parser.parse_attributes()
        assert result[0]["type"] == "TIME"

    def test_timestamp_to_time(self):
        parser = MySQLParser([{"name": "created", "type": "TIMESTAMP"}])
        result = parser.parse_attributes()
        assert result[0]["type"] == "TIME"

    def test_tinyint_to_number(self):
        # TINYINT maps to NUMBER (not BOOLEAN) in the base mapping
        parser = MySQLParser([{"name": "flag", "type": "TINYINT"}])
        result = parser.parse_attributes()
        assert result[0]["type"] == "NUMBER"

    def test_boolean_to_boolean(self):
        parser = MySQLParser([{"name": "active", "type": "BOOLEAN"}])
        result = parser.parse_attributes()
        assert result[0]["type"] == "BOOLEAN"

    def test_bigint_to_number(self):
        parser = MySQLParser([{"name": "count", "type": "BIGINT"}])
        result = parser.parse_attributes()
        assert result[0]["type"] == "NUMBER"

    def test_text_to_string(self):
        parser = MySQLParser([{"name": "body", "type": "TEXT"}])
        result = parser.parse_attributes()
        assert result[0]["type"] == "STRING"

    def test_float_to_number(self):
        parser = MySQLParser([{"name": "rate", "type": "FLOAT"}])
        result = parser.parse_attributes()
        assert result[0]["type"] == "NUMBER"


# ---------------------------------------------------------------------------
# BigQueryParser
# ---------------------------------------------------------------------------

class TestBigQueryParser:
    def test_int64_to_number(self):
        parser = BigQueryParser([{"name": "id", "type": "INT64"}])
        result = parser.parse_attributes()
        assert result[0]["type"] == "NUMBER"

    def test_string_to_string(self):
        parser = BigQueryParser([{"name": "city", "type": "STRING"}])
        result = parser.parse_attributes()
        assert result[0]["type"] == "STRING"

    def test_timestamp_to_time(self):
        parser = BigQueryParser([{"name": "created", "type": "TIMESTAMP"}])
        result = parser.parse_attributes()
        assert result[0]["type"] == "TIME"

    def test_bool_to_boolean(self):
        parser = BigQueryParser([{"name": "active", "type": "BOOL"}])
        result = parser.parse_attributes()
        assert result[0]["type"] == "BOOLEAN"

    def test_boolean_to_boolean(self):
        parser = BigQueryParser([{"name": "active", "type": "BOOLEAN"}])
        result = parser.parse_attributes()
        assert result[0]["type"] == "BOOLEAN"

    def test_float64_to_number(self):
        parser = BigQueryParser([{"name": "rate", "type": "FLOAT64"}])
        result = parser.parse_attributes()
        assert result[0]["type"] == "NUMBER"

    def test_numeric_to_number(self):
        parser = BigQueryParser([{"name": "val", "type": "NUMERIC"}])
        result = parser.parse_attributes()
        assert result[0]["type"] == "NUMBER"


# ---------------------------------------------------------------------------
# AthenaParser
# ---------------------------------------------------------------------------

class TestAthenaParser:
    def test_integer_to_number(self):
        parser = AthenaParser([{"name": "id", "type": "INTEGER"}])
        result = parser.parse_attributes()
        assert result[0]["type"] == "NUMBER"

    def test_varchar_to_string(self):
        parser = AthenaParser([{"name": "city", "type": "VARCHAR"}])
        result = parser.parse_attributes()
        assert result[0]["type"] == "STRING"

    def test_timestamp_to_time(self):
        parser = AthenaParser([{"name": "created", "type": "TIMESTAMP"}])
        result = parser.parse_attributes()
        assert result[0]["type"] == "TIME"

    def test_boolean_to_boolean(self):
        parser = AthenaParser([{"name": "active", "type": "BOOLEAN"}])
        result = parser.parse_attributes()
        assert result[0]["type"] == "BOOLEAN"

    def test_bigint_to_number(self):
        parser = AthenaParser([{"name": "count", "type": "BIGINT"}])
        result = parser.parse_attributes()
        assert result[0]["type"] == "NUMBER"

    def test_double_to_number(self):
        parser = AthenaParser([{"name": "rate", "type": "DOUBLE"}])
        result = parser.parse_attributes()
        assert result[0]["type"] == "NUMBER"


# ---------------------------------------------------------------------------
# DruidParser
# ---------------------------------------------------------------------------

class TestDruidParser:
    def test_bigint_to_number(self):
        parser = DruidParser([{"name": "count", "type": "BIGINT"}])
        result = parser.parse_attributes()
        assert result[0]["type"] == "NUMBER"

    def test_varchar_to_string(self):
        parser = DruidParser([{"name": "city", "type": "VARCHAR"}])
        result = parser.parse_attributes()
        assert result[0]["type"] == "STRING"

    def test_timestamp_to_time(self):
        parser = DruidParser([{"name": "__time", "type": "TIMESTAMP"}])
        result = parser.parse_attributes()
        assert result[0]["type"] == "TIME"

    def test_double_to_number(self):
        parser = DruidParser([{"name": "rate", "type": "DOUBLE"}])
        result = parser.parse_attributes()
        assert result[0]["type"] == "NUMBER"

    def test_complex_hyperunique(self):
        parser = DruidParser([{"name": "uniq", "type": "COMPLEX<HYPERUNIQUE>"}])
        result = parser.parse_attributes()
        assert result[0]["type"] == "NUMBER"

    def test_complex_thetasketch(self):
        parser = DruidParser([{"name": "theta", "type": "COMPLEX<THETASKETCH>"}])
        result = parser.parse_attributes()
        assert result[0]["type"] == "NUMBER"


# ---------------------------------------------------------------------------
# JsonParser
# ---------------------------------------------------------------------------

class TestJsonParser:
    def test_integer_to_number(self):
        parser = JsonParser([{"name": "id", "type": "INTEGER"}])
        result = parser.parse_attributes()
        assert result[0]["type"] == "NUMBER"

    def test_string_to_string(self):
        parser = JsonParser([{"name": "city", "type": "STRING"}])
        result = parser.parse_attributes()
        assert result[0]["type"] == "STRING"

    def test_datetime_to_time(self):
        parser = JsonParser([{"name": "created", "type": "DATETIME"}])
        result = parser.parse_attributes()
        assert result[0]["type"] == "TIME"

    def test_boolean_to_boolean(self):
        parser = JsonParser([{"name": "active", "type": "BOOLEAN"}])
        result = parser.parse_attributes()
        assert result[0]["type"] == "BOOLEAN"

    def test_float_to_number(self):
        parser = JsonParser([{"name": "rate", "type": "FLOAT"}])
        result = parser.parse_attributes()
        assert result[0]["type"] == "NUMBER"

    def test_time_column_flag(self):
        parser = JsonParser([{"name": "created", "type": "DATETIME"}])
        result = parser.parse_attributes()
        assert result[0].get("isTimeColumn") is True

    def test_non_time_column_flag(self):
        parser = JsonParser([{"name": "id", "type": "INTEGER"}])
        result = parser.parse_attributes()
        assert result[0].get("isTimeColumn") is False

    def test_unknown_type_defaults_to_string(self):
        parser = JsonParser([{"name": "foo", "type": "UNKNOWN_TYPE"}])
        result = parser.parse_attributes()
        assert result[0]["type"] == "STRING"


# ---------------------------------------------------------------------------
# AttributeParserFactory
# ---------------------------------------------------------------------------

class TestAttributeParserFactory:
    def test_get_supported_engines(self):
        engines = AttributeParserFactory.get_supported_engines()
        assert "postgres" in engines
        assert "mysql" in engines
        assert "bigquery" in engines
        assert "athena" in engines
        assert "druid" in engines
        assert "json" in engines

    def test_get_supported_engines_count(self):
        engines = AttributeParserFactory.get_supported_engines()
        assert len(engines) == 6

    def test_get_parser_postgres(self):
        parser_cls = AttributeParserFactory.get_parser("postgres")
        assert parser_cls is PostgresParser

    def test_get_parser_mysql(self):
        parser_cls = AttributeParserFactory.get_parser("mysql")
        assert parser_cls is MySQLParser

    def test_get_parser_bigquery(self):
        parser_cls = AttributeParserFactory.get_parser("bigquery")
        assert parser_cls is BigQueryParser

    def test_get_parser_athena(self):
        parser_cls = AttributeParserFactory.get_parser("athena")
        assert parser_cls is AthenaParser

    def test_get_parser_druid(self):
        parser_cls = AttributeParserFactory.get_parser("druid")
        assert parser_cls is DruidParser

    def test_get_parser_json(self):
        parser_cls = AttributeParserFactory.get_parser("json")
        assert parser_cls is JsonParser

    def test_get_parser_case_insensitive(self):
        parser_cls = AttributeParserFactory.get_parser("POSTGRES")
        assert parser_cls is PostgresParser

    def test_get_parser_unknown_raises(self):
        with pytest.raises(ValueError, match="No parser registered"):
            AttributeParserFactory.get_parser("oracle")


# ---------------------------------------------------------------------------
# Edge cases
# ---------------------------------------------------------------------------

class TestEdgeCases:
    def test_empty_attribute_list(self):
        parser = PostgresParser([])
        result = parser.parse_attributes()
        assert result == []

    def test_unknown_postgres_type_defaults_to_string(self):
        parser = PostgresParser([{"name": "x", "type": "JSONB"}])
        result = parser.parse_attributes()
        assert result[0]["type"] == "STRING"

    def test_unknown_bigquery_type_defaults_to_string(self):
        parser = BigQueryParser([{"name": "x", "type": "GEOGRAPHY"}])
        result = parser.parse_attributes()
        assert result[0]["type"] == "STRING"

    def test_unknown_druid_type_defaults_to_string(self):
        parser = DruidParser([{"name": "x", "type": "UNKNOWN"}])
        result = parser.parse_attributes()
        assert result[0]["type"] == "STRING"

    def test_is_supported_flag_valid_type(self):
        parser = PostgresParser([{"name": "id", "type": "INTEGER"}])
        result = parser.parse_attributes()
        assert result[0].get("isSupported") is True

    def test_is_supported_flag_invalid_type(self):
        parser = PostgresParser([{"name": "x", "type": "JSONB"}])
        result = parser.parse_attributes()
        # STRING is a valid PlyType, so it should be supported
        assert result[0].get("isSupported") is True
