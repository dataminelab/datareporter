from __future__ import annotations
from typing import Any, Dict, List, Optional
from ..datatypes.attribute_info import AttributeInfo

class External:
    """Represents an external data source (database table)."""

    def __init__(self, params: dict):
        self.engine: str = params.get("engine", "")
        self.source: str = params.get("source", "")
        self.table: str = params.get("table") or params.get("source", "")
        self.attributes: List[AttributeInfo] = []
        self.derived_attributes: Dict[str, Any] = params.get("derivedAttributes", {})
        self.filter = params.get("filter")
        self.mode: str = params.get("mode", "raw")
        self.with_query: Optional[str] = params.get("withQuery")

        raw_attrs = params.get("attributes", [])
        for a in raw_attrs:
            if isinstance(a, dict):
                self.attributes.append(AttributeInfo.from_js(a))
            elif isinstance(a, AttributeInfo):
                self.attributes.append(a)

    @classmethod
    def from_js(cls, js: dict) -> External:
        if not js:
            return cls({})
        return cls(js)

    def to_js(self) -> dict:
        result = {"engine": self.engine, "source": self.source}
        if self.attributes:
            result["attributes"] = [a.to_js() for a in self.attributes]
        return result

    def get_dialect(self):
        """Return the appropriate SQL dialect for this external's engine."""
        from ..dialect import PostgresDialect, MySQLDialect, BigQueryDialect, AthenaDialect, DruidDialect

        dialects = {
            "postgres": PostgresDialect,
            "mysql": MySQLDialect,
            "bigquery": BigQueryDialect,
            "athena": AthenaDialect,
            "druid": lambda: DruidDialect(self.attributes),
        }
        factory = dialects.get(self.engine)
        if factory:
            return factory() if callable(factory) else factory()
        return PostgresDialect()  # default
