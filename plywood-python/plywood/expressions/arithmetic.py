from __future__ import annotations
from .base import Expression
from .aggregate import _ChainableUnaryExpression

class AddExpression(_ChainableUnaryExpression):
    op = "Add"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "add"
        self.type = "NUMBER"

    @classmethod
    def from_js(cls, js: dict) -> AddExpression:
        return cls(cls._js_to_value(js))

    def get_sql(self, dialect) -> str:
        a = self.operand.get_sql(dialect) if self.operand else ""
        b = self.expression.get_sql(dialect) if self.expression else ""
        return f"({a}+{b})"

class SubtractExpression(_ChainableUnaryExpression):
    op = "Subtract"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "subtract"
        self.type = "NUMBER"

    @classmethod
    def from_js(cls, js: dict) -> SubtractExpression:
        return cls(cls._js_to_value(js))

    def get_sql(self, dialect) -> str:
        a = self.operand.get_sql(dialect) if self.operand else ""
        b = self.expression.get_sql(dialect) if self.expression else ""
        return f"({a}-{b})"

class MultiplyExpression(_ChainableUnaryExpression):
    op = "Multiply"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "multiply"
        self.type = "NUMBER"

    @classmethod
    def from_js(cls, js: dict) -> MultiplyExpression:
        return cls(cls._js_to_value(js))

    def get_sql(self, dialect) -> str:
        a = self.operand.get_sql(dialect) if self.operand else ""
        b = self.expression.get_sql(dialect) if self.expression else ""
        return f"({a}*{b})"

class DivideExpression(_ChainableUnaryExpression):
    op = "Divide"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "divide"
        self.type = "NUMBER"

    @classmethod
    def from_js(cls, js: dict) -> DivideExpression:
        return cls(cls._js_to_value(js))

    def get_sql(self, dialect) -> str:
        a = self.operand.get_sql(dialect) if self.operand else ""
        b = self.expression.get_sql(dialect) if self.expression else ""
        return dialect.float_division(a, b)

for _cls in [AddExpression, SubtractExpression, MultiplyExpression, DivideExpression]:
    Expression.register(_cls)
