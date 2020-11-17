from redash import models
from redash.handlers.base import BaseResource, require_fields
from redash.permissions import require_admin
from flask import request

from redash.plywood.plywood import PlywoodApi


class ReportsResource(BaseResource):
    @require_admin
    def post(self):
        req = request.get_json(True)
        require_fields(req, ('config_id', 'expression'))
        raw_sql_queries = PlywoodApi.convert_to_sql(body=self._build_plywood_request(req))
        return []

    @staticmethod
    def _build_plywood_request(req):
        config_id = req['config_id']
        context = ReportsResource._build_context(config_id)

        expression = req['expression']

        return {
            'dataCube': 'some-data-cube',
            'context': context,
            'expression': expression
        }

    @staticmethod
    def _build_context(config_id):
        configuration = models.Configuration.get_by_id(config_id)
        return {}
