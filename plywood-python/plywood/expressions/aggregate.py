from __future__ import annotations
from .base import Expression

class _ChainableUnaryExpression(Expression):
    """Base for expressions with operand + expression."""
    def __init__(self, params: dict):
        super().__init__(params)
        self.operand = params.get("operand")
        self.expression = params.get("expression")
        if isinstance(self.operand, dict):
            self.operand = Expression.from_js(self.operand)
        if isinstance(self.expression, dict):
            self.expression = Expression.from_js(self.expression)

    @classmethod
    def _js_to_value(cls, js: dict) -> dict:
        params = {"op": js.get("op")}
        if "operand" in js:
            params["operand"] = Expression.from_js(js["operand"])
        elif "action" in js:
            params["operand"] = RefExpression.from_js({"name": "_", "nest": 0, "op": "ref"})
        if "expression" in js:
            params["expression"] = Expression.from_js(js["expression"])
        params["type"] = js.get("type")
        params["options"] = js.get("options")
        return params

class _ChainableExpression(Expression):
    """Base for expressions with just operand (no expression)."""
    def __init__(self, params: dict):
        super().__init__(params)
        self.operand = params.get("operand")
        if isinstance(self.operand, dict):
            self.operand = Expression.from_js(self.operand)

    @classmethod
    def _js_to_value(cls, js: dict) -> dict:
        params = {"op": js.get("op")}
        if "operand" in js:
            params["operand"] = Expression.from_js(js["operand"])
        params["type"] = js.get("type")
        params["options"] = js.get("options")
        return params

from .ref import RefExpression

class CountExpression(_ChainableExpression):
    op = "Count"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "count"
        self.type = "NUMBER"

    @classmethod
    def from_js(cls, js: dict) -> CountExpression:
        return cls(cls._js_to_value(js))

    def get_sql(self, dialect) -> str:
        operand_sql = self.operand.get_sql(dialect) if self.operand else ""
        if " WHERE " not in operand_sql:
            return "COUNT(*)"
        return f"SUM({dialect.aggregate_filter_if_needed(operand_sql, '1', '0')})"

class SumExpression(_ChainableUnaryExpression):
    op = "Sum"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "sum"
        self.type = "NUMBER"

    @classmethod
    def from_js(cls, js: dict) -> SumExpression:
        return cls(cls._js_to_value(js))

    def get_sql(self, dialect) -> str:
        operand_sql = self.operand.get_sql(dialect) if self.operand else ""
        expr_sql = self.expression.get_sql(dialect) if self.expression else ""
        return f"SUM({dialect.aggregate_filter_if_needed(operand_sql, expr_sql, '0')})"

class AverageExpression(_ChainableUnaryExpression):
    op = "Average"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "average"
        self.type = "NUMBER"

    @classmethod
    def from_js(cls, js: dict) -> AverageExpression:
        return cls(cls._js_to_value(js))

    def get_sql(self, dialect) -> str:
        operand_sql = self.operand.get_sql(dialect) if self.operand else ""
        expr_sql = self.expression.get_sql(dialect) if self.expression else ""
        return f"AVG({dialect.aggregate_filter_if_needed(operand_sql, expr_sql)})"

class MinExpression(_ChainableUnaryExpression):
    op = "Min"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "min"
        self.type = "NUMBER"

    @classmethod
    def from_js(cls, js: dict) -> MinExpression:
        return cls(cls._js_to_value(js))

    def get_sql(self, dialect) -> str:
        operand_sql = self.operand.get_sql(dialect) if self.operand else ""
        expr_sql = self.expression.get_sql(dialect) if self.expression else ""
        return f"MIN({dialect.aggregate_filter_if_needed(operand_sql, expr_sql)})"

class MaxExpression(_ChainableUnaryExpression):
    op = "Max"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "max"
        self.type = "NUMBER"

    @classmethod
    def from_js(cls, js: dict) -> MaxExpression:
        return cls(cls._js_to_value(js))

    def get_sql(self, dialect) -> str:
        operand_sql = self.operand.get_sql(dialect) if self.operand else ""
        expr_sql = self.expression.get_sql(dialect) if self.expression else ""
        return f"MAX({dialect.aggregate_filter_if_needed(operand_sql, expr_sql)})"

class CountDistinctExpression(_ChainableUnaryExpression):
    op = "CountDistinct"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "countDistinct"
        self.type = "NUMBER"

    @classmethod
    def from_js(cls, js: dict) -> CountDistinctExpression:
        return cls(cls._js_to_value(js))

    def get_sql(self, dialect) -> str:
        expr_sql = self.expression.get_sql(dialect) if self.expression else ""
        return dialect.count_distinct_expression(expr_sql)

class QuantileExpression(_ChainableUnaryExpression):
    op = "Quantile"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "quantile"
        self.quantile_value: float = params.get("value", 0.5)
        self.tuning: str = params.get("tuning")
        self.type = "NUMBER"

    @classmethod
    def from_js(cls, js: dict) -> QuantileExpression:
        params = cls._js_to_value(js)
        params["value"] = js.get("value", 0.5)
        params["tuning"] = js.get("tuning")
        return cls(params)

    def get_sql(self, dialect) -> str:
        expr_sql = self.expression.get_sql(dialect) if self.expression else ""
        return dialect.quantile_expression(expr_sql, self.quantile_value)

class CardinalityExpression(_ChainableExpression):
    op = "Cardinality"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "cardinality"
        self.type = "NUMBER"

    @classmethod
    def from_js(cls, js: dict) -> CardinalityExpression:
        return cls(cls._js_to_value(js))

    def get_sql(self, dialect) -> str:
        operand_sql = self.operand.get_sql(dialect) if self.operand else ""
        return f"COUNT(DISTINCT {operand_sql})"

for _cls in [CountExpression, SumExpression, AverageExpression, MinExpression,
             MaxExpression, CountDistinctExpression, QuantileExpression, CardinalityExpression]:
    Expression.register(_cls)
