import copy
from typing import List

from redash.plywood.expression_handler import ExpressionNotSupported

SYSTEM_FIELDS = ("MillisecondsInInterval", "SPLIT")
TIME_SHIFT_ATTRS = '_delta__'
supported_engines = ['postgres', 'mysql', 'bigquery']


class PlywoodQueryParserV2:
    version = 2

    def __init__(self, query_result: List, data_cube_name: str, shape: dict, visualization='table'):
        self._query_result = query_result
        self._data_cube_name = data_cube_name
        self._shape = shape
        self._visualization = visualization

    def parse_ply(self, engine: str):
        if engine in supported_engines:
            return self._query_to_ply_data()

        raise ExpressionNotSupported(message=f'{engine} is not supported')

    @staticmethod
    def _contains_time_shift(columns: list):
        for column in columns:
            if TIME_SHIFT_ATTRS in column['name']:
                return True
        return False

    def _get_change_attrs(self, attributes: list) -> List[dict]:
        change_attrs = list(
            filter(lambda x: (x['name'] not in SYSTEM_FIELDS and x['name'] != self._data_cube_name),
                   attributes['attributes']))

        return change_attrs

    def _get_zero_value(self, attributes: list):
        """First query is always about count"""
        res = {}

        rows: list = self._query_result[0]['query_result']['data']['rows']
        columns: list = self._query_result[0]['query_result']['data']['columns']

        for value in attributes:
            key = value['name']

            if PlywoodQueryParserV2._contains_time_shift(columns):
                row = next(iter(rows))
                res[key] = row[key]
            else:
                row = next(iter(rows), None)
                if columns[0]['name'] == '__VALUE__':
                    if row is None:
                        res[key] = 0
                    else:
                        res[key] = row.get('__VALUE__', 0)
                else:
                    res[key] = row.get(key, 0)

        return res

    def _get_first_split(self):
        """if only one split it's safe change to copy result"""
        rows: list = self._query_result[1]['query_result']['data']['rows']
        return rows

    def _build_first_split(self, shape: dict):
        split_data = shape['data'][0]['SPLIT']
        data = self._get_first_split()
        sample = copy.deepcopy(split_data['data'][0])
        split_data['data'] = list()

        for value in data:
            sample_copy = copy.deepcopy(sample)
            sample_copy.update(value)
            split_data['data'].append(sample_copy)

    def _build_second_split(self, shape: dict):

        split = shape['data'][0]['SPLIT']

        column_name = next(iter(split['keys']))

        for value in split['data']:
            column_value = value[column_name]

            query = next((item for item in self._query_result if column_value in item['query_result']['query']), None)
            if query is None:
                continue

            index = next((index for (index, d) in enumerate(split['data']) if
                          d[column_name] == column_value), None)

            row = next(iter(query['query_result']['data']['rows']), None)
            split['data'][index]['SPLIT']['data'][0].update(row)

    def _query_to_ply_data(self):
        shape = copy.deepcopy(self._shape)

        # First query
        first_change_attributes = self._get_change_attrs(shape)
        first_replace = self._get_zero_value(first_change_attributes)

        if len(first_replace.keys()) > 0:
            shape['data'][0].update(first_replace)

        # If exists second query, means it's 1 split

        if len(self._query_result) >= 2:
            self._build_first_split(shape=shape)

        if len(self._query_result) >= 3:
            self._build_second_split(shape=shape)

        return shape
