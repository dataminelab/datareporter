from __future__ import annotations
from .base import Expression
from .aggregate import _ChainableUnaryExpression, _ChainableExpression

class ContainsExpression(_ChainableUnaryExpression):
    op = "Contains"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "contains"
        self.compare: str = params.get("compare", "normal")
        self.type = "BOOLEAN"

    @classmethod
    def from_js(cls, js: dict) -> ContainsExpression:
        params = cls._js_to_value(js)
        params["compare"] = js.get("compare", "normal")
        return cls(params)

    def get_sql(self, dialect) -> str:
        a = self.operand.get_sql(dialect) if self.operand else ""
        b = self.expression.get_sql(dialect) if self.expression else ""
        insensitive = self.compare == "ignoreCase"
        return dialect.contains_expression(a, b, insensitive)

class MatchExpression(_ChainableExpression):
    op = "Match"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "match"
        self.regexp: str = params.get("regexp", "")
        self.type = "BOOLEAN"

    @classmethod
    def from_js(cls, js: dict) -> MatchExpression:
        params = cls._js_to_value(js)
        params["regexp"] = js.get("regexp", "")
        return cls(params)

    def get_sql(self, dialect) -> str:
        operand_sql = self.operand.get_sql(dialect) if self.operand else ""
        return dialect.regexp_expression(operand_sql, self.regexp)

class LengthExpression(_ChainableExpression):
    op = "Length"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "length"
        self.type = "NUMBER"

    @classmethod
    def from_js(cls, js: dict) -> LengthExpression:
        return cls(cls._js_to_value(js))

    def get_sql(self, dialect) -> str:
        operand_sql = self.operand.get_sql(dialect) if self.operand else ""
        return dialect.length_expression(operand_sql)

class IndexOfExpression(_ChainableUnaryExpression):
    op = "IndexOf"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "indexOf"
        self.type = "NUMBER"

    @classmethod
    def from_js(cls, js: dict) -> IndexOfExpression:
        return cls(cls._js_to_value(js))

    def get_sql(self, dialect) -> str:
        s = self.operand.get_sql(dialect) if self.operand else ""
        substr = self.expression.get_sql(dialect) if self.expression else ""
        return dialect.index_of_expression(s, substr)

class SubstrExpression(_ChainableExpression):
    op = "Substr"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "substr"
        self.position: int = params.get("position", 0)
        self.len: int = params.get("len", 0)
        self.type = "STRING"

    @classmethod
    def from_js(cls, js: dict) -> SubstrExpression:
        params = cls._js_to_value(js)
        params["position"] = js.get("position", 0)
        params["len"] = js.get("len", 0)
        return cls(params)

    def get_sql(self, dialect) -> str:
        operand_sql = self.operand.get_sql(dialect) if self.operand else ""
        return dialect.substr_expression(operand_sql, self.position, self.len)

class TransformCaseExpression(_ChainableExpression):
    op = "TransformCase"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "transformCase"
        self.transform_type: str = params.get("transformType", "upperCase")
        self.type = "STRING"

    @classmethod
    def from_js(cls, js: dict) -> TransformCaseExpression:
        params = cls._js_to_value(js)
        params["transformType"] = js.get("transformType", "upperCase")
        return cls(params)

    def get_sql(self, dialect) -> str:
        operand_sql = self.operand.get_sql(dialect) if self.operand else ""
        if self.transform_type == "upperCase":
            return f"UPPER({operand_sql})"
        return f"LOWER({operand_sql})"

class ConcatExpression(_ChainableUnaryExpression):
    op = "Concat"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "concat"
        self.type = "STRING"

    @classmethod
    def from_js(cls, js: dict) -> ConcatExpression:
        return cls(cls._js_to_value(js))

    def get_sql(self, dialect) -> str:
        a = self.operand.get_sql(dialect) if self.operand else ""
        b = self.expression.get_sql(dialect) if self.expression else ""
        return dialect.concat_expression(a, b)

class ExtractExpression(_ChainableExpression):
    op = "Extract"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "extract"
        self.regexp: str = params.get("regexp", "")
        self.type = "STRING"

    @classmethod
    def from_js(cls, js: dict) -> ExtractExpression:
        params = cls._js_to_value(js)
        params["regexp"] = js.get("regexp", "")
        return cls(params)

    def get_sql(self, dialect) -> str:
        operand_sql = self.operand.get_sql(dialect) if self.operand else ""
        return dialect.extract_expression(operand_sql, self.regexp)

for _cls in [ContainsExpression, MatchExpression, LengthExpression, IndexOfExpression,
             SubstrExpression, TransformCaseExpression, ConcatExpression, ExtractExpression]:
    Expression.register(_cls)
