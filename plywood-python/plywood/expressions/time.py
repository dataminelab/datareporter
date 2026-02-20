from __future__ import annotations
from .base import Expression
from .aggregate import _ChainableExpression, _ChainableUnaryExpression

class TimeBucketExpression(_ChainableExpression):
    op = "TimeBucket"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "timeBucket"
        self.duration: str = params.get("duration", "")
        self.timezone: str = params.get("timezone", "Etc/UTC")
        self.bounds: str = params.get("bounds", "")
        self.type = "TIME_RANGE"

    @classmethod
    def from_js(cls, js: dict) -> TimeBucketExpression:
        params = cls._js_to_value(js)
        params["duration"] = js.get("duration", "")
        params["timezone"] = js.get("timezone", "Etc/UTC")
        params["bounds"] = js.get("bounds", "")
        return cls(params)

    def get_sql(self, dialect) -> str:
        operand_sql = self.operand.get_sql(dialect) if self.operand else ""
        return dialect.time_bucket_expression(operand_sql, self.duration, self.timezone)

class TimeFloorExpression(_ChainableExpression):
    op = "TimeFloor"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "timeFloor"
        self.duration: str = params.get("duration", "")
        self.timezone: str = params.get("timezone", "Etc/UTC")
        self.type = "TIME"

    @classmethod
    def from_js(cls, js: dict) -> TimeFloorExpression:
        params = cls._js_to_value(js)
        params["duration"] = js.get("duration", "")
        params["timezone"] = js.get("timezone", "Etc/UTC")
        return cls(params)

    def get_sql(self, dialect) -> str:
        operand_sql = self.operand.get_sql(dialect) if self.operand else ""
        return dialect.time_floor_expression(operand_sql, self.duration, self.timezone)

class TimePartExpression(_ChainableExpression):
    op = "TimePart"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "timePart"
        self.part: str = params.get("part", "")
        self.timezone: str = params.get("timezone", "Etc/UTC")
        self.type = "NUMBER"

    @classmethod
    def from_js(cls, js: dict) -> TimePartExpression:
        params = cls._js_to_value(js)
        params["part"] = js.get("part", "")
        params["timezone"] = js.get("timezone", "Etc/UTC")
        return cls(params)

    def get_sql(self, dialect) -> str:
        operand_sql = self.operand.get_sql(dialect) if self.operand else ""
        return dialect.time_part_expression(operand_sql, self.part, self.timezone)

class TimeRangeExpression(_ChainableExpression):
    op = "TimeRange"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "timeRange"
        self.duration: str = params.get("duration", "")
        self.step: int = params.get("step", 1)
        self.timezone: str = params.get("timezone", "Etc/UTC")
        self.type = "TIME_RANGE"

    @classmethod
    def from_js(cls, js: dict) -> TimeRangeExpression:
        params = cls._js_to_value(js)
        params["duration"] = js.get("duration", "")
        params["step"] = js.get("step", 1)
        params["timezone"] = js.get("timezone", "Etc/UTC")
        return cls(params)

    def get_sql(self, dialect) -> str:
        operand_sql = self.operand.get_sql(dialect) if self.operand else ""
        return dialect.time_bucket_expression(operand_sql, self.duration, self.timezone)

class TimeShiftExpression(_ChainableExpression):
    op = "TimeShift"
    def __init__(self, params: dict):
        super().__init__(params)
        self.op = "timeShift"
        self.duration: str = params.get("duration", "")
        self.step: int = params.get("step", 1)
        self.timezone: str = params.get("timezone", "Etc/UTC")
        self.type = "TIME"

    @classmethod
    def from_js(cls, js: dict) -> TimeShiftExpression:
        params = cls._js_to_value(js)
        params["duration"] = js.get("duration", "")
        params["step"] = js.get("step", 1)
        params["timezone"] = js.get("timezone", "Etc/UTC")
        return cls(params)

    def get_sql(self, dialect) -> str:
        operand_sql = self.operand.get_sql(dialect) if self.operand else ""
        return dialect.time_shift_expression(operand_sql, self.duration, self.step, self.timezone)

for _cls in [TimeBucketExpression, TimeFloorExpression, TimePartExpression, TimeRangeExpression, TimeShiftExpression]:
    Expression.register(_cls)
