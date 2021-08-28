import hashlib
from typing import List, Union

import lzstring
import json
from flask import request, make_response
from flask_restful import abort
from funcy import project
from sqlalchemy.orm.exc import NoResultFound
from redash import models, redis_connection
from redash.handlers.base import BaseResource, require_fields, get_object_or_404, paginate
from redash.handlers.queries import order_results
from redash.handlers.query_results import run_query
from redash.models import ParameterizedQuery
from redash.models.models import Model, Report
from redash.permissions import (
    require_permission,
    require_object_view_permission,
    require_object_modify_permission,
    require_object_delete_permission
)
from redash.plywood.objects.data_cube import DataCube
from redash.plywood.objects.expression import Expression, ExpressionNotSupported
from redash.plywood.parsers.filter_parser import PlywoodFilterParser
from redash.plywood.parsers.query_parser_v2 import PlywoodQueryParserV2
from redash.serializers.report_serializer import ReportSerializer
from redash.services.expression import ExpressionBase64Parser
from redash.tasks import Job

from redash.serializers import (
    serialize_job
)

CONTEXT = "context"
DATA_CUBE = "dataCube"
EXPRESSION = "expression"
HASH = "hash"
NAME = "name"
MODEL_ID = "model_id"
PLYWOOD_PREFIX = 'PLYWOOD_QUERIES'
MAX_AGE = 400
REDASH_QUERY_CACHE = 0
parser = lzstring.LZString()
QUERY_ID = 'adhoc'


def jobs_status(data: List[dict]) -> Union[None, int]:
    for res in data:
        if 'job' in res:
            return res['job']['status']


def parse_job(job_id: str, current_org):
    job_data = serialize_job(Job.fetch(job_id))

    if job_data['job']['status'] == 3:
        query_result_id = job_data['job']['query_result_id']
        query_result = get_object_or_404(models.QueryResult.get_by_id_and_org, query_result_id, current_org)
        return dict(query_result=query_result.to_dict())

    return job_data


def cache_or_get(hash_string: str, queries: list, current_org, model: Model, split: int = 1):
    smaller_hash = hashlib.md5(hash_string.encode('utf-8')).hexdigest()
    key = PLYWOOD_PREFIX + smaller_hash + str(split)
    exists = redis_connection.exists(key)

    if exists:
        data = redis_connection.get(key)
        return [parse_job(job_id, current_org) for job_id in json.loads(data)]
    else:

        queries_result = [execute_query(query, model, QUERY_ID, current_org) for query in queries]
        print("QUERY RESULT", queries_result)
        job_ids = [q['job']['id'] for q in queries_result]

        redis_connection.setex(key, MAX_AGE, json.dumps(job_ids))

        return cache_or_get(hash_string=hash_string, queries=queries, current_org=current_org, model=model, split=split)


def execute_query(query, model, query_id, org):
    parameterized_query = ParameterizedQuery(query, org=org)
    parameters = {}

    return run_query(parameterized_query, parameters, model.data_source, query_id, REDASH_QUERY_CACHE)


class ReportFilter(BaseResource):
    @require_permission("view_report")
    def post(self, model_id: int):
        req = request.get_json(True)
        require_fields(req, (EXPRESSION,))
        model = get_object_or_404(Model.get_by_id, model_id)

        data_cube = DataCube(model=model)

        queries = Expression.get_queries_from_prepared_expression(data_cube=data_cube, expression=req[EXPRESSION])

        queries_result = [execute_query(query, model, QUERY_ID, self.current_org) for query in queries]

        is_fetching = jobs_status(queries_result)

        if is_fetching:
            return dict(data=None, status=is_fetching, query=queries_result)

        shape = Expression.get_shape_from_prepared_expression(data_cube=data_cube, expression=req[EXPRESSION])

        data = PlywoodFilterParser(result=queries_result, data_cube=data_cube, shape=shape)

        return dict(data=data.get_plywood_value(), status=200, query=queries_result)


class ReportGenerateResource(BaseResource):
    @require_permission("generate_report")
    def post(self, model_id):

        req = request.get_json(True)

        require_fields(req, (HASH,))
        hash_string = req[HASH]

        model = get_object_or_404(Model.get_by_id, model_id)

        try:
            data_cube = DataCube(model=model)
            expression = Expression(hash=hash_string, data_cube=data_cube)

            queries_result = cache_or_get(hash_string=hash_string,
                                          queries=expression.queries,
                                          current_org=self.current_org,
                                          model=model,
                                          )

            return self._parse_result(
                hash_string=hash_string,
                queries=queries_result,
                data_cube=data_cube,
                expression=expression,
                model=model,
            )

        except ExpressionNotSupported as e:
            abort(400, message=e.message)

    def _parse_result(
        self,
        hash_string: str,
        queries: List[dict],
        data_cube: DataCube,
        expression: Expression,
        model: Model,
    ):
        """
        Redash caches result and returns query in the same endpoint
        So we poll this url and if jobs are ready we transform it
        """
        if len(queries) == 0:
            abort(400, message='Error with query')

        is_fetching = jobs_status(queries)

        if is_fetching:
            return dict(data=None, status=is_fetching, query=queries)

        if expression.is_2_splits():
            queries_2_splits = expression.get_2_splits_queries(prev_result=queries)
            queries = cache_or_get(hash_string=hash_string,
                                   queries=queries_2_splits,
                                   current_org=self.current_org,
                                   model=model,
                                   split=2
                                   )

            is_fetching = jobs_status(queries)

            if is_fetching:
                return dict(data=None, status=is_fetching, query=queries)

        query_parser = PlywoodQueryParserV2(query_result=queries,
                                            data_cube_name=data_cube.source_name,
                                            shape=expression.shape)

        return dict(data=query_parser.parse_ply(data_cube.ply_engine),
                    status=200,
                    query=queries,
                    shape=expression.shape)


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
