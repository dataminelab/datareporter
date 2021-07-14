from typing import Callable
import json

import lzstring

from redash.plywood.data_cube_handler import DataCube
from redash.plywood.plywood import PlywoodApi

parser = lzstring.LZString()

CONTEXT = "context"
DATA_CUBE = "dataCube"
EXPRESSION = "expression"

SUPPORTED_VISUALIZATION = ['table']
SUPPORTED_MAX_FILTER_LENGTH = 1
SUPPORTED_MAX_SPLIT_LENGTH = 2
SUPPORTED_MAX_MEASURE_LENGTH = 1
SUPPORTED_MAX_SERIES = 2


class ExpressionNotSupported(Exception):
    def __init__(self, message):
        self.message = message


class Expression:
    """
    Class responsible for all hash manipulation such as
    *Hash to expression conversion
    *Supported filter checker
    """
    _mem_cache: dict = None

    def __init__(self, hash: str, data_cube: DataCube):
        self._data_cube = data_cube
        self._hash = hash
        self._mem_cache = dict()

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

    def _visualization_validation(self):
        visualization = self.filter['visualization']
        if visualization not in SUPPORTED_VISUALIZATION:
            raise ExpressionNotSupported(message=f'{visualization} is not supported')

    def _filters_validations(self):
        filters = self.filter['filters']

        if len(filters) > SUPPORTED_MAX_FILTER_LENGTH:
            raise ExpressionNotSupported(
                message=f'Filter length is not supported, max is {SUPPORTED_MAX_FILTER_LENGTH}'
            )

    def _splits_validation(self):
        splits = self.filter['splits']

        if len(splits) > SUPPORTED_MAX_SPLIT_LENGTH:
            raise ExpressionNotSupported(
                message=f'Split length is not supported, max is {SUPPORTED_MAX_SPLIT_LENGTH}'
            )

    def _series_validation(self):
        series = self.filter['series']

        if len(series) > SUPPORTED_MAX_SERIES:
            raise ExpressionNotSupported(
                message=f'Series length is not supported, max is {SUPPORTED_MAX_SERIES}'
            )

    def _supported_validation(self):
        """Supported validation breakpoint"""

        self._visualization_validation()
        self._filters_validations()
        self._splits_validation()
        self._series_validation()

    @property
    def expression(self):
        self._supported_validation()
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
    def queries(self) -> list:
        return self._get_from_cache_or_set(
            name="queries",
            func=lambda: PlywoodApi.convert_to_sql(body=self._get_plywood_request())
        )

    def is_2_splits(self):
        return len(self.filter['splits']) == 2

    @staticmethod
    def _is_last_query_boolean(query: str):
        return 'true' in query.lower()

    def _get_boolean_queries(self, last_query):
        res = [last_query]
        false_query = last_query.replace('TRUE', 'FALSE')

        r = [*self.queries[0:len(self.queries) - 1], *res, false_query]
        return r

    def _get_string_queries(self, last_query, prev_result):
        second_result = prev_result[1]
        column_name = self.filter["splits"][0]["dimension"]
        some_column_name = f'some_{column_name}'

        if some_column_name not in last_query:
            raise Exception(f'{some_column_name} is not present in query')

        two_splits_queries = []

        for row in second_result['query_result']['data']['rows']:

            value = row[column_name]
            if value is None:
                value = self._data_cube.null_value
                query = last_query.replace(f"='{some_column_name}'", f" {value}")
            else:
                query = last_query.replace(some_column_name, value)

            two_splits_queries.append(query)

        return [*self.queries[0:len(self.queries) - 1], *two_splits_queries]

    def get_2_splits_queries(self, prev_result: list) -> list:
        queries = self.queries

        if len(queries) != 3:
            print(f'Might not work as expected')

        last_query: str = queries[len(queries) - 1]

        if self._is_last_query_boolean(last_query):
            print("BOOLEAN")
            return self._get_boolean_queries(last_query=last_query)
        else:
            return self._get_string_queries(last_query=last_query, prev_result=prev_result)
