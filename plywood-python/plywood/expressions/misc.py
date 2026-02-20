from __future__ import annotations
from .base import Expression
from .aggregate import _ChainableUnaryExpression, _ChainableExpression

class CastExpression(_ChainableExpression):
    op = "Cast"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "cast"
        self.output_type: str = params.get("outputType", "STRING")
        self.type = self.output_type

    @classmethod
    def from_js(cls, js: dict) -> CastExpression:
        params = cls._js_to_value(js)
        params["outputType"] = js.get("outputType", "STRING")
        return cls(params)

    def get_sql(self, dialect) -> str:
        operand_sql = self.operand.get_sql(dialect) if self.operand else ""
        input_type = (self.operand.type if self.operand and self.operand.type else "STRING")
        return dialect.cast_expression(input_type, operand_sql, self.output_type)

class FallbackExpression(_ChainableUnaryExpression):
    op = "Fallback"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "fallback"

    @classmethod
    def from_js(cls, js: dict) -> FallbackExpression:
        return cls(cls._js_to_value(js))

    def get_sql(self, dialect) -> str:
        a = self.operand.get_sql(dialect) if self.operand else ""
        b = self.expression.get_sql(dialect) if self.expression else ""
        return dialect.coalesce_expression(a, b)

class ThenExpression(_ChainableUnaryExpression):
    op = "Then"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "then"

    @classmethod
    def from_js(cls, js: dict) -> ThenExpression:
        return cls(cls._js_to_value(js))

    def get_sql(self, dialect) -> str:
        a = self.operand.get_sql(dialect) if self.operand else ""
        b = self.expression.get_sql(dialect) if self.expression else ""
        return dialect.if_then_else_expression(a, b)

class NumberBucketExpression(_ChainableExpression):
    op = "NumberBucket"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "numberBucket"
        self.size: float = params.get("size", 1)
        self.offset: float = params.get("offset", 0)
        self.type = "NUMBER_RANGE"

    @classmethod
    def from_js(cls, js: dict) -> NumberBucketExpression:
        params = cls._js_to_value(js)
        params["size"] = js.get("size", 1)
        params["offset"] = js.get("offset", 0)
        return cls(params)

    def get_sql(self, dialect) -> str:
        operand_sql = self.operand.get_sql(dialect) if self.operand else ""
        size = self.size
        offset = self.offset
        if offset == 0:
            return f"FLOOR({operand_sql}/{size})*{size}"
        return f"FLOOR(({operand_sql}-{offset})/{size})*{size}+{offset}"

class AbsoluteExpression(_ChainableExpression):
    op = "Absolute"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "absolute"
        self.type = "NUMBER"

    @classmethod
    def from_js(cls, js: dict) -> AbsoluteExpression:
        return cls(cls._js_to_value(js))

    def get_sql(self, dialect) -> str:
        operand_sql = self.operand.get_sql(dialect) if self.operand else ""
        return f"ABS({operand_sql})"

class PowerExpression(_ChainableUnaryExpression):
    op = "Power"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "power"
        self.type = "NUMBER"

    @classmethod
    def from_js(cls, js: dict) -> PowerExpression:
        return cls(cls._js_to_value(js))

    def get_sql(self, dialect) -> str:
        a = self.operand.get_sql(dialect) if self.operand else ""
        b = self.expression.get_sql(dialect) if self.expression else ""
        return f"POWER({a},{b})"

class LookupExpression(_ChainableExpression):
    op = "Lookup"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "lookup"
        self.lookup_fn: str = params.get("lookupFn", "")
        self.type = "STRING"

    @classmethod
    def from_js(cls, js: dict) -> LookupExpression:
        params = cls._js_to_value(js)
        params["lookupFn"] = js.get("lookupFn", "")
        return cls(params)

    def get_sql(self, dialect) -> str:
        operand_sql = self.operand.get_sql(dialect) if self.operand else ""
        return dialect.lookup_expression(operand_sql, self.lookup_fn)

for _cls in [CastExpression, FallbackExpression, ThenExpression, NumberBucketExpression,
             AbsoluteExpression, PowerExpression, LookupExpression]:
    Expression.register(_cls)
