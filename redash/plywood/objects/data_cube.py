from typing import List

import yaml

import pydash

from redash.models.models import Model
from redash.plywood.objects.report_serializer import ReportMetaData
from redash.plywood.plywood import PlywoodApi
from redash.utils.big_query_utils import get_price_for_query


def lower_kind(obj: dict):
    for v in obj['dimensions']:
        if 'kind' in v:
            v['kind'] = v['kind'].lower()


class DataCube:
    def __init__(self, model: Model):
        self._model = model

    @property
    def null_value(self):
        if self.ply_engine == 'postgres':
            return "IS NULL"
        elif self.ply_engine == 'bigquery':
            return "IS NULL"
        elif self.ply_engine == 'mysql':
            return "IS NULL"
        elif self.ply_engine == 'athena':
            return "IS NULL"
        return "IS NULL"

    def get_meta(self, queries: List[dict]) -> ReportMetaData:
        meta = ReportMetaData()
        if self.ply_engine == 'athena':
            for query in queries:
                meta_data = query['query_result']['data']['metadata']

                if 'query_cost' in meta_data:
                    meta.price += meta_data['query_cost']
                if 'data_scanned' in meta_data:
                    meta.proceed_data += meta_data['data_scanned']

        if self.ply_engine == 'bigquery':
            for query in queries:
                meta_data = query['query_result']['data']['metadata']

                cache_hit = meta_data.get('cache_hit', False)

                if cache_hit is False:
                    if 'data_scanned' in meta_data:
                        meta.proceed_data += meta_data['data_scanned']

            price = get_price_for_query(meta.proceed_data)
            meta.price = price
        return meta if meta.has_data else None

    @property
    def redash_engine(self):
        """Returns redash database name"""
        return self._model.data_source.type

    @property
    def ply_engine(self):
        """Returns plywood database name"""
        return PlywoodApi.redash_db_name_to_plywood(self.redash_engine)

    @property
    def attributes(self):
        """Returns DataCube attributes"""
        config = yaml.load(self._model.config.content, Loader=yaml.FullLoader)
        data_cube = pydash.head(config["dataCubes"])
        attributes = data_cube["attributes"] if data_cube else []
        return attributes

    def _get_table_name(self):
        return self._model.table

    @property
    def source_name(self):
        return self._get_table_name()

    @property
    def config(self) -> dict:
        """Returns full config for model the example if above the file"""
        return yaml.load(self._model.config.content, Loader=yaml.FullLoader)

    @property
    def data_cube(self, lower_case_kind=True):
        if not self._model.config:
            return None
        data_cube = pydash.head(self.config["dataCubes"])

        if lower_case_kind:
            lower_kind(data_cube)

        return data_cube

    @property
    def context(self) -> dict:
        """Returns context of the DataCube in dict format"""
        return {
            "engine": self.ply_engine,
            "source": self._get_table_name(),
            "attributes": self.attributes
        }
