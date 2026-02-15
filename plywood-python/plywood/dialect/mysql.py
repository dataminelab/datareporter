from __future__ import annotations
from datetime import datetime
from typing import Optional
from .base import SQLDialect
from .postgres import _parse_duration_spans

_TIME_BUCKETING = {
    "PT1S": "%Y-%m-%d %H:%i:%SZ", "PT1M": "%Y-%m-%d %H:%i:00Z",
    "PT1H": "%Y-%m-%d %H:00:00Z", "P1D": "%Y-%m-%d 00:00:00Z",
    "P1M": "%Y-%m-01 00:00:00Z", "P1Y": "%Y-01-01 00:00:00Z",
}

_TIME_PART_TO_FUNCTION = {
    "SECOND_OF_MINUTE": "SECOND($$)", "SECOND_OF_HOUR": "(MINUTE($$)*60+SECOND($$))",
    "SECOND_OF_DAY": "((HOUR($$)*60+MINUTE($$))*60+SECOND($$))",
    "MINUTE_OF_HOUR": "MINUTE($$)", "MINUTE_OF_DAY": "HOUR($$)*60+MINUTE($$)",
    "HOUR_OF_DAY": "HOUR($$)", "HOUR_OF_WEEK": "(WEEKDAY($$)*24+HOUR($$))",
    "HOUR_OF_MONTH": "((DAYOFMONTH($$)-1)*24+HOUR($$))", "HOUR_OF_YEAR": "((DAYOFYEAR($$)-1)*24+HOUR($$))",
    "DAY_OF_WEEK": "(WEEKDAY($$)+1)", "DAY_OF_MONTH": "DAYOFMONTH($$)",
    "DAY_OF_YEAR": "DAYOFYEAR($$)", "WEEK_OF_YEAR": "WEEK($$)",
    "MONTH_OF_YEAR": "MONTH($$)", "YEAR": "YEAR($$)",
}

_CAST_TO_FUNCTION = {
    "TIME": {"NUMBER": "FROM_UNIXTIME($$ / 1000)"},
    "NUMBER": {"TIME": "UNIX_TIMESTAMP($$) * 1000", "STRING": "CAST($$ AS SIGNED)"},
    "STRING": {"NUMBER": "CAST($$ AS CHAR)"},
}


class MySQLDialect(SQLDialect):
    def escape_name(self, name: str) -> str:
        name = name.replace("`", "``")
        return f"`{name}`"

    def escape_literal(self, name: Optional[str]) -> str:
        if name is None:
            return self.null_constant()
        import json
        return json.dumps(name)

    def time_to_sql(self, date: datetime) -> str:
        if not date:
            return self.null_constant()
        return f"TIMESTAMP('{self.date_to_sql_date_string(date)}')"

    def concat_expression(self, a: str, b: str) -> str:
        return f"CONCAT({a},{b})"

    def contains_expression(self, a: str, b: str, insensitive: bool = False) -> str:
        if insensitive:
            a, b = f"LOWER({a})", f"LOWER({b})"
        return f"LOCATE({b},{a})>0"

    def is_not_distinct_from_expression(self, a: str, b: str) -> str:
        return f"({a}<=>{b})"

    def cast_expression(self, input_type: str, operand: str, target_type: str) -> str:
        if input_type == target_type:
            return operand
        fn = _CAST_TO_FUNCTION.get(target_type, {}).get(input_type)
        if not fn:
            return f"CAST({operand} AS {target_type})"
        return fn.replace("$$", operand)

    def _utc_to_walltime(self, operand: str, timezone: str) -> str:
        if timezone in ("Etc/UTC", "UTC"):
            return operand
        return f"CONVERT_TZ({operand},'+0:00','{timezone}')"

    def _walltime_to_utc(self, operand: str, timezone: str) -> str:
        if timezone in ("Etc/UTC", "UTC"):
            return operand
        return f"CONVERT_TZ({operand},'{timezone}','+0:00')"

    def time_floor_expression(self, operand: str, duration: str, timezone: str) -> str:
        fmt = _TIME_BUCKETING.get(duration)
        if not fmt:
            raise ValueError(f"unsupported duration '{duration}'")
        return self._walltime_to_utc(
            f"DATE_FORMAT({self._utc_to_walltime(operand, timezone)},'{fmt}')",
            timezone,
        )

    def time_bucket_expression(self, operand: str, duration: str, timezone: str) -> str:
        return self.time_floor_expression(operand, duration, timezone)

    def time_part_expression(self, operand: str, part: str, timezone: str) -> str:
        fn = _TIME_PART_TO_FUNCTION.get(part)
        if not fn:
            raise ValueError(f"unsupported part {part} in MySQL dialect")
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
        raise NotImplementedError("MySQL must implement extractExpression")

    def index_of_expression(self, s: str, substr: str) -> str:
        return f"LOCATE({substr}, {s}) - 1"
