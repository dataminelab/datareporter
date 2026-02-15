from __future__ import annotations
import json
from typing import Any

def compress_to_base64(data: str) -> str:
    """Compress a string to base64 using lzstring."""
    import lzstring
    x = lzstring.LZString()
    return x.compressToBase64(data)

def decompress_from_base64(compressed: str) -> str:
    """Decompress a base64 string using lzstring."""
    import lzstring
    x = lzstring.LZString()
    return x.decompressFromBase64(compressed)

def filter_to_hash(json_obj: Any) -> str:
    """Convert a JSON object to an LZ-compressed base64 hash."""
    return compress_to_base64(json.dumps(json_obj))

def hash_to_filter(hash_str: str) -> Any:
    """Convert an LZ-compressed base64 hash back to a JSON object."""
    return json.loads(decompress_from_base64(hash_str))
