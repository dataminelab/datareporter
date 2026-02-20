from __future__ import annotations
from .base import Expression
from .aggregate import _ChainableUnaryExpression

def _handle_null_check(elements, null_sql, join_op, fn):
    has_null = None in elements
    without_null = [e for e in elements if e is not None]
    parts = []
    if has_null:
        parts.append(null_sql)
    if without_null:
        parts.append(fn(without_null))
    return f" {join_op} ".join(parts) if parts else "FALSE"

class IsExpression(_ChainableUnaryExpression):
    op = "Is"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "is"
        self.type = "BOOLEAN"

    @classmethod
    def from_js(cls, js: dict) -> IsExpression:
        return cls(cls._js_to_value(js))

    def get_sql(self, dialect) -> str:
        from .literal import LiteralExpression
        from ..datatypes import Set

        operand_sql = self.operand.get_sql(dialect) if self.operand else ""
        expr_val = self.expression.get_literal_value() if self.expression else None

        if isinstance(expr_val, Set):
            if expr_val.empty():
                return "FALSE"
            t = self.expression.type
            if t in ("SET/STRING", "SET/NUMBER"):
                return _handle_null_check(
                    expr_val.elements,
                    f"{operand_sql} IS NULL",
                    "OR",
                    lambda elems: f"{operand_sql} IN ({','.join(str(v) if isinstance(v, (int, float)) else dialect.escape_literal(str(v)) for v in elems)})"
                )
            # Default: IS NOT DISTINCT FROM each element
            parts = []
            for e in expr_val.elements:
                from .literal import LiteralExpression
                lit = LiteralExpression({"op": "literal", "value": e})
                parts.append(dialect.is_not_distinct_from_expression(operand_sql, lit.get_sql(dialect)))
            return "(" + " OR ".join(parts) + ")"
        else:
            expr_sql = self.expression.get_sql(dialect) if self.expression else ""
            return dialect.is_not_distinct_from_expression(operand_sql, expr_sql)

class InExpression(_ChainableUnaryExpression):
    op = "In"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "in"
        self.type = "BOOLEAN"

    @classmethod
    def from_js(cls, js: dict) -> InExpression:
        params = cls._js_to_value(js)
        # Back compat: In with range -> Overlap
        if params.get("expression") and hasattr(params["expression"], "type"):
            from ..datatypes.common import is_range_type
            if is_range_type(params["expression"].type):
                params["op"] = "overlap"
                return OverlapExpression(params)
        return cls(params)

    def get_sql(self, dialect) -> str:
        raise ValueError(f"can not convert action to SQL {self}")

class OverlapExpression(_ChainableUnaryExpression):
    op = "Overlap"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "overlap"
        self.type = "BOOLEAN"

    @classmethod
    def from_js(cls, js: dict) -> OverlapExpression:
        return cls(cls._js_to_value(js))

    def get_sql(self, dialect) -> str:
        from .literal import LiteralExpression
        from ..datatypes import NumberRange, TimeRange, Set

        operand_sql = self.operand.get_sql(dialect) if self.operand else ""
        expr = self.expression
        expr_type = expr.type if expr else None

        if expr_type in ("NUMBER_RANGE", "TIME_RANGE") and isinstance(expr, LiteralExpression):
            rng = expr.value
            return dialect.in_expression(
                operand_sql,
                dialect.number_or_time_to_sql(rng.start),
                dialect.number_or_time_to_sql(rng.end),
                rng.bounds,
            )

        if expr_type in ("SET/NUMBER_RANGE", "SET/TIME_RANGE") and isinstance(expr, LiteralExpression):
            s = expr.value
            parts = []
            for rng in s.elements:
                parts.append(dialect.in_expression(
                    operand_sql,
                    dialect.number_or_time_to_sql(rng.start),
                    dialect.number_or_time_to_sql(rng.end),
                    rng.bounds,
                ))
            return " OR ".join(parts)

        raise ValueError(f"can not convert action to SQL {self}")

class LessThanExpression(_ChainableUnaryExpression):
    op = "LessThan"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "lessThan"
        self.type = "BOOLEAN"

    @classmethod
    def from_js(cls, js: dict) -> LessThanExpression:
        return cls(cls._js_to_value(js))

    def get_sql(self, dialect) -> str:
        a = self.operand.get_sql(dialect) if self.operand else ""
        b = self.expression.get_sql(dialect) if self.expression else ""
        return f"({a}<{b})"

class LessThanOrEqualExpression(_ChainableUnaryExpression):
    op = "LessThanOrEqual"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "lessThanOrEqual"
        self.type = "BOOLEAN"

    @classmethod
    def from_js(cls, js: dict) -> LessThanOrEqualExpression:
        return cls(cls._js_to_value(js))

    def get_sql(self, dialect) -> str:
        a = self.operand.get_sql(dialect) if self.operand else ""
        b = self.expression.get_sql(dialect) if self.expression else ""
        return f"({a}<={b})"

class GreaterThanExpression(_ChainableUnaryExpression):
    op = "GreaterThan"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "greaterThan"
        self.type = "BOOLEAN"

    @classmethod
    def from_js(cls, js: dict) -> GreaterThanExpression:
        return cls(cls._js_to_value(js))

    def get_sql(self, dialect) -> str:
        a = self.operand.get_sql(dialect) if self.operand else ""
        b = self.expression.get_sql(dialect) if self.expression else ""
        return f"({a}>{b})"

class GreaterThanOrEqualExpression(_ChainableUnaryExpression):
    op = "GreaterThanOrEqual"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "greaterThanOrEqual"
        self.type = "BOOLEAN"

    @classmethod
    def from_js(cls, js: dict) -> GreaterThanOrEqualExpression:
        return cls(cls._js_to_value(js))

    def get_sql(self, dialect) -> str:
        a = self.operand.get_sql(dialect) if self.operand else ""
        b = self.expression.get_sql(dialect) if self.expression else ""
        return f"({a}>={b})"

for _cls in [IsExpression, InExpression, OverlapExpression, LessThanExpression,
             LessThanOrEqualExpression, GreaterThanExpression, GreaterThanOrEqualExpression]:
    Expression.register(_cls)
