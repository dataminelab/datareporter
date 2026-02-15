from __future__ import annotations
from datetime import datetime
from typing import Optional, List
from .base import SQLDialect

_TIME_PART_TO_FUNCTION = {
    "SECOND_OF_MINUTE": "TIME_EXTRACT($$,'SECOND',##)",
    "SECOND_OF_HOUR": "(TIME_EXTRACT($$,'MINUTE',##)*60+TIME_EXTRACT($$,'SECOND',##))",
    "SECOND_OF_DAY": "((TIME_EXTRACT($$,'HOUR',##)*60+TIME_EXTRACT($$,'MINUTE',##))*60+TIME_EXTRACT($$,'SECOND',##))",
    "MINUTE_OF_HOUR": "TIME_EXTRACT($$,'MINUTE',##)",
    "MINUTE_OF_DAY": "TIME_EXTRACT($$,'HOUR',##)*60+TIME_EXTRACT($$,'MINUTE',##)",
    "HOUR_OF_DAY": "TIME_EXTRACT($$,'HOUR',##)",
    "HOUR_OF_WEEK": "(MOD(CAST((TIME_EXTRACT($$,'DOW',##)+6) AS int),7)*24+TIME_EXTRACT($$,'HOUR',##))",
    "HOUR_OF_MONTH": "((TIME_EXTRACT($$,'DAY',##)-1)*24+TIME_EXTRACT($$,'HOUR',##))",
    "HOUR_OF_YEAR": "((TIME_EXTRACT($$,'DOY',##)-1)*24+TIME_EXTRACT($$,'HOUR',##))",
    "DAY_OF_WEEK": "MOD(CAST((TIME_EXTRACT($$,'DOW',##)+6) AS int),7)+1",
    "DAY_OF_MONTH": "TIME_EXTRACT($$,'DAY',##)",
    "DAY_OF_YEAR": "TIME_EXTRACT($$,'DOY',##)",
    "WEEK_OF_YEAR": "TIME_EXTRACT($$,'WEEK',##)",
    "MONTH_OF_YEAR": "TIME_EXTRACT($$,'MONTH',##)",
    "YEAR": "TIME_EXTRACT($$,'YEAR',##)",
}

_CAST_TO_FUNCTION = {
    "TIME": {"NUMBER": "MILLIS_TO_TIMESTAMP(CAST($$ AS BIGINT))", "_": "CAST($$ AS TIMESTAMP)"},
    "NUMBER": {"TIME": "CAST($$ AS BIGINT)", "STRING": "CAST($$ AS DOUBLE)", "_": "CAST($$ AS DOUBLE)"},
    "STRING": {"NUMBER": "CAST($$ AS VARCHAR)", "_": "CAST($$ AS VARCHAR)"},
    "BOOLEAN": {"NUMBER": "($$ = 1)", "STRING": "($$ = 'true')", "_": "(CAST($$ AS VARCHAR) IN ('1','true'))"},
}


