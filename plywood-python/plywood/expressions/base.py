from __future__ import annotations
from typing import Any, Dict, Optional, Type

class Expression:
    """Base class for all Plywood expressions."""
    op: str = ""
    _registry: Dict[str, Type[Expression]] = {}

    def __init__(self, params: dict):
        self.op = params.get("op", self.__class__.op.lower() if hasattr(self.__class__, 'op') else "")
        self.type: Optional[str] = params.get("type")
        self.options: Optional[dict] = params.get("options")
        self.simple: bool = params.get("simple", False)

    @classmethod
    def register(cls, expr_class: Type[Expression]) -> None:
        op = getattr(expr_class, 'op', '')
        if op:
            # Register with lowercase first letter (matches TS convention)
            key = op[0].lower() + op[1:] if op else ''
            cls._registry[key] = expr_class

    @classmethod
    def from_js(cls, js: dict) -> Expression:
        if not js:
            raise ValueError("must have expressionJS")

        op = js.get("op") or js.get("action")
        if not op:
            raise ValueError("op must be defined")

        # Back compat
        if op == "custom":
            op = "customAggregate"
        if op == "chain":
            # Reconstruct chain expressions
            actions = js.get("actions") or [js.get("action")]
            base = Expression.from_js(js["expression"])
            for action_js in actions:
                if isinstance(action_js, dict):
                    action_js["operand"] = base.to_js()
                    base = Expression.from_js(action_js)
            return base

        expr_cls = cls._registry.get(op)
        if not expr_cls:
            raise ValueError(f"unsupported expression op '{op}'")
        return expr_cls.from_js(js)

    def to_js(self) -> dict:
        js: dict = {"op": self.op}
        if self.options:
            js["options"] = self.options
        return js

    def get_sql(self, dialect, minimal: bool = False) -> str:
        raise NotImplementedError(f"get_sql not implemented for {self.__class__.__name__}")

    def get_type(self) -> Optional[str]:
        return self.type

    def equals(self, other) -> bool:
        if not isinstance(other, Expression):
            return False
        return self.op == other.op and self.type == other.type

    def is_op(self, op: str) -> bool:
        return self.op == op

    def get_literal_value(self):
        return None

    def get_free_references(self) -> list:
        return []

    def resolved(self) -> bool:
        return True

    def simulate_query_plan(self, context: dict, options: dict = None) -> list:
        """Simulate the query plan for this expression tree."""
        from ..external.base import External

        # Walk the expression tree to find the external and build queries
        queries = []
        self._collect_queries(context, queries, options)
        return queries if queries else [[]]

    def _collect_queries(self, context: dict, queries: list, options: dict = None):
        """Recursively collect SQL queries from the expression tree."""
        pass

    def simulate(self, context: dict, options: dict = None):
        """Simulate the expression and return a shape with dummy data."""
        return {}
