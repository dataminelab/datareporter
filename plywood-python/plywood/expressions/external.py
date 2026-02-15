from __future__ import annotations
from .base import Expression

class ExternalExpression(Expression):
    op = "External"

    def __init__(self, params: dict):
        super().__init__(params)
        self.external = params.get("external")
        self.op = "external"
        self.type = "DATASET"

    @classmethod
    def from_js(cls, js: dict) -> ExternalExpression:
        from ..external.base import External
        ext = External.from_js(js.get("external", js))
        return cls({"op": "external", "external": ext})

    def to_js(self) -> dict:
        js = {"op": "external"}
        if self.external:
            js["external"] = self.external.to_js()
        return js

    def get_sql(self, dialect) -> str:
        raise ValueError("ExternalExpression cannot be directly converted to SQL")

Expression.register(ExternalExpression)
