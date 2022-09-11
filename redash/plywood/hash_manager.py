import hashlib
import json
from typing import List, Union

import lzstring
from flask_restful import abort

from redash.handlers.base import get_object_or_404
from redash.handlers.query_results import run_query
from redash.models import ParameterizedQuery
from redash.models.models import Model
from redash.plywood.objects.data_cube import DataCube
from redash.plywood.objects.expression import Expression
from redash import models, redis_connection
from redash.plywood.objects.report_serializer import ReportSerializer, ReportMetaData
from redash.plywood.parsers.filter_parser import PlywoodFilterParser
from redash.plywood.parsers.query_parser_v2 import PlywoodQueryParserV2
from redash.serializers import serialize_job
from redash.services.expression import ExpressionBase64Parser
from redash.tasks import Job

PLYWOOD_PREFIX = 'PLYWOOD_QUERIES'
MAX_AGE = 800
REDASH_QUERY_CACHE = 0
parser = lzstring.LZString()
QUERY_ID = 'adhoc'

SUCCESS_CODE = 3
FAILED_QUERY_CODE = 4


def replace_item(obj, value, replace_value):
    for k, v in obj.items():
        if isinstance(v, dict):
            obj[k] = replace_item(v, value, replace_value)

    for k, v in obj.items():
        if isinstance(v, str):
            if v == value:
                obj[k] = replace_value

    return obj


def execute_query(query, model, query_id, org):
    parameterized_query = ParameterizedQuery(query, org=org)
    parameters = {}

    return run_query(parameterized_query, parameters, model.data_source, query_id, REDASH_QUERY_CACHE)


def parse_job(job_id: str, current_org):
    job_data = serialize_job(Job.fetch(job_id))

    if job_data['job']['status'] == SUCCESS_CODE:
        query_result_id = job_data['job']['query_result_id']
        query_result = get_object_or_404(models.QueryResult.get_by_id_and_org, query_result_id, current_org)
        return dict(query_result=query_result.to_dict())

    return job_data


def cache_or_get(
    hash_string: str,
    queries: list,
    current_org,
    model: Model,
    split: int = 1
):
    smaller_hash = hashlib.md5(hash_string.encode('utf-8')).hexdigest()
    key = PLYWOOD_PREFIX + smaller_hash + str(split)
    exists = redis_connection.exists(key)

    if exists:
        data = redis_connection.get(key)
        return [parse_job(job_id, current_org) for job_id in json.loads(data)]
    else:
        queries_result = [execute_query(query, model, QUERY_ID, current_org) for query in queries]
        job_ids = [q['job']['id'] for q in queries_result]

        redis_connection.setex(key, MAX_AGE, json.dumps(job_ids))

        return cache_or_get(hash_string=hash_string, queries=queries, current_org=current_org, model=model, split=split)


def has_pending(array):
    if len(array) == 0:
        return False
    no_duplicates = list(set(array))
    try:
        no_duplicates.remove(FAILED_QUERY_CODE)
    except ValueError:
        pass
    if len(no_duplicates) > 0:
        return True
    return False


def jobs_status(data: List[dict]) -> Union[None, int]:
    all_statuses = []
    for res in data:
        if 'job' in res:
            all_statuses.append(res['job']['status'])

    if len(all_statuses) == 0:
        return None

    if has_pending(all_statuses):
        return 1

    return None


def parse_result(
    hash_string: str,
    queries: List[dict],
    data_cube: DataCube,
    expression: Expression,
    model: Model,
    current_org,
) -> ReportSerializer:
    """
    Redash caches result and returns query in the same endpoint
    So we poll this url and if jobs are ready we transform it
    """
    if len(queries) == 0:
        abort(400, message='Error with query')

    is_fetching = jobs_status(queries)

    if is_fetching:
        return ReportSerializer(
            status=is_fetching,
            queries=queries,
        )

    if expression.is_2_splits():
        queries_2_splits = expression.get_2_splits_queries(prev_result=queries)
        queries = cache_or_get(
            hash_string=hash_string,
            queries=queries_2_splits,
            current_org=current_org,
            model=model,
            split=2
        )

        is_fetching = jobs_status(queries)
        if is_fetching:
            return ReportSerializer(status=is_fetching, queries=queries)

    errored = clean_errored(queries)

    query_parser = PlywoodQueryParserV2(
        query_result=queries,
        data_cube_name=data_cube.source_name,
        shape=expression.shape,
        visualization=expression.visualization,
        data_cube=data_cube,
    )

    serializer = ReportSerializer(
        queries=queries,
        failed=errored,
        data=query_parser.parse_ply(data_cube.ply_engine),
        meta=data_cube.get_meta(queries),
        shape=expression.shape,
    )

    return serializer


def clean_errored(queries: list):
    errored = []

    for index, query in enumerate(queries):
        if 'job' in query:
            errored.append(query)
            del queries[index]

    return errored


def get_data_cube(model: Model):
    data_cube = DataCube(model=model)#lower_case_kind=True
    return data_cube

def hash_report(o, can_edit):
    data_cube = get_data_cube(o.model)
    result = {
        "color_1": o.color_1,
        "color_2": o.color_2,
        "hash": o.hash,
        "name": o.name,
        "model_id": o.model_id,
        "can_edit": can_edit,
        "source_name": data_cube.source_name,
        "data_source_id": o.model.data_source.id,
        "report": "",
        "schedule": None,
        "tags":[],
        "user":{
            "id": o.user.id,
            "name": o.user.name,
            "profile_image_url": o.user.profile_image_url,
            "permissions": o.user.permissions,
            "isAdmin": None,
        },
        "isJustLanded": True,
        "appSettings": {
            "dataCubes": [data_cube.data_cube],
            "customization": {},
            "clusters": [],
        },
        "id": o.id,
    }
    return result

def hash_to_result(hash_string: str, model: Model, organisation):
    data_cube = get_data_cube(model)
    expression = Expression(hash=hash_string, data_cube=data_cube)

    queries_result = cache_or_get(
        hash_string=hash_string,
        queries=expression.queries,
        current_org=organisation,
        model=model,
    )

    return parse_result(
        hash_string=hash_string,
        queries=queries_result,
        data_cube=data_cube,
        expression=expression,
        model=model,
        current_org=organisation,
    )


def filter_expression_to_result(expression: dict, model: Model, organisation):
    data_cube = DataCube(model=model)
    expression = replace_item(expression, 'main', data_cube.source_name)

    queries = Expression.get_queries_from_prepared_expression(data_cube=data_cube, expression=expression)

    queries_result = cache_or_get(
        hash_string=ExpressionBase64Parser.parse_dict_to_base64(expression),
        queries=queries,
        current_org=organisation,
        model=model,
    )

    is_fetching = jobs_status(queries_result)

    if is_fetching:
        return ReportSerializer(
            status=is_fetching,
            queries=queries_result,
        )

    shape = Expression.get_shape_from_prepared_expression(data_cube=data_cube, expression=expression)

    data = PlywoodFilterParser(result=queries_result, data_cube=data_cube, shape=shape)

    return ReportSerializer(
        data=data.get_plywood_value(),
        queries=queries_result,
    )