class DruidDialect(SQLDialect):
    def __init__(self, attributes: list = None):
        super().__init__()
        self.attributes = attributes or []

    def date_to_sql_date_string(self, date: datetime) -> str:
        s = date.strftime("%Y-%m-%d %H:%M:%S")
        ms = date.strftime("%f")[:3]
        if ms != "000":
            s += f".{ms}"
        return s

    def float_division(self, numerator: str, denominator: str) -> str:
        return f"({numerator}*1.0/{denominator})"

    def empty_group_by(self) -> str:
        return "GROUP BY ()"

    def time_to_sql(self, date: datetime) -> str:
        if not date:
            return self.null_constant()
        return f"TIMESTAMP '{self.date_to_sql_date_string(date)}'"

    def string_array_to_sql(self, value: List[str]) -> str:
        arr = [self.escape_literal(v) for v in value]
        return f"ARRAY[{','.join(arr)}]"

    def concat_expression(self, a: str, b: str) -> str:
        return f"({a}||{b})"

    def contains_expression(self, a: str, b: str, insensitive: bool = False) -> str:
        fn = "ICONTAINS_STRING" if insensitive else "CONTAINS_STRING"
        return f"{fn}(CAST({a} AS VARCHAR),{b})"

    def count_distinct_expression(self, a: str, parameter_attribute_name: Optional[str] = None) -> str:
        if parameter_attribute_name and self.attributes:
            attr = next((at for at in self.attributes if getattr(at, 'name', None) == parameter_attribute_name), None)
            if attr:
                nt = getattr(attr, 'native_type', None) or getattr(attr, 'nativeType', None)
                if nt == "HLLSketch":
                    return f"APPROX_COUNT_DISTINCT_DS_HLL({a})"
                if nt == "thetaSketch":
                    return f"APPROX_COUNT_DISTINCT_DS_THETA({a})"
                if nt == "hyperUnique":
                    return f"APPROX_COUNT_DISTINCT({a})"
        return f"COUNT(DISTINCT {a})"

    def is_not_distinct_from_expression(self, a: str, b: str) -> str:
        null_const = self.null_constant()
        if a == null_const:
            return f"{b} IS {null_const}"
        if b == null_const:
            return f"{a} IS {null_const}"
        return f"({a}={b})"

    def cast_expression(self, input_type: str, operand: str, target_type: str) -> str:
        if target_type == "SET/STRING":
            target_type = "STRING"
        if input_type == target_type:
            return operand
        cast_for_input = _CAST_TO_FUNCTION.get(target_type, {})
        fn = cast_for_input.get(input_type or "_") or cast_for_input.get("_")
        if not fn:
            raise ValueError(f"unsupported cast from {input_type or 'unknown'} to {target_type} in Druid dialect")
        return fn.replace("$$", operand)

    def _operand_as_timestamp(self, operand: str) -> str:
        if "__time" in operand:
            return operand
        return f"CAST({operand} AS TIMESTAMP)"

    def time_floor_expression(self, operand: str, duration: str, timezone: str) -> str:
        return f"TIME_FLOOR({self._operand_as_timestamp(operand)}, {self.escape_literal(duration)}, NULL, {self.escape_literal(timezone)})"

    def time_bucket_expression(self, operand: str, duration: str, timezone: str) -> str:
        return self.time_floor_expression(operand, duration, timezone)

    def time_part_expression(self, operand: str, part: str, timezone: str) -> str:
        fn = _TIME_PART_TO_FUNCTION.get(part)
        if not fn:
            raise ValueError(f"unsupported part {part} in Druid dialect")
        return fn.replace("$$", self._operand_as_timestamp(operand)).replace("##", self.escape_literal(timezone))

    def time_shift_expression(self, operand: str, duration: str, step: int, timezone: str) -> str:
        return f"TIME_SHIFT({self._operand_as_timestamp(operand)}, {self.escape_literal(duration)}, {step}, {self.escape_literal(timezone)})"

    def extract_expression(self, operand: str, regexp: str) -> str:
        return f"REGEXP_EXTRACT(CAST({operand} AS VARCHAR), {self.escape_literal(regexp)}, 1)"

    def regexp_expression(self, expression: str, regexp: str) -> str:
        return f"REGEXP_LIKE(CAST({expression} AS VARCHAR), {self.escape_literal(regexp)})"

    def index_of_expression(self, s: str, substr: str) -> str:
        return f"POSITION({substr} IN {s}) - 1"

    def quantile_expression(self, s: str, quantile: float, parameter_attribute_name: Optional[str] = None) -> str:
        if parameter_attribute_name and self.attributes:
            attr = next((at for at in self.attributes if getattr(at, 'name', None) == parameter_attribute_name), None)
            if attr:
                nt = getattr(attr, 'native_type', None) or getattr(attr, 'nativeType', None)
                if nt == "approximateHistogram":
                    return f"APPROX_QUANTILE({s}, {quantile})"
        return f"APPROX_QUANTILE_DS({s}, {quantile})"

    def log_expression(self, base: str, operand: str) -> str:
        import math
        if base == str(math.e):
            return f"LN({operand})"
        if base == "10":
            return f"LOG10({operand})"
        return f"LN({operand})/LN({base})"

    def lookup_expression(self, base: str, lookup: str) -> str:
        return f"LOOKUP({base}, {self.escape_literal(lookup)})"

    def substr_expression(self, a: str, position: int, length: int) -> str:
        return f"SUBSTRING({a},{position + 1},{length})"
