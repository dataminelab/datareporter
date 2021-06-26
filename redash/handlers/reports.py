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
from redash.plywood.plywood import PlywoodApi
from redash.serializers.report_serializer import ReportSerializer
from redash.services.expression import ExpressionBase64Parser
from redash.plywood.query_parser import PlywoodQueryParser

CONTEXT = "context"
DATA_CUBE = "dataCube"
EXPRESSION = "expression"
HASH = "hash"
NAME = "name"
MODEL_ID = "model_id"

MAX_AGE = 60

parser = lzstring.LZString()


def lower_kind(obj: dict):
    for v in obj['dimensions']:
        if 'kind' in v:
            v['kind'] = v['kind'].lower()


class ReportGenerateResource(BaseResource):
    @require_permission("generate_report")
    def post(self, model_id):
        req = request.get_json(True)

        model = get_object_or_404(Model.get_by_id, model_id)
        plywood_request = self._build_plywood_request(req, model)
        queries = PlywoodApi.convert_to_sql(body=plywood_request)

        max_age = req.get("max_age", MAX_AGE)
        query_id = "adhoc"

        queries_result = [self.execute_query(query, max_age, model, query_id) for query in queries]

        return self._parse_result(queries_result, req, model)

    @staticmethod
    def _jobs_status(data: List[dict]) -> Union[None, int]:
        status = None

        for res in data:
            if 'job' in res:
                status = res['job']['status']

        return status

    def _get_shape(self, req, model: Model):
        req = self._build_plywood_request(req=req, model=model)
        shape = PlywoodApi.get_shape(req)
        return shape['shape']

    def _parse_result(self, data: List[dict], req, model: Model):
        """
        Redash caches result, after second+ request it will be possible
        to get result from cache it, parse and return full data
        """
        if len(data) == 0:
            abort(400, message='Error with query')

        is_fetching = ReportGenerateResource._jobs_status(data)

        if is_fetching:
            return dict(data=None, status=is_fetching, query=data)

        context = ReportGenerateResource._build_context(model)
        shape = self._get_shape(req=req, model=model)
        query_parser = PlywoodQueryParser(query_result=data, data_cube_name=context.get('source', 'main'), shape=shape)

        res = query_parser.parse_ply(ReportGenerateResource._get_ply_engine(model))

        return dict(data=res, status=200, query=data, shape=shape)

    def execute_query(self, query: str, max_age: int, model: Model, query_id: str):
        parameterized_query = ParameterizedQuery(query, org=self.current_org)
        parameters = {}

        return run_query(
            parameterized_query, parameters, model.data_source, query_id, max_age
        )

    @staticmethod
    def _get_expression_from_req(req, model: Model):
        config = yaml.load(model.config.content, Loader=yaml.FullLoader)

        data_cube = next(iter(config["dataCubes"]), None)

        lower_kind(data_cube)
        expression = req.get(EXPRESSION, None)
        hash_string = req.get(HASH, None)

        if expression and hash_string:
            abort(400, message=f"Expression and hash both were passed, only one is allowed")

        if not expression and not hash_string:
            abort(400, message=f"Expression or hash was not passed. Please send expression or hash.")

        if hash_string:
            expression = PlywoodApi.convert_hash_to_expression(hash=hash_string, data_cube=data_cube)

        return expression

    @staticmethod
    def _get_ply_engine(model: Model):
        return PlywoodApi.convert_redash_db_type_to_plywood_engine(ReportGenerateResource._get_engine(model))

    @staticmethod
    def _build_plywood_request(req, model: Model):
        context = ReportGenerateResource._build_context(model)
        real_ex = ReportGenerateResource._get_expression_from_req(req, model)

        return {
            DATA_CUBE: context.get('source', 'main'),
            CONTEXT: context,
            EXPRESSION: real_ex
        }

    @staticmethod
    def _build_context(model: Model):
        return {
            "engine": ReportGenerateResource._get_ply_engine(model),
            "source": ReportGenerateResource._get_source_name(model),
            "attributes": ReportGenerateResource._get_table_columns(model)
        }

    @staticmethod
    def _get_source_name(model: Model):
        return model.table

    @staticmethod
    def _get_table_columns(model: Model):
        config = yaml.load(model.config.content)
        data_cube = next(iter(config["dataCubes"]), None)
        attributes = data_cube["attributes"] if data_cube else []
        return attributes

    @staticmethod
    def _get_engine(model):
        return model.data_source.type


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
