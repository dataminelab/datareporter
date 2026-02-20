from __future__ import annotations
from datetime import datetime
from typing import Optional
from .base import SQLDialect
from .postgres import _parse_duration_spans

_TIME_BUCKETING = {
    "PT1S": "%Y-%m-%d %H:%i:%SZ", "PT1M": "%Y-%m-%d %H:%i:00Z",
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
    "HOUR_OF_WEEK": "(mod((extract(DAY_OF_WEEK from $$) + 6), 7) * 24 + extract(HOUR from $$))",
    "HOUR_OF_MONTH": "((extract(DAY from $$)-1)*24+extract(HOUR from $$))",
    "HOUR_OF_YEAR": "((extract(DAY_OF_YEAR from $$)-1)*24+extract(HOUR from $$))",
    "DAY_OF_WEEK": "extract(DAY_OF_WEEK from $$)",
    "DAY_OF_MONTH": "extract(DAY from $$)",
    "DAY_OF_YEAR": "extract(DAY_OF_YEAR from $$)",
    "WEEK_OF_YEAR": "EXTRACT(week from $$)",
    "MONTH_OF_YEAR": "EXTRACT(month from $$)",
    "YEAR": "EXTRACT(year from $$)",
}

_CAST_TO_FUNCTION = {
    "TIME": {"NUMBER": "FROM_UNIXTIME($$)"},
    "NUMBER": {"TIME": "cast(to_unixtime($$)*1000 as BIGINT)", "STRING": "cast($$ as BIGINT)"},
    "STRING": {"NUMBER": "cast($$ as varchar)"},
}


class AthenaDialect(SQLDialect):
    def empty_group_by(self) -> str:
        return ""

    def time_to_sql(self, date: datetime) -> str:
        if not date:
            return self.null_constant()
        return f"from_iso8601_timestamp('{date.isoformat()}')"

    def cast_expression(self, input_type: str, operand: str, target_type: str) -> str:
        if input_type == target_type:
            return operand
        fn = _CAST_TO_FUNCTION.get(target_type, {}).get(input_type)
        if not fn:
            return f"CAST({operand} AS {target_type})"
        return fn.replace("$$", operand)

    def extract_expression(self, operand: str, regexp: str) -> str:
        return f"regexp_extract({operand}, '{regexp}'))"

    def index_of_expression(self, s: str, substr: str) -> str:
        return f"STRPOS({s}, {substr}) - 1"

    def time_floor_expression(self, operand: str, duration: str, timezone: str) -> str:
        fmt = _TIME_BUCKETING.get(duration)
        if not fmt:
            raise ValueError(f"unsupported duration '{duration}'")
        if duration == "P1W":
            return f"DATE_FORMAT( DATE_TRUNC('week', {operand}), '{fmt}')"
        elif duration == "P3M":
            return f"DATE_FORMAT( DATE_TRUNC('quarter', {operand}), '{fmt}')"
        return f"DATE_FORMAT({operand}, '{fmt}')"

    def time_bucket_expression(self, operand: str, duration: str, timezone: str) -> str:
        return self.time_floor_expression(operand, duration, timezone)

    def time_part_expression(self, operand: str, part: str, timezone: str) -> str:
        fn = _TIME_PART_TO_FUNCTION.get(part)
        if not fn:
            raise ValueError(f"unsupported part {part} in Athena dialect")
        return fn.replace("$$", operand)

    def time_shift_expression(self, operand: str, duration: str, step: int, timezone: str) -> str:
        if step == 0:
            return operand
        spans = _parse_duration_spans(duration, abs(step))
        mult = "-1 * " if step < 0 else ""
        for key, unit in [("week", "week"), ("month", "MONTH"), ("year", "YEAR"), ("day", "DAY"), ("hour", "hour"), ("minute", "MINUTE"), ("second", "second")]:
            if spans.get(key):
                operand = f"DATE_ADD('{unit}', {mult}{spans[key]}, {operand})"
        return operand

    def regexp_expression(self, expression: str, regexp: str) -> str:
        return f"regexp_like({expression}, {self.escape_literal(regexp)})"

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
