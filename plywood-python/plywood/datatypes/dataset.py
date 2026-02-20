from __future__ import annotations
from typing import Any, Dict, List

class Dataset:
    """Placeholder for nested tabular data."""
    def __init__(self, keys: List[str] = None, data: List[Dict[str, Any]] = None):
        self.keys = keys or []
        self.data = data or [{}]

    def basis(self) -> bool:
        return len(self.data) == 1 and len(self.data[0]) == 0

    @classmethod
    def from_js(cls, js: dict) -> Dataset:
        return cls(keys=js.get("keys", []), data=js.get("data", [{}]))
