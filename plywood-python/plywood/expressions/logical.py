from __future__ import annotations
from .base import Expression
from .aggregate import _ChainableUnaryExpression, _ChainableExpression

class AndExpression(_ChainableUnaryExpression):
    op = "And"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "and"
        self.type = "BOOLEAN"

    @classmethod
    def from_js(cls, js: dict) -> AndExpression:
        return cls(cls._js_to_value(js))

    def get_sql(self, dialect) -> str:
        a = self.operand.get_sql(dialect) if self.operand else ""
        b = self.expression.get_sql(dialect) if self.expression else ""
        return f"({a} AND {b})"

class OrExpression(_ChainableUnaryExpression):
    op = "Or"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "or"
        self.type = "BOOLEAN"

    @classmethod
    def from_js(cls, js: dict) -> OrExpression:
        return cls(cls._js_to_value(js))

    def get_sql(self, dialect) -> str:
        a = self.operand.get_sql(dialect) if self.operand else ""
        b = self.expression.get_sql(dialect) if self.expression else ""
        return f"({a} OR {b})"

class NotExpression(_ChainableExpression):
    op = "Not"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "not"
        self.type = "BOOLEAN"

    @classmethod
    def from_js(cls, js: dict) -> NotExpression:
        return cls(cls._js_to_value(js))

    def get_sql(self, dialect) -> str:
        operand_sql = self.operand.get_sql(dialect) if self.operand else ""
        return f"NOT({operand_sql})"

for _cls in [AndExpression, OrExpression, NotExpression]:
    Expression.register(_cls)
