from __future__ import annotations
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Optional


class SQLDialect(ABC):
    def __init__(self):
        self._escaped_table_name: Optional[str] = None

    def set_table(self, name: Optional[str]) -> None:
        if name:
            self._escaped_table_name = name if len(name) == 1 else self.escape_name(name)
        else:
            self._escaped_table_name = None

    def null_constant(self) -> str:
        return "NULL"

    def empty_group_by(self) -> str:
        return "GROUP BY ''"

    def escape_name(self, name: str) -> str:
        name = name.replace('"', '""')
        return f'"{name}"'

    def maybe_namespaced_name(self, name: str) -> str:
        escaped = self.escape_name(name)
        if self._escaped_table_name:
            return f"{self._escaped_table_name}.{escaped}"
        return escaped

    def escape_literal(self, name: Optional[str]) -> str:
        if name is None:
            return self.null_constant()
        name = name.replace("'", "''")
        return f"'{name}'"

    def boolean_to_sql(self, b: bool) -> str:
        return str(b).upper()

    def float_division(self, numerator: str, denominator: str) -> str:
        return f"({numerator}/{denominator})"

    def number_or_time_to_sql(self, x) -> str:
        if x is None:
            return self.null_constant()
        if isinstance(x, datetime):
            return self.time_to_sql(x)
        return self.number_to_sql(x)

    def number_to_sql(self, num) -> str:
        if num is None:
            return self.null_constant()
        return str(num)

    def date_to_sql_date_string(self, date: datetime) -> str:
        s = date.strftime("%Y-%m-%d %H:%M:%S")
        if s.endswith(" 00:00:00"):
            return s[:10]
        return s

    @abstractmethod
    def time_to_sql(self, date: datetime) -> str:
        ...

    def aggregate_filter_if_needed(self, input_sql: str, expression_sql: str, else_sql: Optional[str] = None) -> str:
        where_idx = input_sql.find(" WHERE ")
        if where_idx == -1:
            return expression_sql
        filter_sql = input_sql[where_idx + 7:]
        return self.if_then_else_expression(filter_sql, expression_sql, else_sql)

    def concat_expression(self, a: str, b: str) -> str:
        raise NotImplementedError("must implement concat_expression")

    def contains_expression(self, a: str, b: str, insensitive: bool = False) -> str:
        raise NotImplementedError("must implement contains_expression")

    def substr_expression(self, a: str, position: int, length: int) -> str:
        return f"SUBSTR({a},{position + 1},{length})"

    def coalesce_expression(self, a: str, b: str) -> str:
        return f"COALESCE({a}, {b})"

    def count_distinct_expression(self, a: str, parameter_attribute_name: Optional[str] = None) -> str:
        return f"COUNT(DISTINCT {a})"

    def if_then_else_expression(self, a: str, b: str, c: Optional[str] = None) -> str:
        else_part = f" ELSE {c}" if c is not None else ""
        return f"CASE WHEN {a} THEN {b}{else_part} END"

    def filter_aggregator_expression(self, aggregate: str, where_filter: str) -> str:
        where_idx = where_filter.find("WHERE")
        if where_idx != -1:
            return f"{aggregate}FILTER ({where_filter[where_idx:]})"
        return aggregate

    def is_not_distinct_from_expression(self, a: str, b: str) -> str:
        null_const = self.null_constant()
        if a == null_const:
            return f"{b} IS {null_const}"
        if b == null_const:
            return f"{a} IS {null_const}"
        return f"({a} IS NOT DISTINCT FROM {b})"

    def regexp_expression(self, expression: str, regexp: str) -> str:
        return f"({expression} REGEXP {self.escape_literal(regexp)})"

    def in_expression(self, operand: str, start: str, end: str, bounds: str) -> str:
        null_const = self.null_constant()
        if start == end and bounds == "[]":
            return f"{operand}={start}"

        start_sql = None
        if start != null_const:
            start_sql = f"{start}{'<=' if bounds[0] == '[' else '<'}{operand}"

        end_sql = None
        if end != null_const:
            end_sql = f"{operand}{'<=' if bounds[1] == ']' else '<'}{end}"

        if start_sql:
            if end_sql:
                return f"({start_sql} AND {end_sql})"
            return start_sql
        elif end_sql:
            return end_sql
        return "TRUE"

    @abstractmethod
    def cast_expression(self, input_type: str, operand: str, target_type: str) -> str:
        ...

    def length_expression(self, a: str) -> str:
        return f"CHAR_LENGTH({a})"

    @abstractmethod
    def time_floor_expression(self, operand: str, duration: str, timezone: str) -> str:
        ...

    @abstractmethod
    def time_bucket_expression(self, operand: str, duration: str, timezone: str) -> str:
        ...

    @abstractmethod
    def time_part_expression(self, operand: str, part: str, timezone: str) -> str:
        ...

    @abstractmethod
    def time_shift_expression(self, operand: str, duration: str, step: int, timezone: str) -> str:
        ...

    @abstractmethod
    def extract_expression(self, operand: str, regexp: str) -> str:
        ...

    @abstractmethod
    def index_of_expression(self, s: str, substr: str) -> str:
        ...

    def quantile_expression(self, s: str, quantile: float, parameter_attribute_name: Optional[str] = None) -> str:
        raise NotImplementedError("dialect does not implement quantile")

    def log_expression(self, base: str, operand: str) -> str:
        import math
        if base == str(math.e):
            return f"LN({operand})"
        return f"LOG({base},{operand})"

    def lookup_expression(self, base: str, lookup: str) -> str:
        raise NotImplementedError("can not express a lookup as a function")

    def string_array_to_sql(self, value: list[str]) -> str:
        raise NotImplementedError("must implement string_array_to_sql")
