from flask import request

from redash.handlers.base import BaseResource, require_fields, get_object_or_404
from redash.handlers.query_results import run_query
from redash.models import ParameterizedQuery
from redash.models.models import Model
from redash.permissions import require_permission
from redash.plywood.plywood import PlywoodApi

CONTEXT = "context"
DATA_CUBE = "dataCube"
EXPRESSION = "expression"


class ReportsResource(BaseResource):
    @require_permission("generate_report")
    def post(self, model_id):
        req = request.get_json(True)
        require_fields(req, (DATA_CUBE, EXPRESSION,))
        model = get_object_or_404(Model.get_by_id, model_id)
        queries = PlywoodApi.convert_to_sql(body=self._build_plywood_request(req, model))
        max_age = req.get("max_age", -1)
        query_id = "adhoc"

        return [self.execute_query(query, max_age, model, query_id) for query in queries]

    def execute_query(self, query: str, max_age: int, model: Model, query_id: str):
        parameterized_query = ParameterizedQuery(query, org=self.current_org)
        parameters = {}

        return run_query(
            parameterized_query, parameters, model.data_source, query_id, max_age
        )

    @staticmethod
    def _build_plywood_request(req, model: Model):
        context = ReportsResource._build_context(model)
        return {
            DATA_CUBE: req[DATA_CUBE],
            CONTEXT: context,
            EXPRESSION: req[EXPRESSION]
        }

    @staticmethod
    def _build_context(model: Model):
        return {
            "engine": ReportsResource._get_engine(model),
            "source": ReportsResource._get_source_name(model),
            "attributes": ReportsResource._get_table_columns(model)
        }

    @staticmethod
    def _get_source_name(model: Model):
        return model.table

    @staticmethod
    def _get_table_columns(model: Model):
        return [{"name": column.name, "type": column.type} for column in model.table_columns.all()]

    @staticmethod
    def _get_engine(model):
        return model.data_source.type
