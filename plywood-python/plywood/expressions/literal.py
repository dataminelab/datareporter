from __future__ import annotations
from datetime import datetime
from typing import Any
from .base import Expression

class LiteralExpression(Expression):
    op = "Literal"

    def __init__(self, params: dict):
        super().__init__(params)
        self.value = params.get("value")
        self.op = "literal"
        if self.type is None:
            self.type = self._infer_type()

    def _infer_type(self) -> str:
        from ..datatypes import get_value_type, Set, NumberRange, TimeRange
        v = self.value
        if v is None: return "NULL"
        if isinstance(v, bool): return "BOOLEAN"
        if isinstance(v, (int, float)): return "NUMBER"
        if isinstance(v, str): return "STRING"
        if isinstance(v, datetime): return "TIME"
        if isinstance(v, NumberRange): return "NUMBER_RANGE"
        if isinstance(v, TimeRange): return "TIME_RANGE"
        if isinstance(v, Set): return v.set_type
        return "NULL"

    @classmethod
    def from_js(cls, js: dict) -> LiteralExpression:
        from ..datatypes import Set, NumberRange, TimeRange

        value = js.get("value")
        ply_type = js.get("type")

        # Parse typed values
        if ply_type == "TIME" and isinstance(value, str):
            value = datetime.fromisoformat(value.replace("Z", "+00:00"))
        elif ply_type == "SET" and isinstance(value, dict):
            value = Set.from_js(value)
        elif ply_type == "SET" and isinstance(value, list):
            value = Set.from_js(value)
        elif isinstance(value, dict):
            if "start" in value and "end" in value:
                # Range type
                if ply_type == "TIME_RANGE" or (isinstance(value.get("start"), str) and "T" in str(value.get("start", ""))):
                    value = TimeRange.from_js(value)
                else:
                    value = NumberRange.from_js(value)
            elif "setType" in value or "elements" in value:
                value = Set.from_js(value)
        elif isinstance(value, list):
            value = Set.from_js(value)

        return cls({"op": "literal", "value": value, "type": ply_type})

    def to_js(self) -> dict:
        from ..datatypes import Set, NumberRange, TimeRange
        js = {"op": "literal"}
        v = self.value
        if v is not None and hasattr(v, "to_js"):
            js["value"] = v.to_js()
            if isinstance(v, Set):
                js["type"] = "SET"
            else:
                js["type"] = self.type
        else:
            js["value"] = v
            if self.type == "TIME":
                js["type"] = "TIME"
        return js

    def get_sql(self, dialect) -> str:
        from ..datatypes import Set, NumberRange, TimeRange
        v = self.value
        if v is None:
            return dialect.null_constant()

        t = self.type
        if t == "STRING":
            return dialect.escape_literal(v)
        elif t == "BOOLEAN":
            return dialect.boolean_to_sql(v)
        elif t == "NUMBER":
            return dialect.number_to_sql(v)
        elif t == "NUMBER_RANGE":
            return dialect.number_to_sql(v.start)
        elif t == "TIME":
            return dialect.time_to_sql(v)
        elif t == "TIME_RANGE":
            return dialect.time_to_sql(v.start)
        elif t and t.startswith("SET/"):
            return "<DUMMY>"
        else:
            return str(v)

    def get_literal_value(self):
        return self.value

    def equals(self, other) -> bool:
        if not isinstance(other, LiteralExpression):
            return False
        if self.type != other.type:
            return False
        if hasattr(self.value, 'equals'):
            return self.value.equals(other.value)
        return self.value == other.value

# Static literal instances
Expression.register(LiteralExpression)
