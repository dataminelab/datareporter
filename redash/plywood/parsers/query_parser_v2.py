import copy
import logging
from typing import List
import pydash

from redash.plywood.objects.data_cube import DataCube
from redash.plywood.objects.expression import ExpressionNotSupported
from redash.plywood.objects.plywood_value import PlywoodValue
import json

SYSTEM_FIELDS = ("MillisecondsInInterval", "SPLIT")
TIME_SHIFT_ATTRS = '_delta__'
supported_engines = ['postgres', 'mysql', 'bigquery']

logger = logging.getLogger(__name__)


class PlywoodQueryParserV2:
    version = 2

    def __init__(
        self,
        query_result: List,
        data_cube_name: str,
        shape: dict,
        visualization='table',
        data_cube: DataCube = None
    ):
        self._query_result = query_result
        self._data_cube_name = data_cube_name
        self._shape = shape
        self._visualization = visualization
        self._data_cube = data_cube

    @property
    def null(self):
        if self._data_cube:
            return self._data_cube.null_value
        else:
            return 'IS NULL'

    def parse_ply(self, engine: str):
        if engine in supported_engines:
            return self._query_to_ply_data(engine=engine)

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

            row = pydash.head(rows)

            if PlywoodQueryParserV2._contains_time_shift(columns):
                res[key] = row[key]
            else:
                if columns[0]['name'] == '__VALUE__':
                    if row is None:
                        res[key] = 0
                    else:
                        row_value = row.get('__VALUE__', 0)
                        res[key] = row_value if row_value else 0
                else:
                    row_value = row.get(key, 0)
                    res[key] = row_value if row_value else 0

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
        column_name = pydash.head(split['keys'])

        for value in split['data']:
            search_column_name = self.null if value[column_name] is None else f"'{value[column_name]}'"

            query = pydash.find(self._query_result, lambda v: search_column_name in v['query_result']['query'])
            if query is None: continue

            index = pydash.find_index(split['data'], lambda v: v[column_name] == value[column_name])
            if index == -1: continue

            split['data'][index]['SPLIT']['data'] = query['query_result']['data']['rows']

    def _query_to_ply_data(self, engine: str) -> PlywoodValue:
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

        print("QURIES", json.dumps(self._query_result, default=default))
        print("INITAL SHAPE", json.dumps(self._shape))
        print("SHAPE", json.dumps(shape))
        return PlywoodValue.from_json(shape).dict()


def default(obj):
    """Default JSON serializer."""
    import calendar, datetime

    if isinstance(obj, datetime.datetime):
        if obj.utcoffset() is not None:
            obj = obj - obj.utcoffset()
        millis = int(
            calendar.timegm(obj.timetuple()) * 1000 +
            obj.microsecond / 1000
        )
        return millis
    raise TypeError('Not sure how to serialize %s' % (obj,))
