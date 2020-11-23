from flask import request

from redash.handlers.base import BaseResource, require_fields, get_object_or_404
from redash.models.models import Model
from redash.permissions import require_permission
from redash.plywood.plywood import PlywoodApi


class ReportsResource(BaseResource):
    @require_permission("generate_report")
    def get(self, model_id):
        req = request.get_json(True)
        require_fields(req, ('model_id', 'expression'))
        model = get_object_or_404(Model.get_by_id, model_id)
        raw_sql_queries = PlywoodApi.convert_to_sql(body=self._build_plywood_request(req, model))
        # TODO: use workers to execute sql queries
        return []

    @staticmethod
    def _build_plywood_request(req, model: Model):
        context = ReportsResource._build_context(model)
        expression = req['expression']

        return {
            'dataCube': '',
            'context': context,
            'expression': expression
        }

    @staticmethod
    def _build_context(model: Model):
        engine = ReportsResource._get_engine(model)
        return {
            'engine': engine
        }

    @staticmethod
    def _get_engine(model):
        return model.data_source.type
