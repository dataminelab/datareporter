from __future__ import annotations
from typing import List

def response_formatter(response: List[List[str]]) -> List[List[str]]:
    """Flatten SQL query plans — port of response-formatter.ts."""
    result = []
    for query_group in response:
        formatted_group = []
        for value in query_group:
            if isinstance(value, dict):
                value = value.get("query", str(value))
            # Join newlines and trim
            formatted = " ".join(str(value).split("\n")).strip()
            formatted_group.append(formatted)
        result.append(formatted_group)
    return result
