from __future__ import annotations
from typing import Any, Dict
from .hash_codec import decompress_from_base64
import json

def hash_to_expression(hash_str: str, data_cube: dict) -> dict:
    """Convert a Turnilo hash + DataCube into a Plywood expression tree dict.

    This is a simplified port. The full implementation handles all Turnilo
    visualization types and their specific expression patterns.
    """
    # Decompress the hash to get the view definition
    try:
        view_def_str = decompress_from_base64(hash_str)
        view_def = json.loads(view_def_str)
    except Exception:
        return {"error": "Failed to decompress hash"}

    # Build expression from view definition
    return _build_expression(view_def, data_cube)

def _build_expression(view_def: dict, data_cube: dict) -> dict:
    """Build a Plywood expression tree from a Turnilo view definition."""

    # Extract components from view definition
    filters = view_def.get("filter", {})
    splits = view_def.get("splits", [])
    series = view_def.get("series", []) or view_def.get("selectedMeasures", [])

    # Start with base expression: $main
    expression = {"op": "ref", "name": data_cube.get("name", "main"), "nest": 0}

    # Build result
    result = {
        "expression": expression,
        "context": {
            "engine": data_cube.get("engine", ""),
            "source": data_cube.get("source", ""),
            "attributes": data_cube.get("attributes", []),
        },
        "dataCube": data_cube.get("name", ""),
    }

    return result
