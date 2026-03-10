from typing import Dict, List, Union

import pydash
import yaml

from redash.models.models import Model
from redash.plywood.objects.report_serializer import ReportMetaData
from redash.plywood.plywood import PlywoodApi
from redash.utils.big_query_utils import get_price_for_query


def lower_kind(obj: dict):
    for v in obj["dimensions"]:
        if "kind" in v:
            v["kind"] = v["kind"].lower()


class DataCube:
    def __init__(self, model: Model):
        self._model = model

    @property
    def null_value(self):
        if self.ply_engine == "postgres":
            return "IS NULL"
        elif self.ply_engine == "bigquery":
            return "IS NULL"
        elif self.ply_engine == "mysql":
            return "IS NULL"
        elif self.ply_engine == "athena":
            return "IS NULL"
        elif self.ply_engine == "druid":
            return "IS NULL"
        return "IS NULL"

    def get_meta(self, queries: List[dict]) -> Union[ReportMetaData, None]:
        meta = ReportMetaData()
        if self.ply_engine == "athena":
            for query in queries:
                meta_data = query["query_result"]["data"]["metadata"]

                if "query_cost" in meta_data:
                    meta.price += meta_data["query_cost"]
                if "data_scanned" in meta_data:
                    meta.proceed_data += meta_data["data_scanned"]

        if self.ply_engine == "bigquery":
            for query in queries:
                meta_data = query["query_result"]["data"]["metadata"]

                cache_hit = meta_data.get("cache_hit", False)

                if cache_hit is False:
                    if "data_scanned" in meta_data:
                        meta.proceed_data += meta_data["data_scanned"]

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
        attributes = data_cube["attributes"] if isinstance(data_cube, dict) and "attributes" in data_cube else []
        return attributes

    @property
    def is_query_based(self):
        """True if this cube is defined by a SQL query rather than a table."""
        return bool(self._model.query_id)

    def _get_table_name(self):
        if self.is_query_based:
            # Query-based models use the model name as a synthetic source identifier.
            # Plywood uses this as the data cube name in expressions; the actual SQL
            # comes from withQuery in the context.
            return self._model.name
        return self._model.table

    @property
    def source_name(self):
        return self._get_table_name()

    @property
    def config(self) -> dict:
        """Returns full config for model the example if above the file"""
        return yaml.load(self._model.config.content, Loader=yaml.FullLoader)

    @property
    def data_cube(self, lower_case_kind=True) -> Union[None, "DataCube"]:
        if not self._model.config:
            return None
        data_cube = pydash.head(self.config["dataCubes"])

        if lower_case_kind and isinstance(data_cube, dict):
            lower_kind(data_cube)

        return data_cube  # type: ignore

    @property
    def context(self) -> Dict:
        """Returns context of the DataCube in dict format"""
        ctx = {"engine": self.ply_engine, "source": self._get_table_name(), "attributes": self.attributes}
        if self.is_query_based:
            ctx["withQuery"] = self._model.query_rel.query_text
        return ctx
