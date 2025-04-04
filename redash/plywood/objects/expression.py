from typing import Callable
import json
import re
import lzstring
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

    def __init__(self, _hash: str, data_cube: DataCube):
        self._data_cube = data_cube
        self.hash = _hash
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
            func=lambda: json.loads(parser.decompressFromBase64(self.hash))
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
                hash=self.hash,
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

    def get_where_statement(self, query: str):
        where = query.split('WHERE')[-1]
        return re.sub(r"\s{1}\w{1,2}\s{1}\w{1,4}.*", "", where)

    def _get_boolean_queries(self, last_query):
        res = [last_query]
        false_query = last_query.replace('TRUE', 'FALSE')
        r = [*self.queries[0:len(self.queries) - 1], *res, false_query]
        return r

    def _get_boolean_queries_true(self, last_query):
        true_query = last_query.replace('FALSE', 'TRUE')
        r = [*self.queries[0:len(self.queries) - 1], true_query]
        return r

    def get_filter_ref(self):
        ref = ""
        for i in self.filter["filters"]:
            _type = i["type"]
            if "values" not in i:
                continue
            elif not _type == "string":
                continue
            ref = i["ref"]
            break
        if not ref:
            raise Exception("No string filter found")
        return ref

    def _get_string_queries(self, last_query: str, prev_result: object) -> list:
        second_result = prev_result[1]
        for i in self.filter["splits"]:
            column_name = i["dimension"]
            some_column_name = f'some_{column_name}'
            if some_column_name in last_query:
                break
        if some_column_name not in last_query:
            last_query = self.fix_string_filter(last_query)
            return self._get_string_queries(last_query, prev_result)

        two_splits_queries = []
        for row in second_result['query_result']['data']['rows']:
            value = row[column_name]
            if value is None:
                query = last_query.replace(f"='{some_column_name}'", f" {self._data_cube.null_value}")
            else:
                query = last_query.replace(some_column_name, value)
            two_splits_queries.append(query)
        return [*self.queries[0:len(self.queries) - 1], *two_splits_queries]

    def fix_string_filter(self, last_query):
        # XXX
        # if same data name found on both split and filter
        where = self.get_where_statement(self.queries[0])
        # delete last paranthesis
        where = where[0:len(where)-1]
        ref = self.get_filter_ref()
        some_ref = f"some_{ref}"
        # delete last paranthesis back
        # XXX test below next week
        if where.endswith("))"):
            where = where[0:len(where)-1]
        where_ref = f"(`{ref}`='{some_ref}'))"
        where = f"{where} AND {where_ref}"
        if self._is_last_query_boolean_false(last_query):
            last_query = last_query.replace('FALSE', where)
        else:
            select, _ = last_query.split('WHERE')
            _, group_by = _.split('GROUP BY')
            return select + " WHERE " + where + " GROUP BY " + group_by
        return last_query

    def get_2_splits_queries(self, prev_result: list) -> list:
        queries = self.queries

        last_query: str = queries[len(queries) - 1]

        if self._is_last_query_boolean(last_query):
            return self._get_boolean_queries(last_query)
        else:
            return self._get_string_queries(last_query, prev_result)
