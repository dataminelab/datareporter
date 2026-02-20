from __future__ import annotations
from typing import Any, Dict, List, Optional
from .base import External

class SQLExternal(External):
    """Assembles SQL queries from expression trees, faithful port of sqlExternal.ts."""

    def __init__(self, params: dict):
        super().__init__(params)
        self.with_query = params.get("withQuery")

    def get_from(self) -> str:
        dialect = self.get_dialect()
        if self.with_query:
            return "FROM __with__ AS t"
        return f"FROM {dialect.escape_name(self.source)} AS t"

    def get_query_and_post_transform(self, expression, context: dict = None, options: dict = None) -> List[str]:
        """Given an expression tree, produce the SQL query strings."""
        from ..expressions.base import Expression
        from ..expressions.chain import FilterExpression, SplitExpression, ApplyExpression, SortExpression, LimitExpression
        from ..expressions.literal import LiteralExpression

        dialect = self.get_dialect()
        if self.table:
            dialect.set_table("t")

        # Walk the expression tree to extract: filters, splits, applies, sort, limit
        filters = []
        splits = None
        applies = []
        sort_expr = None
        limit_expr = None

        def walk(expr):
            nonlocal splits, sort_expr, limit_expr
            if isinstance(expr, LimitExpression):
                limit_expr = expr
                walk(expr.operand)
            elif isinstance(expr, SortExpression):
                sort_expr = expr
                walk(expr.operand)
            elif isinstance(expr, ApplyExpression):
                applies.append(expr)
                walk(expr.operand)
            elif isinstance(expr, SplitExpression):
                splits = expr
                walk(expr.operand)
            elif isinstance(expr, FilterExpression):
                filters.append(expr.expression)
                walk(expr.operand)
            # else: base expression (ref, literal, external) — stop

        walk(expression)
        applies.reverse()  # They were collected in reverse order

        query_parts = []

        # WITH clause
        if self.with_query:
            query_parts.append(f"WITH __with__ AS ({self.with_query})\n")

        query_parts.append("SELECT")

        from_clause = self.get_from()

        # WHERE clause
        if filters:
            filter_sqls = [f.get_sql(dialect) for f in filters]
            where_sql = " AND ".join(f"({s})" for s in filter_sqls)
            from_clause += f"\nWHERE {where_sql}"

        # Determine mode based on structure
        if splits:
            # Split mode
            select_parts = splits.get_select_sql(dialect)
            apply_parts = [a.get_sql(dialect) for a in applies]
            query_parts.append(",\n".join(select_parts + apply_parts))
            query_parts.append(from_clause)

            group_by = splits.get_short_group_by_sql()
            query_parts.append(f"GROUP BY {','.join(group_by)}")
        elif applies:
            # Total mode (aggregation without split)
            apply_parts = [a.get_sql(dialect) for a in applies]
            query_parts.append(",\n".join(apply_parts))
            query_parts.append(from_clause)
            group_by = dialect.empty_group_by()
            if group_by:
                query_parts.append(group_by)
        else:
            # Raw mode
            if self.attributes:
                cols = [dialect.escape_name(a.name) for a in self.attributes]
                query_parts.append(", ".join(cols))
            else:
                query_parts.append("*")
            query_parts.append(from_clause)

        if sort_expr:
            query_parts.append(sort_expr.get_sql(dialect))

        if limit_expr:
            query_parts.append(limit_expr.get_sql(dialect))

        return ["\n".join(query_parts)]
