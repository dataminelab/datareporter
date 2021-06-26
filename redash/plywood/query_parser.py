import copy
from typing import List
import json

SYSTEM_FIELDS = ("MillisecondsInInterval", "SPLIT")


class PlywoodQueryParser:

    def __init__(self, query_result: List, data_cube_name: str, shape: dict, visualization='table'):
        self.query_result = query_result
        self.data_cube_name = data_cube_name
        self.shape = shape
        self.visualization = visualization

    def parse_ply(self, engine: str):
        if engine == 'postgres' or engine == 'mysql' or engine == 'bigquery':
            return self.query_to_ply_data()

        raise Exception("Engine not supported")

    def query_to_ply_data(self):
        res = copy.deepcopy(self.shape)

        def recursive_fill(data: dict, depth=0):
            change_attrs = list(
                filter(lambda x: (x['name'] not in SYSTEM_FIELDS and x['name'] != self.data_cube_name),
                       data['attributes']))

            rows = self.query_result[depth]['query_result']['data']['rows']
            columns = self.query_result[depth]['query_result']['data']['columns']

            print('columns', len(columns))
            print('depth', depth)
            print(change_attrs)
            print(data['data'][0])
            for value in change_attrs:
                key = value['name']

                if len(columns) == 1:
                    row = next(iter(rows), None)

                    # handle only __VALUE__ case
                    if columns[0]['name'] == '__VALUE__':
                        if row is None:
                            data['data'][0][key] = 0
                        else:
                            data['data'][0][key] = row.get('__VALUE__', 0)

                    # REST LATER
                    else:
                        print('Else')
                else:
                    data['data'] = rows

            if len(data['data']) >= 1 and 'SPLIT' in data['data'][0]:
                recursive_fill(data['data'][0]['SPLIT'], depth=depth + 1)

        recursive_fill(res)

        return res
