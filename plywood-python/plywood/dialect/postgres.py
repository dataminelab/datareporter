from __future__ import annotations
from datetime import datetime
from typing import Optional
from .base import SQLDialect

# Duration string -> DATE_TRUNC unit
_TIME_BUCKETING = {
    "PT1S": "second", "PT1M": "minute", "PT1H": "hour",
    "P1D": "day", "P1W": "week", "P1M": "month", "P3M": "quarter", "P1Y": "year",
}

_TIME_PART_TO_FUNCTION = {
    "SECOND_OF_MINUTE": "DATE_PART('second',$$)",
    "SECOND_OF_HOUR": "(DATE_PART('minute',$$)*60+DATE_PART('second',$$))",
    "SECOND_OF_DAY": "((DATE_PART('hour',$$)*60+DATE_PART('minute',$$))*60+DATE_PART('second',$$))",
    "MINUTE_OF_HOUR": "DATE_PART('minute',$$)",
    "MINUTE_OF_DAY": "DATE_PART('hour',$$)*60+DATE_PART('minute',$$)",
    "HOUR_OF_DAY": "DATE_PART('hour',$$)",
    "HOUR_OF_WEEK": "((CAST((DATE_PART('dow',$$)+6) AS int)%7)*24+DATE_PART('hour',$$))",
    "HOUR_OF_MONTH": "((DATE_PART('day',$$)-1)*24+DATE_PART('hour',$$))",
    "HOUR_OF_YEAR": "((DATE_PART('doy',$$)-1)*24+DATE_PART('hour',$$))",
    "DAY_OF_WEEK": "(CAST((DATE_PART('dow',$$)+6) AS int)%7)+1",
    "DAY_OF_MONTH": "DATE_PART('day',$$)",
    "DAY_OF_YEAR": "DATE_PART('doy',$$)",
    "WEEK_OF_YEAR": "DATE_PART('week',$$)",
    "MONTH_OF_YEAR": "DATE_PART('month',$$)",
    "YEAR": "DATE_PART('year',$$)",
}

_CAST_TO_FUNCTION = {
    "TIME": {"NUMBER": "TO_TIMESTAMP($$::double precision / 1000)"},
    "NUMBER": {"TIME": "EXTRACT(EPOCH FROM $$) * 1000", "STRING": "$$::float"},
    "STRING": {"NUMBER": "$$::text"},
}


class PostgresDialect(SQLDialect):
    def empty_group_by(self) -> str:
        return ""

    def time_to_sql(self, date: datetime) -> str:
        if not date:
            return self.null_constant()
        return f"TIMESTAMP '{self.date_to_sql_date_string(date)}'"

    def concat_expression(self, a: str, b: str) -> str:
        return f"({a}||{b})"

    def contains_expression(self, a: str, b: str, insensitive: bool = False) -> str:
        if insensitive:
            a = f"LOWER({a})"
            b = f"LOWER({b})"
        return f"POSITION({b} IN {a})>0"

    def regexp_expression(self, expression: str, regexp: str) -> str:
        return f"({expression} ~ '{regexp}')"

    def cast_expression(self, input_type: str, operand: str, target_type: str) -> str:
        if input_type == target_type:
            return operand
        fn = _CAST_TO_FUNCTION.get(target_type, {}).get(input_type)
        if not fn:
            return f"CAST({operand} AS {target_type})"
        return fn.replace("$$", operand)

    def _utc_to_walltime(self, operand: str, timezone: str) -> str:
        if timezone == "Etc/UTC" or timezone == "UTC":
            return operand
        return f"({operand} AT TIME ZONE 'UTC' AT TIME ZONE '{timezone}')"

    def _walltime_to_utc(self, operand: str, timezone: str) -> str:
        if timezone == "Etc/UTC" or timezone == "UTC":
            return operand
        return f"({operand} AT TIME ZONE '{timezone}' AT TIME ZONE 'UTC')"

    def time_floor_expression(self, operand: str, duration: str, timezone: str) -> str:
        bucket = _TIME_BUCKETING.get(duration)
        if not bucket:
            raise ValueError(f"unsupported duration '{duration}'")
        return self._walltime_to_utc(
            f"DATE_TRUNC('{bucket}',{self._utc_to_walltime(operand, timezone)})",
            timezone,
        )

    def time_bucket_expression(self, operand: str, duration: str, timezone: str) -> str:
        return self.time_floor_expression(operand, duration, timezone)

    def time_part_expression(self, operand: str, part: str, timezone: str) -> str:
        fn = _TIME_PART_TO_FUNCTION.get(part)
        if not fn:
            raise ValueError(f"unsupported part {part} in Postgres dialect")
        return fn.replace("$$", self._utc_to_walltime(operand, timezone))

    def time_shift_expression(self, operand: str, duration: str, step: int, timezone: str) -> str:
        if step == 0:
            return operand
        spans = _parse_duration_spans(duration, abs(step))
        sql_fn = "DATE_ADD(" if step > 0 else "DATE_SUB("
        if spans.get("week"):
            return f"{sql_fn}{operand}, INTERVAL {spans['week']} WEEK)"
        if spans.get("year") or spans.get("month"):
            expr = f"{spans.get('year', 0)}-{spans.get('month', 0)}"
            operand = f"{sql_fn}{operand}, INTERVAL '{expr}' YEAR_MONTH)"
        if spans.get("day") or spans.get("hour") or spans.get("minute") or spans.get("second"):
            expr = f"{spans.get('day', 0)} {spans.get('hour', 0)}:{spans.get('minute', 0)}:{spans.get('second', 0)}"
            operand = f"{sql_fn}{operand}, INTERVAL '{expr}' DAY_SECOND)"
        return operand

    def extract_expression(self, operand: str, regexp: str) -> str:
        return f"(SELECT (REGEXP_MATCHES({operand}, '{regexp}'))[1])"

    def index_of_expression(self, s: str, substr: str) -> str:
        return f"POSITION({substr} IN {s}) - 1"


def _parse_duration_spans(duration: str, multiplier: int = 1) -> dict:
    """Parse ISO 8601 duration into spans dict."""
    spans = {}
    if duration.startswith("P"):
        d = duration[1:]
        t_part = ""
        if "T" in d:
            parts = d.split("T")
            d = parts[0]
            t_part = parts[1]

        # Date part
        for unit, key in [("Y", "year"), ("M", "month"), ("W", "week"), ("D", "day")]:
            if unit in d:
                idx = d.index(unit)
                val = int(d[:idx]) * multiplier
                spans[key] = val
                d = d[idx + 1:]

        # Time part
        for unit, key in [("H", "hour"), ("M", "minute"), ("S", "second")]:
            if unit in t_part:
                idx = t_part.index(unit)
                val = int(t_part[:idx]) * multiplier
                spans[key] = val
                t_part = t_part[idx + 1:]
    return spans
