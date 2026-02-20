from __future__ import annotations
from typing import Dict, Type
from .base import AttributeParser

class AttributeParserFactory:
    _parsers: Dict[str, Type[AttributeParser]] = {}

    @classmethod
    def register(cls, parser_class: Type[AttributeParser]) -> None:
        engine = getattr(parser_class, 'engine', '')
        if engine:
            cls._parsers[engine.lower()] = parser_class

    @classmethod
    def get_supported_engines(cls) -> list:
        return list(cls._parsers.keys())

    @classmethod
    def get_parser(cls, engine: str) -> Type[AttributeParser]:
        engine = engine.lower()
        if engine not in cls._parsers:
            raise ValueError(f"No parser registered for engine {engine}")
        return cls._parsers[engine]

# Import and register all parsers
from .postgres import PostgresParser
from .mysql import MySQLParser
from .bigquery import BigQueryParser
from .athena import AthenaParser
from .druid import DruidParser
from .json_parser import JsonParser

for p in [PostgresParser, MySQLParser, BigQueryParser, AthenaParser, DruidParser, JsonParser]:
    AttributeParserFactory.register(p)
