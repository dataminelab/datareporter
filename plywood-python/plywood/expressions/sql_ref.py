from __future__ import annotations
from .base import Expression
from .aggregate import _ChainableExpression

class SqlRefExpression(Expression):
    op = "SqlRef"
    def __init__(self, params: dict):
        super().__init__(params)
        self.sql: str = params.get("sql", "")
        self.op = "sqlRef"

    @classmethod
    def from_js(cls, js: dict) -> SqlRefExpression:
        return cls({"op": "sqlRef", "sql": js.get("sql", ""), "type": js.get("type")})

    def get_sql(self, dialect) -> str:
        return self.sql

    def is_sql_function(self, *names) -> bool:
        upper = self.sql.upper()
        return any(upper.startswith(n + "(") for n in names)

class SqlAggregateExpression(_ChainableExpression):
    op = "SqlAggregate"
    def __init__(self, params: dict):
        super().__init__(params)
        self.sql: str = params.get("sql", "")
        self.op = "sqlAggregate"
        self.type = params.get("type", "NUMBER")

    @classmethod
    def from_js(cls, js: dict) -> SqlAggregateExpression:
        params = _ChainableExpression._js_to_value(js)
        params["sql"] = js.get("sql", "")
        return cls(params)

    def get_sql(self, dialect) -> str:
        operand_sql = self.operand.get_sql(dialect) if self.operand else ""
        return dialect.aggregate_filter_if_needed(operand_sql, self.sql)

class CustomAggregateExpression(_ChainableExpression):
    op = "CustomAggregate"
    def __init__(self, params: dict):
        super().__init__(params)
        self.custom: str = params.get("custom", "")
        self.op = "customAggregate"
        self.type = params.get("type", "NUMBER")

    @classmethod
    def from_js(cls, js: dict) -> CustomAggregateExpression:
        params = _ChainableExpression._js_to_value(js)
        params["custom"] = js.get("custom", "")
        return cls(params)

    def get_sql(self, dialect) -> str:
        return self.custom

class CustomTransformExpression(_ChainableExpression):
    op = "CustomTransform"
    def __init__(self, params: dict):
        super().__init__(params)
        self.custom: str = params.get("custom", "")
        self.op = "customTransform"
        self.type = params.get("type", "STRING")

    @classmethod
    def from_js(cls, js: dict) -> CustomTransformExpression:
        params = _ChainableExpression._js_to_value(js)
        params["custom"] = js.get("custom", "")
        return cls(params)

    def get_sql(self, dialect) -> str:
        return self.custom

for _cls in [SqlRefExpression, SqlAggregateExpression, CustomAggregateExpression, CustomTransformExpression]:
    Expression.register(_cls)
