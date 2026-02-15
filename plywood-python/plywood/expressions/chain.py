from __future__ import annotations
from typing import Dict, List, Optional
from .base import Expression
from .aggregate import _ChainableUnaryExpression, _ChainableExpression

class FilterExpression(_ChainableUnaryExpression):
    op = "Filter"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "filter"
        self.type = "DATASET"

    @classmethod
    def from_js(cls, js: dict) -> FilterExpression:
        return cls(cls._js_to_value(js))

    def get_sql(self, dialect) -> str:
        operand_sql = self.operand.get_sql(dialect) if self.operand else ""
        expr_sql = self.expression.get_sql(dialect) if self.expression else ""
        from .ref import RefExpression
        if isinstance(self.expression, RefExpression):
            expr_sql = f"({expr_sql} = TRUE)"
        return f"{operand_sql} WHERE {expr_sql}"

class SplitExpression(_ChainableExpression):
    op = "Split"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "split"
        self.splits: Dict[str, Expression] = params.get("splits", {})
        self.data_name: str = params.get("dataName", "")
        self.keys = sorted(self.splits.keys())
        self.type = "DATASET"

    @classmethod
    def from_js(cls, js: dict) -> SplitExpression:
        params = cls._js_to_value(js)

        # Handle single split (name + expression) or multi-split (splits dict)
        if "expression" in js and "name" in js:
            expr = Expression.from_js(js["expression"])
            params["splits"] = {js["name"]: expr}
        elif "splits" in js:
            splits = {}
            for name, expr_js in js["splits"].items():
                splits[name] = Expression.from_js(expr_js) if isinstance(expr_js, dict) else expr_js
            params["splits"] = splits

        params["dataName"] = js.get("dataName", "")
        return cls(params)

    def to_js(self) -> dict:
        js = {"op": "split"}
        if self.operand:
            js["operand"] = self.operand.to_js()
        if len(self.splits) == 1:
            name = list(self.splits.keys())[0]
            js["name"] = name
            js["expression"] = self.splits[name].to_js()
        else:
            js["splits"] = {k: v.to_js() for k, v in self.splits.items()}
        js["dataName"] = self.data_name
        return js

    def get_sql(self, dialect) -> str:
        raise ValueError("can not convert split expression to SQL directly")

    def get_select_sql(self, dialect) -> List[str]:
        result = []
        for name in self.keys:
            expr = self.splits[name]
            result.append(f"{expr.get_sql(dialect)} AS {dialect.escape_name(name)}")
        return result

    def get_group_by_sql(self, dialect) -> List[str]:
        return [self.splits[name].get_sql(dialect) for name in self.keys]

    def get_short_group_by_sql(self) -> List[str]:
        return [str(i + 1) for i in range(len(self.keys))]

    def map_splits(self, fn):
        result = []
        for k in self.keys:
            v = fn(k, self.splits[k])
            if v is not None:
                result.append(v)
        return result

class ApplyExpression(_ChainableUnaryExpression):
    op = "Apply"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "apply"
        self.name: str = params.get("name", "")
        self.type = "DATASET"

    @classmethod
    def from_js(cls, js: dict) -> ApplyExpression:
        params = cls._js_to_value(js)
        params["name"] = js.get("name", "")
        return cls(params)

    def to_js(self) -> dict:
        js = {"op": "apply", "name": self.name}
        if self.operand:
            js["operand"] = self.operand.to_js()
        if self.expression:
            js["expression"] = self.expression.to_js()
        return js

    def get_sql(self, dialect) -> str:
        expr_sql = self.expression.get_sql(dialect) if self.expression else ""
        return f"{expr_sql} AS {dialect.escape_name(self.name)}"

class SortExpression(_ChainableUnaryExpression):
    op = "Sort"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "sort"
        self.direction: str = params.get("direction", "ascending")
        self.type = "DATASET"

    @classmethod
    def from_js(cls, js: dict) -> SortExpression:
        params = cls._js_to_value(js)
        params["direction"] = js.get("direction", "ascending")
        return cls(params)

    def to_js(self) -> dict:
        js = {"op": "sort", "direction": self.direction}
        if self.operand:
            js["operand"] = self.operand.to_js()
        if self.expression:
            js["expression"] = self.expression.to_js()
        return js

    def get_sql(self, dialect) -> str:
        expr_sql = self.expression.get_sql(dialect) if self.expression else ""
        direction = "DESC" if self.direction == "descending" else "ASC"
        return f"ORDER BY {expr_sql} {direction}"

class LimitExpression(_ChainableExpression):
    op = "Limit"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "limit"
        self.value: int = params.get("value", float("inf"))
        self.type = "DATASET"

    @classmethod
    def from_js(cls, js: dict) -> LimitExpression:
        params = cls._js_to_value(js)
        params["value"] = js.get("value") or js.get("limit", float("inf"))
        return cls(params)

    def to_js(self) -> dict:
        js = {"op": "limit", "value": self.value}
        if self.operand:
            js["operand"] = self.operand.to_js()
        return js

    def get_sql(self, dialect) -> str:
        return f"LIMIT {self.value}"

class SelectExpression(_ChainableExpression):
    op = "Select"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "select"
        self.attributes: List[str] = params.get("attributes", [])
        self.type = "DATASET"

    @classmethod
    def from_js(cls, js: dict) -> SelectExpression:
        params = cls._js_to_value(js)
        params["attributes"] = js.get("attributes", [])
        return cls(params)

    def get_sql(self, dialect) -> str:
        raise ValueError("can not be expressed as SQL directly")

for _cls in [FilterExpression, SplitExpression, ApplyExpression, SortExpression, LimitExpression, SelectExpression]:
    Expression.register(_cls)
