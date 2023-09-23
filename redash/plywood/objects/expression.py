from typing import Callable
import json

import lzstring
from flask_restful import abort

from redash.plywood.objects.data_cube import DataCube
from redash.plywood.plywood import PlywoodApi

parser = lzstring.LZString()

REPLACE_DATA_CUBE_NAME = 'MAIN_NO_REPEAT_NAME'

CONTEXT = "context"
DATA_CUBE = "dataCube"
EXPRESSION = "expression"

SUPPORTED_VISUALIZATION = ['table', 'totals', 'bar-chart', 'line-chart', 'heatmap']
SUPPORTED_MAX_FILTER_LENGTH = 1
SUPPORTED_MAX_SPLIT_LENGTH = 2
SUPPORTED_MAX_MEASURE_LENGTH = 1
SUPPORTED_MAX_SERIES = 2


class ExpressionNotSupported(Exception):
    def __init__(self, message):
        self.message = message


def replace_value_in_dict(obj: dict, value: str, replace: str):
    for k, v in obj.items():
        if isinstance(v, str):
            if v == value:
                obj[k] = replace
        elif isinstance(v, dict):
            replace_value_in_dict(v, value, replace)


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

    @property
    def visualization(self):
        return self.filter['visualization']

    def _visualization_validation(self):
        if self.visualization not in SUPPORTED_VISUALIZATION:
            raise ExpressionNotSupported(message=f'{self.visualization} is not supported')

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

        cube = self._data_cube.data_cube
        old_name = cube['name']
        cube['name'] = REPLACE_DATA_CUBE_NAME

        res = self._get_from_cache_or_set(
            name="expression",
            func=lambda: PlywoodApi.convert_hash_to_expression(
                hash=self._hash,
                data_cube=cube
            )
        )
        replace_value_in_dict(res, REPLACE_DATA_CUBE_NAME, old_name)
        return res

    @property
    def shape(self):
        return self._get_from_cache_or_set(
            name="shape",
            func=lambda: PlywoodApi.get_shape(self._get_plywood_request())['shape']
        )

    @staticmethod
    def get_shape_from_prepared_expression(data_cube: DataCube, expression: dict):
        return PlywoodApi.get_shape(
            {
                DATA_CUBE: data_cube.source_name,
                CONTEXT: data_cube.context,
                EXPRESSION: expression
            }
        )['shape']

    @property
    def queries(self) -> list:
        return self._get_from_cache_or_set(
            name="queries",
            func=lambda: PlywoodApi.convert_to_sql(body=self._get_plywood_request())
        )

    @staticmethod
    def get_queries_from_prepared_expression(data_cube: DataCube, expression: dict) -> list:
        return PlywoodApi.convert_to_sql({
            DATA_CUBE: data_cube.source_name,
            CONTEXT: data_cube.context,
            EXPRESSION: expression
        })

    def has_multiple_splits(self):
        return len(self.filter['splits']) >= 2

    @staticmethod
    def _is_last_query_boolean(query: str):
        return 'where true' in query.lower()
    
    @staticmethod
    def _is_last_query_boolean_false(query: str):
        return 'where false' in query.lower()

    def get_where_statement(self, last_query: str, prev_query: str, column_name: str, some_column_name: str):
        where = prev_query.split('WHERE')[1].split("GROUP BY")[0]
        if self._data_cube.ply_engine == 'bigquery':
            where = "(" + where + "AND (`" + column_name + "` = '" + some_column_name + "')) "
        else:
            where = "(" + where + "AND (`" + column_name + "` = " + some_column_name + ")) "
        return last_query.replace("WHERE FALSE ", "WHERE" + where)

    def _get_boolean_queries(self, last_query):
        res = [last_query]
        false_query = last_query.replace('TRUE', 'FALSE')
        r = [*self.queries[0:len(self.queries) - 1], *res, false_query]
        return r

    def _get_string_queries(self, last_query: str, prev_result: object) -> list:
        second_result = prev_result[1]
        second_query = self.queries[1]
        if "job" in second_result and second_result["job"]["error"]:
            return abort(400, message=second_result["job"]["error"])
        for i in self.filter["splits"]:
            column_name = i["dimension"]
            some_column_name = f'some_{column_name}'
            if some_column_name in last_query:
                break
            elif column_name in second_query:
                break
        two_splits_queries = []
        if some_column_name not in last_query and column_name not in second_query:
            raise Exception(f'{some_column_name} is not present in query')

        for row in second_result['query_result']['data']['rows']:
            value = row[column_name]
            if value is None:
                query = last_query.replace(f"='{some_column_name}'", f" {self._data_cube.null_value}")
            else:
                query = last_query.replace(some_column_name, value)
            two_splits_queries.append(query)
        return [*self.queries[0:len(self.queries) - 1], *two_splits_queries]

    def _get_string_queries_3(self, last_query: str, prev_result: list, prev_queries: list) -> list:
        ## TODO FINISH THIS
        second_result = prev_result[1]
        column_name = self.filter["splits"][0]["dimension"]
        some_column_name = f'some_{column_name}'

        third_result = prev_result[2]
        third_result_query = third_result['query_result']['query']

        if some_column_name not in last_query:
            raise Exception(f'{some_column_name} is not present in query')

        two_splits_queries = []
        if "job" in third_result and third_result["job"]["error"]:
            raise Exception(f'Error in job: {third_result["job"]["error"]}')

        for row in second_result['query_result']['data']['rows']:
            value = row[column_name]
            if value is None:
                value = self._data_cube.null_value
                query = last_query.replace(f"='{some_column_name}'", f" {self._data_cube.null_value}")
            else:
                if self._data_cube.ply_engine == 'bigquery':
                    query = last_query.replace(f"'{some_column_name}'", f'"{value}"')
                else:
                    query = last_query.replace(some_column_name, value)
            two_splits_queries.append(query)
        return [*self.queries[0:len(self.queries) - 1], *two_splits_queries]

    def get_3_splits_queries(self, prev_result: list, prev_queries: list) -> list:
        queries = self.queries
        last_query: str = queries[len(queries) - 1]
        second_part = self._get_string_queries_3(last_query, prev_result, prev_queries)
        return [*prev_queries, *second_part]
        # return self._get_string_queries(last_query=last_query, prev_result=prev_result)
        # return self.get_3_splits_queries(last_query=last_query, prev_result=prev_result)

    def get_2_splits_queries(self, prev_result: list) -> list:
        queries = self.queries

        last_query: str = queries[len(queries) - 1]

        if self._is_last_query_boolean(last_query):
            return self._get_boolean_queries(last_query)
        else:
            return self._get_string_queries(last_query, prev_result)
