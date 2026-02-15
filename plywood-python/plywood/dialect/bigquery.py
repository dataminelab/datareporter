from __future__ import annotations
from datetime import datetime
from typing import Optional
from .base import SQLDialect
from .postgres import _parse_duration_spans

_TIME_BUCKETING = {
    "PT1S": "%Y-%m-%d %H:%M:%SZ", "PT1M": "%Y-%m-%d %H:%M:00Z",
    "PT1H": "%Y-%m-%d %H:00:00Z", "P1D": "%Y-%m-%d 00:00:00Z",
    "P1M": "%Y-%m-01 00:00:00Z", "P1Y": "%Y-01-01 00:00:00Z",
    "P1W": "%Y-%m-%d 00:00:00Z", "P3M": "%Y-%m-%d 00:00:00Z",
}

_TIME_PART_TO_FUNCTION = {
    "SECOND_OF_MINUTE": "extract(SECOND from $$)",
    "SECOND_OF_HOUR": "(extract(MINUTE from $$)*60+extract(SECOND from $$))",
    "SECOND_OF_DAY": "((extract(HOUR from $$)*60+extract(MINUTE from $$))*60+extract(SECOND from $$))",
    "MINUTE_OF_HOUR": "extract(MINUTE from $$)",
    "MINUTE_OF_DAY": "extract(HOUR from $$)*60+extract(MINUTE from $$)",
    "HOUR_OF_DAY": "extract(HOUR from $$)",
    "HOUR_OF_WEEK": "(mod((extract(DAYOFWEEK from $$) + 6), 7) * 24 + extract(HOUR from $$))",
    "HOUR_OF_MONTH": "((extract(DAY from $$)-1)*24+extract(HOUR from $$))",
    "HOUR_OF_YEAR": "((extract(DAYOFYEAR from $$)-1)*24+extract(HOUR from $$))",
    "DAY_OF_WEEK": "extract(DAYOFWEEK from $$)",
    "DAY_OF_MONTH": "extract(DAY from $$)",
    "DAY_OF_YEAR": "extract(DAYOFYEAR from $$)",
    "WEEK_OF_YEAR": "EXTRACT(week from $$)",
    "MONTH_OF_YEAR": "EXTRACT(month from $$)",
    "YEAR": "EXTRACT(year from $$)",
}

_CAST_TO_FUNCTION = {
    "TIME": {"NUMBER": "TIMESTAMP_MILLIS($$)"},
    "NUMBER": {"TIME": "UNIX_MILLIS($$)", "STRING": "cast($$ as NUMERIC)"},
    "STRING": {"NUMBER": "cast($$ as string)"},
}


class BigQueryDialect(SQLDialect):
    def escape_name(self, name: str) -> str:
        name = name.replace("`", "``")
        return f"`{name}`"

    def empty_group_by(self) -> str:
        return ""

    def time_to_sql(self, date: datetime) -> str:
        if not date:
            return self.null_constant()
        return f"TIMESTAMP('{date.isoformat()}')"

    def cast_expression(self, input_type: str, operand: str, target_type: str) -> str:
        if input_type == target_type:
            return operand
        fn = _CAST_TO_FUNCTION.get(target_type, {}).get(input_type)
        if not fn:
            return f"CAST({operand} AS {target_type})"
        return fn.replace("$$", operand)

    def extract_expression(self, operand: str, regexp: str) -> str:
        return f"REGEXP_EXTRACT({operand}, '{regexp}'))"

    def index_of_expression(self, s: str, substr: str) -> str:
        return f"STRPOS({substr}, {s}) - 1"

    def time_floor_expression(self, operand: str, duration: str, timezone: str) -> str:
        fmt = _TIME_BUCKETING.get(duration)
        if not fmt:
            raise ValueError(f"unsupported duration '{duration}'")
        if duration == "P1W":
            return f"FORMAT_DATETIME('{fmt}', DATETIME_TRUNC( CAST({operand} AS DATETIME), WEEK))"
        elif duration == "P1Y":
            return f"FORMAT_DATETIME('{fmt}', DATETIME_TRUNC( CAST({operand} AS DATETIME), YEAR))"
        elif duration == "P3M":
            return f"FORMAT_DATETIME('{fmt}', DATETIME_TRUNC( CAST({operand} AS DATETIME), QUARTER))"
        return f"FORMAT_DATETIME('{fmt}', CAST({operand} AS DATETIME))"

    def time_bucket_expression(self, operand: str, duration: str, timezone: str) -> str:
        return self.time_floor_expression(operand, duration, timezone)

    def time_part_expression(self, operand: str, part: str, timezone: str) -> str:
        fn = _TIME_PART_TO_FUNCTION.get(part)
        if not fn:
            raise ValueError(f"unsupported part {part} in BigQuery dialect")
        return fn.replace("$$", operand)

    def time_shift_expression(self, operand: str, duration: str, step: int, timezone: str) -> str:
        if step == 0:
            return operand
        spans = _parse_duration_spans(duration, abs(step))
        sql_fn = "TIMESTAMP(DATE_ADD(DATE(" if step > 0 else "TIMESTAMP(DATE_SUB(DATE("
        for key, unit in [("week", "WEEK"), ("month", "MONTH"), ("year", "YEAR"), ("day", "DAY"), ("hour", "HOUR"), ("minute", "MINUTE"), ("second", "SECOND")]:
            if spans.get(key):
                operand = f"{sql_fn}{operand}), INTERVAL {spans[key]} {unit}))"
        return operand

    def regexp_expression(self, expression: str, regexp: str) -> str:
        return f"REGEXP_CONTAINS({expression}, {self.escape_literal(regexp)})"

    def contains_expression(self, a: str, b: str, insensitive: bool = False) -> str:
        return f"STRPOS({a},{b})>0"

    def concat_expression(self, a: str, b: str) -> str:
        return f"CONCAT({a},{b})"

    def is_not_distinct_from_expression(self, a: str, b: str) -> str:
        null_const = self.null_constant()
        if a == null_const:
            return f"{b} IS {null_const}"
        if b == null_const:
            return f"{a} IS {null_const}"
        return f"({a}={b})"
