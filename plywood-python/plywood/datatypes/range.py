from __future__ import annotations
from datetime import datetime
from typing import Any, Optional

class NumberRange:
    def __init__(self, start: Optional[float], end: Optional[float], bounds: str = "[)"):
        self.start = start
        self.end = end
        self.bounds = bounds

    @classmethod
    def from_js(cls, js: dict) -> NumberRange:
        return cls(
            start=js.get("start"),
            end=js.get("end"),
            bounds=js.get("bounds", "[)"),
        )

    def to_js(self) -> dict:
        result = {"start": self.start, "end": self.end}
        if self.bounds != "[)":
            result["bounds"] = self.bounds
        return result

    def equals(self, other: NumberRange) -> bool:
        if not isinstance(other, NumberRange): return False
        return self.start == other.start and self.end == other.end and self.bounds == other.bounds

    @staticmethod
    def number_bucket(value: float, size: float, offset: float = 0) -> NumberRange:
        start = (value - offset) // size * size + offset
        return NumberRange(start=start, end=start + size, bounds="[)")

    @staticmethod
    def are_equivalent_bounds(b1: str | None, b2: str | None) -> bool:
        if b1 == b2: return True
        if b1 is None: b1 = "[)"
        if b2 is None: b2 = "[)"
        return b1 == b2


class TimeRange:
    def __init__(self, start: Optional[datetime], end: Optional[datetime], bounds: str = "[)"):
        self.start = start
        self.end = end
        self.bounds = bounds

    @classmethod
    def from_js(cls, js: dict) -> TimeRange:
        start = js.get("start")
        end = js.get("end")
        if isinstance(start, str):
            start = datetime.fromisoformat(start.replace("Z", "+00:00"))
        if isinstance(end, str):
            end = datetime.fromisoformat(end.replace("Z", "+00:00"))
        return cls(start=start, end=end, bounds=js.get("bounds", "[)"))

    def to_js(self) -> dict:
        result = {}
        if self.start:
            result["start"] = self.start.isoformat().replace("+00:00", "Z")
        if self.end:
            result["end"] = self.end.isoformat().replace("+00:00", "Z")
        if self.bounds != "[)":
            result["bounds"] = self.bounds
        return result

    def equals(self, other: TimeRange) -> bool:
        if not isinstance(other, TimeRange): return False
        return self.start == other.start and self.end == other.end and self.bounds == other.bounds

    @staticmethod
    def time_bucket(dt: datetime, duration_str: str, timezone_str: str = "Etc/UTC", bounds: str = "[)") -> TimeRange:
        # Simplified — full implementation would use a duration library
        return TimeRange(start=dt, end=dt, bounds=bounds)
