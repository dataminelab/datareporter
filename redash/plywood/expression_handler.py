from typing import Callable

import lzstring
import json

from redash.plywood.data_cube_handler import DataCube
from redash.plywood.plywood import PlywoodApi

parser = lzstring.LZString()

CONTEXT = "context"
DATA_CUBE = "dataCube"
EXPRESSION = "expression"


class Expression:
    """
    Class responsible for all hash manipulation such as
    *Hash to expression conversion
    *Supported filter checker
    """
    _mem_cache = {}

    def __init__(self, hash: str, data_cube: DataCube):
        self._data_cube = data_cube
        self._hash = hash

    def _get_from_cache_or_set(self, name: str, func: Callable, refresh=False):
        if name in self._mem_cache and refresh is False:
            value = self._mem_cache[name]
            if value is not None:
                return self._mem_cache[name]

        self._mem_cache[name] = func()
        return self._mem_cache[name]

    def _get_plywood_request(self):
        return {
            DATA_CUBE: self._data_cube.source_name,
            CONTEXT: self._data_cube.context,
            EXPRESSION: self.expression
        }

    @property
    def filter(self) -> dict:
        return self._get_from_cache_or_set(
            name="filter",
            func=lambda: json.loads(parser.decompressFromBase64(self._hash))
        )

    @property
    def expression(self):
        return self._get_from_cache_or_set(
            name="expression",
            func=lambda: PlywoodApi.convert_hash_to_expression(
                hash=self._hash,
                data_cube=self._data_cube.data_cube
            )
        )

    @property
    def shape(self):
        return self._get_from_cache_or_set(
            name="shape",
            func=lambda: PlywoodApi.get_shape(self._get_plywood_request())['shape']
        )

    @property
    def queries(self):
        return self._get_from_cache_or_set(
            name="queries",
            func=lambda: PlywoodApi.convert_to_sql(body=self._get_plywood_request())
        )
