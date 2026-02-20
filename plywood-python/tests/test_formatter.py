"""Tests for plywood.formatter module."""
from __future__ import annotations

import pytest

from plywood.formatter import response_formatter


class TestResponseFormatter:
    def test_simple_string_arrays(self):
        result = response_formatter([["SELECT * FROM t"]])
        assert result == [["SELECT * FROM t"]]

    def test_multiple_queries(self):
        result = response_formatter([["SELECT 1", "SELECT 2"]])
        assert result == [["SELECT 1", "SELECT 2"]]

    def test_dict_with_query_key(self):
        result = response_formatter([[{"query": "SELECT * FROM t"}]])
        assert result == [["SELECT * FROM t"]]

    def test_newline_joining(self):
        result = response_formatter([["SELECT *\nFROM t\nWHERE x=1"]])
        assert result == [["SELECT * FROM t WHERE x=1"]]

    def test_empty_input(self):
        result = response_formatter([])
        assert result == []

    def test_empty_group(self):
        result = response_formatter([[]])
        assert result == [[]]

    def test_multiple_groups(self):
        result = response_formatter([["Q1"], ["Q2"]])
        assert result == [["Q1"], ["Q2"]]

    def test_whitespace_trimming(self):
        result = response_formatter([["  SELECT 1  "]])
        assert result == [["SELECT 1"]]

    def test_dict_without_query_key(self):
        result = response_formatter([[{"other": "val"}]])
        # Falls back to str(value)
        assert len(result) == 1
        assert len(result[0]) == 1
        assert "other" in result[0][0]

    def test_multiline_with_dict(self):
        result = response_formatter([[{"query": "SELECT *\nFROM t"}]])
        assert result == [["SELECT * FROM t"]]
