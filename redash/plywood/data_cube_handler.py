import yaml

import pydash

from redash.models.models import Model
from redash.plywood.plywood import PlywoodApi

"""
Example config
{
            "appSettings": {
                "dataCubes": [
                    {
                        "name": "customer",
                        "title": "Customer",
                        "timeAttribute": "last_update",
                        "clusterName": "native",
                        "defaultSortMeasure": "active",
                        "defaultSelectedMeasures": [
                            "active"
                        ],
                        "attributes": [
                            {
                                "name": "active",
                                "type": "NUMBER",
                                "nativeType": "INTEGER"
                            }
                        ],
                        "dimensions": [
                            {
                                "name": "activebool",
                                "title": "Activebool",
                                "formula": "$activebool",
                                "kind": "BOOLEAN"
                            }
                        ],
                        "measures": [
                            {
                                "name": "active",
                                "title": "Active",
                                "formula": "$main.sum($active)"
                            }
                        ]
                    }
                ],
                "clusters": [],
                "customization": {}
            },
                "timekeeper": {}
        }
"""


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

        return "IS NULL"

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
