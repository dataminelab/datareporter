import json

import lzstring
from flask import request, make_response
from flask_restful import abort
from funcy import project
from sqlalchemy.orm.exc import NoResultFound
from redash import models, redis_connection
from redash.handlers.base import BaseResource, require_fields, get_object_or_404, paginate
from redash.handlers.queries import order_results
from redash.models.models import Model, Report
from redash.permissions import (
    require_permission,
    require_object_modify_permission,
    require_object_delete_permission
)
from redash.plywood.hash_manager import hash_to_result
from redash.plywood.objects.data_cube import DataCube
from redash.plywood.objects.expression import Expression, ExpressionNotSupported
from redash.plywood.parsers.filter_parser import PlywoodFilterParser
from redash.serializers.report_serializer import ReportSerializer
from redash.services.expression import ExpressionBase64Parser

HASH = "hash"
DATA_CUBE = "dataCube"
EXPRESSION = "expression"
CONTEXT = "context"
NAME = "name"
MODEL_ID = "model_id"
COLOR_1 = 'color_1'
COLOR_2 = 'color_2'

parser = lzstring.LZString()


class ReportFilter(BaseResource):
    @require_permission("view_report")
    def post(self, model_id: int):
        # req = request.get_json(True)
        # require_fields(req, (EXPRESSION,))
        # model = get_object_or_404(Model.get_by_id, model_id)
        #
        # data_cube = DataCube(model=model)
        #
        # queries = Expression.get_queries_from_prepared_expression(data_cube=data_cube, expression=req[EXPRESSION])
        #
        # queries_result = [execute_query(query, model, QUERY_ID, self.current_org) for query in queries]
        #
        # is_fetching = jobs_status(queries_result)
        # if is_fetching:
        #     return dict(data=None, status=is_fetching, query=queries_result)
        #
        # shape = Expression.get_shape_from_prepared_expression(data_cube=data_cube, expression=req[EXPRESSION])
        #
        # data = PlywoodFilterParser(result=queries_result, data_cube=data_cube, shape=shape)

        # return dict(data=data.get_plywood_value(), status=200, query=queries_result)

        return dict()


class ReportGenerateResource(BaseResource):
    @require_permission("generate_report")
    def post(self, model_id):

        req = request.get_json(True)

        require_fields(req, (HASH,))
        hash_string = req[HASH]

        model = get_object_or_404(Model.get_by_id, model_id)

        try:
            return hash_to_result(hash_string=hash_string, model=model, organisation=self.current_org)

        except ExpressionNotSupported as e:
            abort(400, message=e.message)


# /api/reports
class ReportsListResource(BaseResource):
    @require_permission("create_report")
    def post(self):
        req = request.get_json(True)
        require_fields(req, (NAME, MODEL_ID, EXPRESSION, COLOR_1, COLOR_2))

        formatting = request.args.get("format", "base64")
        name, model_id, expression = req[NAME], req[MODEL_ID], req[EXPRESSION]
        color_1, color_2 = req.get(COLOR_1, 'color'), req.get(COLOR_2, 'color')

        model = get_object_or_404(Model.get_by_id_and_user, model_id, self.current_user)

        expression_obj = ExpressionBase64Parser.parse_base64_to_dict(expression)

        report = Report(
            name=name,
            model_id=model.id,
            user=self.current_user,
            expression=expression_obj,
            color_1=color_1,
            color_2=color_2,
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
        report: Report = get_object_or_404(Report.get_by_id, report_id)

        self.record_event({
            "action": "view",
            "object_id": report.id,
            "object_type": "report"
        })
        return hash_to_result(hash_string=report.hash, model=report.model, organisation=self.current_org)

    @require_permission("edit_report")
    def post(self, report_id: int):
        report_properties = request.get_json(force=True)

        formatting = request.args.get("format", "base64")

        report = get_object_or_404(Report.get_by_id, report_id)
        require_object_modify_permission(report, self.current_user)

        updates = project(report_properties, (NAME, MODEL_ID, EXPRESSION, COLOR_1, COLOR_2))

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
