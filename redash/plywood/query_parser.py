import copy
import json
from typing import List

from redash.plywood.expression_handler import ExpressionNotSupported

SYSTEM_FIELDS = ("MillisecondsInInterval", "SPLIT")
TIME_SHIFT_ATTRS = '_delta__'
supported_engines = ['postgres', 'mysql', 'bigquery']


class PlywoodQueryParserV1:

    def __init__(self, query_result: List, data_cube_name: str, shape: dict, visualization='table'):
        self._query_result = query_result
        self._data_cube_name = data_cube_name
        self._shape = shape
        self._visualization = visualization

    def parse_ply(self, engine: str):
        if engine in supported_engines:
            return self.query_to_ply_data()

        raise ExpressionNotSupported(message=f'{engine} is not supported')

    @staticmethod
    def _contains_time_shift(columns: list):
        for column in columns:
            if TIME_SHIFT_ATTRS in column['name']:
                return True
        return False

    def query_to_ply_data(self):
        res = copy.deepcopy(self._shape)

        def recursive_fill(data: dict, depth=0):
            change_attrs = list(
                filter(lambda x: (x['name'] not in SYSTEM_FIELDS and x['name'] != self._data_cube_name),
                       data['attributes']))

            print(f'Change attr {change_attrs} depth is {depth}')

            rows: list = self._query_result[depth]['query_result']['data']['rows']
            columns: list = self._query_result[depth]['query_result']['data']['columns']

            for value in change_attrs:
                key = value['name']

                if PlywoodQueryParserV1._contains_time_shift(columns) and len(rows) == 1:
                    row = next(iter(rows), None)
                    data['data'][0][key] = row[key]

                elif len(columns) == 1:
                    row = next(iter(rows), None)
                    # handle only __VALUE__ case
                    if columns[0]['name'] == '__VALUE__':
                        if row is None:
                            data['data'][0][key] = 0
                        else:
                            data['data'][0][key] = row.get('__VALUE__', 0)

                    # REST LATER
                    else:
                        pass
                else:
                    contains_split = bool(next((item for item in data['attributes'] if item["name"] == "SPLIT"), False))

                    if contains_split is False:
                        data['data'] = rows
                    else:
                        print('data', data)
                        sample = next(iter(data['data']))
                        column_name = next(iter(data['keys']))

                        data['data'] = list()

                        print(len(self._query_result))

                        first_query, second_query, *rest_queries = self._query_result

                        for row in second_query['query_result']['data']['rows']:
                            sample_copy = sample.copy()
                            value = row[column_name]
                            result = next((item for item in rest_queries if value in item["query_result"]["query"]),
                                          None)
                            if result is None:
                                continue

                            print('sample', sample)
                            change_attrs = list(
                                filter(lambda x: (x['name'] not in SYSTEM_FIELDS and x['name'] != self._data_cube_name),
                                       data['attributes']))

                            second_query_result = next((item for item in second_query['query_result']['data']['rows'] if
                                                        item[column_name] == value), None)

                            if second_query_result is None:
                                continue

                            print('second', second_query_result)
                            for change_attribute in change_attrs:
                                name = change_attribute['name']

                                sample_copy[name] = second_query_result[name]

                            print('CHANGE', change_attrs)
                            print(f'sample {sample}')

                            # one level down
                            down_change_attrs = list(
                                filter(lambda x: (x['name'] not in SYSTEM_FIELDS and x['name'] != self._data_cube_name),
                                       sample_copy['SPLIT']['attributes']))

                            inner_row = next(iter(result['query_result']['data']['rows']))
                            sample_copy['SPLIT']['data'] = [inner_row]

                            print('result', result)
                            print('down chanage attr', down_change_attrs)
                            print(f'sample copy', sample_copy)

                            data['data'].append(sample_copy)
                        return
            if len(data['data']) >= 1 and 'SPLIT' in data['data'][0]:
                recursive_fill(data['data'][0]['SPLIT'], depth=depth + 1)

        recursive_fill(res)

        return res


class QueryMaker:
    pass
