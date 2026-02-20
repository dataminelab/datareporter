"""Tests for plywood.turnilo.hash_codec module."""
from __future__ import annotations

import json
import pytest

from plywood.turnilo.hash_codec import (
    compress_to_base64,
    decompress_from_base64,
    filter_to_hash,
    hash_to_filter,
)


# ---------------------------------------------------------------------------
# compress / decompress round-trip
# ---------------------------------------------------------------------------

class TestCompressDecompressRoundTrip:
    def test_simple_string(self):
        original = "hello world"
        compressed = compress_to_base64(original)
        assert isinstance(compressed, str)
        decompressed = decompress_from_base64(compressed)
        assert decompressed == original

    def test_empty_string(self):
        original = ""
        compressed = compress_to_base64(original)
        decompressed = decompress_from_base64(compressed)
        assert decompressed == original

    def test_unicode_string(self):
        original = "hello unicode: \u00e9\u00e8\u00ea \u4e16\u754c"
        compressed = compress_to_base64(original)
        decompressed = decompress_from_base64(compressed)
        assert decompressed == original

    def test_long_string(self):
        original = "a" * 10000
        compressed = compress_to_base64(original)
        decompressed = decompress_from_base64(compressed)
        assert decompressed == original

    def test_json_string(self):
        obj = {"key": "value", "num": 42, "arr": [1, 2, 3]}
        original = json.dumps(obj)
        compressed = compress_to_base64(original)
        decompressed = decompress_from_base64(compressed)
        assert decompressed == original

    def test_compressed_is_shorter_for_repetitive_data(self):
        original = "a" * 1000
        compressed = compress_to_base64(original)
        assert len(compressed) < len(original)


# ---------------------------------------------------------------------------
# filter_to_hash / hash_to_filter round-trip
# ---------------------------------------------------------------------------

class TestFilterHashRoundTrip:
    def test_simple_object(self):
        obj = {"city": "London", "active": True}
        hashed = filter_to_hash(obj)
        assert isinstance(hashed, str)
        restored = hash_to_filter(hashed)
        assert restored == obj

    def test_empty_object(self):
        obj = {}
        hashed = filter_to_hash(obj)
        restored = hash_to_filter(hashed)
        assert restored == obj

    def test_nested_object(self):
        obj = {"filter": {"op": "is", "operand": {"op": "ref", "name": "city"}}}
        hashed = filter_to_hash(obj)
        restored = hash_to_filter(hashed)
        assert restored == obj

    def test_array_values(self):
        obj = {"tags": ["a", "b", "c"], "counts": [1, 2, 3]}
        hashed = filter_to_hash(obj)
        restored = hash_to_filter(hashed)
        assert restored == obj

    def test_unicode_values(self):
        obj = {"city": "\u00d6sterreich"}
        hashed = filter_to_hash(obj)
        restored = hash_to_filter(hashed)
        assert restored == obj

    def test_null_values(self):
        obj = {"value": None}
        hashed = filter_to_hash(obj)
        restored = hash_to_filter(hashed)
        assert restored == obj

    def test_numeric_values(self):
        obj = {"int": 42, "float": 3.14, "negative": -1}
        hashed = filter_to_hash(obj)
        restored = hash_to_filter(hashed)
        assert restored == obj

    def test_complex_expression(self):
        obj = {
            "op": "and",
            "operand": {
                "op": "overlap",
                "operand": {"op": "ref", "name": "__time"},
                "expression": {
                    "op": "literal",
                    "type": "TIME_RANGE",
                    "value": {"start": "2025-01-01T00:00:00Z", "end": "2025-02-01T00:00:00Z"},
                },
            },
            "expression": {
                "op": "is",
                "operand": {"op": "ref", "name": "country"},
                "expression": {
                    "op": "literal",
                    "type": "SET",
                    "value": {"setType": "STRING", "elements": ["US", "UK"]},
                },
            },
        }
        hashed = filter_to_hash(obj)
        restored = hash_to_filter(hashed)
        assert restored == obj


# ---------------------------------------------------------------------------
# Determinism
# ---------------------------------------------------------------------------

class TestDeterminism:
    def test_same_input_same_output(self):
        obj = {"key": "value"}
        hash1 = filter_to_hash(obj)
        hash2 = filter_to_hash(obj)
        assert hash1 == hash2

    def test_same_string_same_output(self):
        s = "test determinism"
        c1 = compress_to_base64(s)
        c2 = compress_to_base64(s)
        assert c1 == c2

    def test_different_input_different_output(self):
        hash1 = filter_to_hash({"a": 1})
        hash2 = filter_to_hash({"b": 2})
        assert hash1 != hash2
