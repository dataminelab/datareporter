from __future__ import annotations
from .base import Expression

class RefExpression(Expression):
    op = "Ref"

    def __init__(self, params: dict):
        super().__init__(params)
        self.name: str = params["name"]
        self.nest: int = params.get("nest", 0)
        self.ignore_case: bool = params.get("ignoreCase", False)
        self.op = "ref"
        if not self.type and params.get("type"):
            self.type = params["type"]

    @classmethod
    def from_js(cls, js: dict) -> RefExpression:
        return cls({
            "op": "ref",
            "name": js["name"],
            "nest": js.get("nest", 0),
            "type": js.get("type"),
            "ignoreCase": js.get("ignoreCase", False),
        })

    def to_js(self) -> dict:
        js = {"op": "ref", "name": self.name}
        if self.nest:
            js["nest"] = self.nest
        if self.type:
            js["type"] = self.type
        if self.ignore_case:
            js["ignoreCase"] = True
        return js

    def get_sql(self, dialect, minimal: bool = False) -> str:
        if self.nest:
            raise ValueError(f"can not call get_sql on unresolved expression: {self}")
        return dialect.maybe_namespaced_name(self.name)

    def get_free_references(self) -> list:
        return [self.name]

    def equals(self, other) -> bool:
        if not isinstance(other, RefExpression):
            return False
        return self.name == other.name and self.nest == other.nest

Expression.register(RefExpression)
