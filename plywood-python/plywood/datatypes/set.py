from __future__ import annotations
from typing import Any, List

class Set:
    """Discrete set of values, mirrors Plywood's Set."""

    def __init__(self, set_type: str, elements: List[Any]):
        self.set_type = set_type  # e.g. "SET/STRING", "SET/NUMBER"
        self.elements = elements

    @classmethod
    def from_js(cls, js: Any) -> Set:
        if isinstance(js, list):
            # Infer type from elements
            if not js:
                return cls("SET/STRING", [])
            first = js[0]
            if isinstance(first, (int, float)):
                return cls("SET/NUMBER", js)
            return cls("SET/STRING", [str(e) for e in js])
        if isinstance(js, dict):
            set_type = js.get("setType", "STRING")
            elements = js.get("elements", [])
            return cls(f"SET/{set_type}", elements)
        return cls("SET/STRING", [])

    def to_js(self) -> dict:
        return {"setType": self.set_type.replace("SET/", ""), "elements": self.elements}

    def size(self) -> int:
        return len(self.elements)

    def empty(self) -> bool:
        return len(self.elements) == 0

    def contains(self, value: Any) -> bool:
        return value in self.elements

    def equals(self, other: Set) -> bool:
        if not isinstance(other, Set): return False
        return self.set_type == other.set_type and sorted(str(e) for e in self.elements) == sorted(str(e) for e in other.elements)

    @staticmethod
    def is_set_type(t: str | None) -> bool:
        return t is not None and t.startswith("SET")

    @staticmethod
    def unwrap_set_type(t: str | None) -> str | None:
        if t is None: return None
        if t.startswith("SET/"): return t[4:]
        if t == "SET": return None
        return t

    @staticmethod
    def is_atomic_type(t: str | None) -> bool:
        return t in ("NULL", "BOOLEAN", "NUMBER", "TIME", "STRING", "IP")
