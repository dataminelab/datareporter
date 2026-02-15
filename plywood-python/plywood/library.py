from __future__ import annotations
import itertools
from typing import Any, Dict, List, Optional

from .expressions.base import Expression
from .external.base import External
from .external.sql_external import SQLExternal
from .formatter import response_formatter
from .attributes.factory import AttributeParserFactory
from .turnilo.hash_codec import compress_to_base64, decompress_from_base64, filter_to_hash, hash_to_filter
from .turnilo.hash_to_expression import hash_to_expression
import json

class PlywoodLibrary:
    """Plywood expression tree → SQL translator. Drop-in replacement for the former PlywoodApi HTTP client."""

    @classmethod
    def convert_to_sql(cls, body: dict) -> List[str]:
        """Convert expression + context → SQL queries (flattened)."""
        expression_js = body.get("expression", {})
        context_js = body.get("context", {})
        data_cube = body.get("dataCube", "")

        expression = Expression.from_js(expression_js)
        external = SQLExternal(context_js)

        # Get SQL queries
        queries = external.get_query_and_post_transform(expression, {data_cube: external})

        # Format
        formatted = response_formatter([queries])
        return list(itertools.chain.from_iterable(formatted))

    @classmethod
    def get_supported_engines(cls) -> List[str]:
        return AttributeParserFactory.get_supported_engines()

    @classmethod
    def convert_hash_to_expression(cls, hash_str: str, data_cube: dict) -> dict:
        return hash_to_expression(hash_str, data_cube)

    @classmethod
    def convert_attributes(cls, redash_db_type: str, attributes: list) -> List[dict]:
        engine = cls._redash_db_name_to_plywood(redash_db_type)
        parser_cls = AttributeParserFactory.get_parser(engine)
        parser = parser_cls(attributes)
        return parser.parse_attributes()

    @classmethod
    def get_shape(cls, body: dict) -> dict:
        expression_js = body.get("expression", {})
        context_js = body.get("context", {})
        data_cube = body.get("dataCube", "")

        expression = Expression.from_js(expression_js)
        external = External.from_js(context_js)

        return expression.simulate({data_cube: external}, {"others": expression_js})

    @classmethod
    def filter_to_hash(cls, json_obj: Any) -> str:
        return filter_to_hash(json_obj)

    @classmethod
    def hash_to_filter(cls, hash_str: str) -> Any:
        return hash_to_filter(hash_str)

    @staticmethod
    def _redash_db_name_to_plywood(redash_db_name: str) -> str:
        mapping = {
            "pg": "postgres",
            "bigquery": "bigquery",
            "mysql": "mysql",
            "druid": "druid",
            "json": "json",
        }
        return mapping.get(redash_db_name.lower(), redash_db_name.lower())
