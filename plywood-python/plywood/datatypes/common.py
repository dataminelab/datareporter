from __future__ import annotations
from enum import Enum
from typing import Any

# PlyType values used by the system
VALID_PLY_TYPES = {
    "NULL", "BOOLEAN", "NUMBER", "NUMBER_RANGE", "TIME", "TIME_RANGE",
    "STRING", "STRING_RANGE", "SET", "SET/NULL", "SET/BOOLEAN", "SET/NUMBER",
    "SET/TIME", "SET/STRING", "SET/NUMBER_RANGE", "SET/TIME_RANGE", "SET/IP",
    "IP", "DATASET", "TIME_SERIES",
}

def is_set_type(t: str | None) -> bool:
    return t is not None and t.startswith("SET")

def unwrap_set_type(t: str | None) -> str | None:
    if t is None: return None
    if t.startswith("SET/"): return t[4:]
    if t == "SET": return None
    return t

def is_range_type(t: str | None) -> bool:
    return t is not None and t.endswith("_RANGE")

def unwrap_range_type(t: str | None) -> str | None:
    if t is None: return None
    if t.endswith("_RANGE"): return t[:-6]
    return t

def valid_type(type_name: str) -> bool:
    return type_name in VALID_PLY_TYPES

def get_value_type(value: Any) -> str:
    """Determine PlyType from a Python value."""
    if value is None: return "NULL"
    if isinstance(value, bool): return "BOOLEAN"
    if isinstance(value, (int, float)): return "NUMBER"
    if isinstance(value, str): return "STRING"
    if isinstance(value, datetime): return "TIME"
    if isinstance(value, NumberRange): return "NUMBER_RANGE"
    if isinstance(value, TimeRange): return "TIME_RANGE"
    if isinstance(value, Set): return value.set_type
    if isinstance(value, Dataset): return "DATASET"
    return "NULL"

# Import these at module level after the functions to avoid circular imports
from datetime import datetime
from .range import NumberRange, TimeRange
from .set import Set
from .dataset import Dataset
