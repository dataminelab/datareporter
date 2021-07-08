from typing import List, Union

import yaml
import lzstring
import json
from flask import request, make_response
from flask_restful import abort
from funcy import project
from sqlalchemy.orm.exc import NoResultFound
from redash import models
from redash.handlers.base import BaseResource, require_fields, get_object_or_404, paginate
from redash.handlers.queries import order_results
from redash.handlers.query_results import run_query
from redash.models import ParameterizedQuery
from redash.models.models import Model, Report
from redash.permissions import require_permission, require_object_view_permission, require_object_modify_permission, \
    require_object_delete_permission
from redash.plywood.data_cube_handler import DataCube
from redash.plywood.expression_handler import Expression, ExpressionNotSupported
from redash.plywood.plywood import PlywoodApi
from redash.plywood.query_parser_v2 import PlywoodQueryParserV2
from redash.serializers.report_serializer import ReportSerializer
from redash.services.expression import ExpressionBase64Parser
from redash.plywood.query_parser import PlywoodQueryParserV1

CONTEXT = "context"
DATA_CUBE = "dataCube"
EXPRESSION = "expression"
HASH = "hash"
NAME = "name"
MODEL_ID = "model_id"

MAX_AGE = -1

parser = lzstring.LZString()
QUERY_ID = 'adhoc'


def lower_kind(obj: dict):
    for v in obj['dimensions']:
        if 'kind' in v:
            v['kind'] = v['kind'].lower()


class ReportGenerateResource(BaseResource):
    @require_permission("generate_report")
    def post(self, model_id):

        req = request.get_json(True)

        require_fields(req, (HASH,))
        hash_string = req[HASH]
        version = req.get('version', 'v2')

        model = get_object_or_404(Model.get_by_id, model_id)
        try:
            data_cube = DataCube(model=model)
            expression = Expression(hash=hash_string, data_cube=data_cube)

            max_age = req.get("max_age", MAX_AGE)

            queries_result = [self.execute_query(query, max_age, model, QUERY_ID) for query in expression.queries]

            return self._parse_result(queries=queries_result,
                                      data_cube=data_cube,
                                      expression=expression,
                                      model=model,
                                      version=version)
        except ExpressionNotSupported as e:
            abort(400, message=e.message)

    def _parse_result(
        self,
        queries: List[dict],
        data_cube: DataCube,
        expression: Expression,
        model: Model,
        version='v1',
    ):
        """
        Redash caches result and returns query in the same endpoint
        So we poll this url and if jobs are ready we transform it
        """
        if len(queries) == 0:
            abort(400, message='Error with query')

        is_fetching = ReportGenerateResource._jobs_status(queries)

        if is_fetching:
            return dict(data=None, status=is_fetching, query=queries)

        if expression.is_2_splits():
            queries_2_splits = expression.get_2_splits_queries(prev_result=queries)

            queries = [self.execute_query(query, MAX_AGE, model, QUERY_ID) for query in queries_2_splits]

            is_fetching = ReportGenerateResource._jobs_status(queries)

            if is_fetching:
                return dict(data=None, status=is_fetching, query=queries)

        if version == 'v1':
            query_parser = PlywoodQueryParserV1(query_result=queries,
                                                data_cube_name=data_cube.source_name,
                                                shape=expression.shape)

        else:
            query_parser = PlywoodQueryParserV2(query_result=queries,
                                                data_cube_name=data_cube.source_name,
                                                shape=expression.shape)

        return dict(data=query_parser.parse_ply(data_cube.ply_engine),
                    status=200,
                    query=queries,
                    shape=expression.shape
                    )

    @staticmethod
    def _jobs_status(data: List[dict]) -> Union[None, int]:
        status = None

        for res in data:
            if 'job' in res:
                status = res['job']['status']

        return status

    def execute_query(self, query: str, max_age: int, model: Model, query_id: str):
        parameterized_query = ParameterizedQuery(query, org=self.current_org)
        parameters = {}

        return run_query(
            parameterized_query, parameters, model.data_source, query_id, max_age
        )


# /api/reports
class ReportsListResource(BaseResource):
    @require_permission("create_report")
    def post(self):
        req = request.get_json(True)
        require_fields(req, (NAME, MODEL_ID, EXPRESSION))
        formatting = request.args.get("format", "base64")
        name, model_id, expression = req[NAME], req[MODEL_ID], req[EXPRESSION]

        model = get_object_or_404(
            Model.get_by_id_and_user, model_id, self.current_user
        )

        # decodes base64 that turnillo uses to plain json
        expression_obj = ExpressionBase64Parser.parse_base64_to_dict(expression)

        report = Report(
            name=name,
            model_id=model.id,
            user=self.current_user,
            expression=expression_obj
        )

        models.db.session.add(report)
        models.db.session.commit()

        self.record_event({
            "action": "create",
            "object_id": report.id,
            "object_type": "report",
        })

        return ReportSerializer(report, formatting=formatting).serialize()

    @require_permission("view_report")
    def get(self):
        reports = Report.get_by_user(self.current_user)

        formatting = request.args.get("format", "base64")

        ordered_results = order_results(reports)

        page = request.args.get("page", 1, type=int)
        page_size = request.args.get("page_size", 25, type=int)

        response = paginate(
            ordered_results,
            page=page,
            page_size=page_size,
            serializer=ReportSerializer,
            formatting=formatting
        )

        self.record_event({
            "action": "list",
            "object_type": "report"
        })
        return response


# /api/reports/<int:report_id>
class ReportResource(BaseResource):

    @require_permission("view_report")
    def get(self, report_id: int):
        report = get_object_or_404(Report.get_by_id, report_id)

        formatting = request.args.get("format", "base64")

        require_object_view_permission(report, self.current_user)

        self.record_event({
            "action": "view",
            "object_id": report.id,
            "object_type": "report"
        })

        return ReportSerializer(report, formatting=formatting).serialize()

    @require_permission("edit_report")
    def post(self, report_id: int):
        report_properties = request.get_json(force=True)

        formatting = request.args.get("format", "base64")

        report = get_object_or_404(Report.get_by_id, report_id)
        require_object_modify_permission(report, self.current_user)

        updates = project(
            report_properties, (NAME, MODEL_ID, EXPRESSION),
        )

        if MODEL_ID in updates:
            try:
                model = Model.get_by_id(updates[MODEL_ID])
                if model.user_id != self.current_user.id:
                    abort(403)

            except NoResultFound:
                abort(400, message=f"The Model with id {MODEL_ID} does not exists")

        if EXPRESSION in updates:
            # decodes base64 that turnillo uses to plain json
            updates[EXPRESSION] = json.loads(parser.decompressFromBase64(updates[EXPRESSION]))

        self.update_model(report, updates)

        models.db.session.commit()

        self.record_event({
            "action": "edit",
            "object_id": report.id,
            "object_type": "report"
        })

        return ReportSerializer(report, formatting=formatting).serialize()

    @require_permission("edit_report")
    def delete(self, report_id):
        report = get_object_or_404(Report.get_by_id, report_id)

        require_object_delete_permission(report, self.current_user)

        models.db.session.delete(report)
        models.db.session.commit()

        self.record_event({
            "action": "delete",
            "object_id": report.id,
            "object_type": "report",
        })

        return make_response("", 204)
