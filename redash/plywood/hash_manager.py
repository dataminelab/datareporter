import hashlib
import json
import logging
from typing import List, Union

import lzstring
import requests
from flask import url_for
from flask_restful import abort

from redash import redis_connection
from redash.handlers.base import get_object_or_404
from redash.handlers.query_results import run_query
from redash.models import (
    ApiKey,
    Organization,
    ParameterizedQuery,
    QueryResult,
    Report,
    User,
)
from redash.models.models import Model
from redash.plywood.objects.data_cube import DataCube
from redash.plywood.objects.expression import Expression
from redash.plywood.objects.report_serializer import ReportSerializer
from redash.plywood.parsers.filter_parser import PlywoodFilterParser
from redash.plywood.parsers.query_parser_v2 import PlywoodQueryParserV2
from redash.serializers import serialize_job
from redash.services.expression import ExpressionBase64Parser
from redash.tasks import Job

logger = logging.getLogger(__name__)

PLYWOOD_PREFIX = "PLYWOOD_QUERIES"
MAX_AGE = 800
REDASH_QUERY_CACHE = 0
parser = lzstring.LZString()
QUERY_ID = "adhoc"

SUCCESS_CODE = 3
FAILED_QUERY_CODE = 4


def replace_item(obj, value, replace_value):
    for k, v in obj.items():
        if isinstance(v, dict):
            replace_item(v, value, replace_value)

    for k, v in obj.items():
        if isinstance(v, str):
            if v == value:
                obj[k] = replace_value

    return obj


def clean_json_array_string(value):
    """
    Clean up JSON array strings like '["William Wyler"]' to 'William Wyler'.
    Handles multiple values by joining them with ', '.
    """
    if not isinstance(value, str):
        return value

    stripped = value.strip()
    if stripped.startswith("[") and stripped.endswith("]"):
        try:
            parsed = json.loads(stripped)
            if isinstance(parsed, list):
                cleaned_items = [str(item) for item in parsed if item is not None]
                return ", ".join(cleaned_items) if cleaned_items else None
        except (json.JSONDecodeError, ValueError):
            pass

    return value


def clean_row_values(row):
    """
    Clean all string values in a row that might be JSON arrays.
    """
    if not isinstance(row, dict):
        return row

    cleaned = {}
    for key, value in row.items():
        cleaned[key] = clean_json_array_string(value)

    return cleaned


def execute_query(query, model, query_id, org):
    parameterized_query = ParameterizedQuery(query, org=org)
    parameters = {}
    should_apply_auto_limit = False
    return run_query(
        parameterized_query, parameters, model.data_source, query_id, should_apply_auto_limit, REDASH_QUERY_CACHE
    )


def parse_job(job_id: str, current_org: Organization):
    job_data = serialize_job(Job.fetch(job_id))

    if job_data["job"]["status"] == SUCCESS_CODE:
        query_result_id = job_data["job"]["query_result_id"]
        query_result = get_object_or_404(QueryResult.get_by_id_and_org, query_result_id, current_org)
        return dict(query_result=query_result.to_dict())

    return job_data


def cache_or_get(hash_string: str, queries: list, current_org: Organization, model: Model, split: int = 1):
    smaller_hash = hashlib.md5(hash_string.encode("utf-8")).hexdigest()
    key = PLYWOOD_PREFIX + smaller_hash + str(split)
    exists = redis_connection.exists(key)

    if exists:
        data = redis_connection.get(key)
        return [parse_job(job_id, current_org) for job_id in json.loads(data)]
    else:
        queries_result = [execute_query(query, model, QUERY_ID, current_org) for query in queries]
        job_ids = [q["job"]["id"] for q in queries_result]

        redis_connection.setex(key, MAX_AGE, json.dumps(job_ids))

        return cache_or_get(hash_string, queries, current_org, model, split)


def clear_cache(hash_string: str, split: int = 1):
    smaller_hash = hashlib.md5(hash_string.encode("utf-8")).hexdigest()
    key = PLYWOOD_PREFIX + smaller_hash + str(split)
    exists = redis_connection.exists(key)
    if exists:
        redis_connection.delete(key)


def clear_cache_and_get(hash_string: str, queries: list, current_org, model: Model, split: int = 1):
    clear_cache(hash_string, split)
    return cache_or_get(hash_string, queries, current_org, model, split)


def has_pending(array: List[dict]) -> bool:
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
        if "job" in res:
            all_statuses.append(res["job"]["status"])

    if len(all_statuses) == 0:
        return None

    if has_pending(all_statuses):
        return 1

    return None


def extract_measure_name_from_expression(expression_filter: dict) -> str:
    """
    Extract the measure name from the expression filter.
    """
    applies = expression_filter.get("applies", [])
    if applies and len(applies) > 0:
        first_apply = applies[0]
        if isinstance(first_apply, dict) and "name" in first_apply:
            return first_apply["name"]

    return "count"


def handle_json_data_source(hash_string, data_cube, expression, model, expression_queries=None):  # noqa: C901
    """
    Handle JSON data sources for parse_result.
    """
    logger.info(f"Expression filter keys: {list(expression.filter.keys())}")
    logger.info(f"Expression filter series: {expression.filter.get('series', [])}")

    # For JSON data sources, fetch data directly from the API
    response = requests.get(model.data_source.options.get("base_url"), verify=False)
    json_data = response.json()

    def flatten_dict(d, parent_key="", sep="_"):
        items = []
        for k, v in d.items():
            new_key = f"{parent_key}{sep}{k}" if parent_key else k
            if isinstance(v, dict):
                items.extend(flatten_dict(v, new_key, sep=sep).items())
            else:
                items.append((new_key, v))
        return dict(items)

    # Flatten all rows to handle nested JSON structures
    flattened_rows = [flatten_dict(row) for row in json_data] if isinstance(json_data, list) else []

    # Clean up JSON array strings in the flattened data
    flattened_rows = [clean_row_values(row) for row in flattened_rows]

    # Extract split configuration from the expression
    splits = expression.filter.get("splits", [])

    # Extract the measure name from the expression
    series = expression.filter.get("series", [])
    if series and len(series) > 0:
        first_series = series[0]
        if isinstance(first_series, dict) and "reference" in first_series:
            measure_name = first_series["reference"]
        elif isinstance(first_series, str):
            measure_name = first_series
        else:
            measure_name = "count"
    else:
        measure_name = expression.measure_name

    logger.info(f"Measure name: {measure_name}")
    logger.info(f"Series from filter: {series}")

    # Extract dimension names from split dictionaries
    split_dimensions = []
    for split in splits:
        if isinstance(split, dict) and "dimension" in split:
            split_dimensions.append(split["dimension"])

    if len(split_dimensions) == 0:
        # Case 1: No splits - return simple total
        total_value = len(flattened_rows)
        queries = [
            {
                "query_result": {
                    "data": {
                        "columns": [{"name": "__VALUE__", "friendly_name": "__VALUE__", "type": "integer"}],
                        "rows": [{"__VALUE__": total_value}],
                    },
                    "data_source_id": model.data_source.id,
                    "id": None,
                    "query": "",
                    "query_hash": hash_string,
                    "retrieved_at": None,
                    "runtime": 0,
                }
            }
        ]

    elif len(split_dimensions) == 1:
        # Case 2: Single split - return 2 queries (total + grouped)
        split_column = split_dimensions[0]
        measure = measure_name

        # Find the actual column name in the data (case-insensitive match)
        actual_column = split_column
        if flattened_rows:
            for key in flattened_rows[0].keys():
                if key.lower() == split_column.lower():
                    actual_column = key
                    break

        logger.info(f"Single split: {split_column} -> {actual_column}, measure={measure}")

        from collections import defaultdict

        groups = defaultdict(int)
        for row in flattened_rows:
            key = row.get(actual_column)
            if key is None or key == "" or key == "null" or key == "undefined":
                continue
            if isinstance(key, (list, dict)):
                key = json.dumps(key)
            clean_key = clean_json_array_string(key)
            if clean_key and clean_key not in ("", "null", "undefined", "None"):
                groups[clean_key] += 1

        # Query 0: Total
        total_value = len(flattened_rows)
        query_0 = {
            "query_result": {
                "data": {
                    "columns": [{"name": "__VALUE__", "friendly_name": "__VALUE__", "type": "integer"}],
                    "rows": [{"__VALUE__": total_value}],
                },
                "data_source_id": model.data_source.id,
                "id": None,
                "query": "",
                "query_hash": hash_string,
                "retrieved_at": None,
                "runtime": 0,
            }
        }

        # Query 1: Grouped data
        grouped_rows = []
        for k, v in sorted(groups.items(), key=lambda x: x[1], reverse=True):
            grouped_rows.append({split_column: k, measure: v})

        query_1 = {
            "query_result": {
                "data": {
                    "columns": [
                        {"name": split_column, "friendly_name": split_column, "type": "string"},
                        {"name": measure, "friendly_name": measure, "type": "integer"},
                    ],
                    "rows": grouped_rows,
                },
                "data_source_id": model.data_source.id,
                "id": None,
                "query": "",
                "query_hash": hash_string,
                "retrieved_at": None,
                "runtime": 0,
            }
        }

        queries = [query_0, query_1]

    elif len(split_dimensions) == 2:
        # Case 3: Two splits - return 1 + 1 + N queries
        # Query 0: Total count (__VALUE__)
        # Query 1: First split grouped data
        # Query 2+: Second split grouped data for each first split value
        split_column_1 = split_dimensions[0]
        split_column_2 = split_dimensions[1]
        measure = measure_name

        # Find the actual column names in the data (case-insensitive match)
        actual_column_1 = split_column_1
        actual_column_2 = split_column_2
        if flattened_rows:
            for key in flattened_rows[0].keys():
                if key.lower() == split_column_1.lower():
                    actual_column_1 = key
                if key.lower() == split_column_2.lower():
                    actual_column_2 = key

        logger.info(
            f"Two splits: {split_column_1}->{actual_column_1}, {split_column_2}->{actual_column_2}, measure={measure}"
        )

        from collections import defaultdict

        # Query 0: Total aggregation (__VALUE__)
        total_value = len(flattened_rows)
        query_0 = {
            "query_result": {
                "data": {
                    "columns": [{"name": "__VALUE__", "friendly_name": "__VALUE__", "type": "integer"}],
                    "rows": [{"__VALUE__": total_value}],
                },
                "data_source_id": model.data_source.id,
                "id": None,
                "query": "",
                "query_hash": hash_string,
                "retrieved_at": None,
                "runtime": 0,
            }
        }

        # Build grouped data for first split
        groups_level_1 = defaultdict(lambda: {"count": 0, "nested": defaultdict(int)})

        for row in flattened_rows:
            key_1 = row.get(actual_column_1)
            key_2 = row.get(actual_column_2)

            # Skip if first key is None/empty/undefined
            if key_1 is None or key_1 == "" or key_1 == "null" or key_1 == "undefined":
                continue

            if isinstance(key_1, (list, dict)):
                key_1 = json.dumps(key_1)

            # Clean key_1
            clean_key_1 = clean_json_array_string(key_1)
            if not clean_key_1 or clean_key_1 in ("", "null", "undefined", "None"):
                continue

            groups_level_1[clean_key_1]["count"] += 1

            # Track nested grouping for second split
            if key_2 is not None and key_2 != "" and key_2 != "null" and key_2 != "undefined":
                if isinstance(key_2, (list, dict)):
                    key_2 = json.dumps(key_2)
                clean_key_2 = clean_json_array_string(key_2)
                if clean_key_2 and clean_key_2 not in ("", "null", "undefined", "None"):
                    groups_level_1[clean_key_1]["nested"][clean_key_2] += 1

        # Query 1: First split grouped data
        grouped_rows_level_1 = []
        sorted_keys = sorted(groups_level_1.keys(), key=lambda k: groups_level_1[k]["count"], reverse=True)

        for k1 in sorted_keys:
            grouped_rows_level_1.append({split_column_1: k1, measure: groups_level_1[k1]["count"]})

        logger.info(f"First split grouped rows count: {len(grouped_rows_level_1)}")

        query_1 = {
            "query_result": {
                "data": {
                    "columns": [
                        {"name": split_column_1, "friendly_name": split_column_1, "type": "string"},
                        {"name": measure, "friendly_name": measure, "type": "integer"},
                    ],
                    "rows": grouped_rows_level_1,
                },
                "data_source_id": model.data_source.id,
                "id": None,
                "query": "",
                "query_hash": hash_string,
                "retrieved_at": None,
                "runtime": 0,
            }
        }

        queries = [query_0, query_1]

        # Query 2+: Second split grouped data for each first split value
        for k1 in sorted_keys:
            nested_data = groups_level_1[k1]["nested"]
            grouped_rows_level_2 = []

            for k2, count in sorted(nested_data.items(), key=lambda x: x[1], reverse=True):
                grouped_rows_level_2.append({split_column_2: k2, measure: count})

            query_n = {
                "query_result": {
                    "data": {
                        "columns": [
                            {"name": split_column_2, "friendly_name": split_column_2, "type": "string"},
                            {"name": measure, "friendly_name": measure, "type": "integer"},
                        ],
                        "rows": grouped_rows_level_2,
                    },
                    "data_source_id": model.data_source.id,
                    "id": None,
                    "query": f"WHERE {split_column_1} = '{k1}'",
                    "query_hash": hash_string,
                    "retrieved_at": None,
                    "runtime": 0,
                }
            }
            queries.append(query_n)

        logger.info(
            f"Total queries for 2-split: {len(queries)} (1 total + 1 first split + {len(sorted_keys)} second splits)"
        )

    else:
        # Case 4: More than 2 splits - not supported, fall back to first 2
        logger.warning(f"More than 2 splits not supported, using first 2: {split_dimensions[:2]}")
        # Could recursively call with first 2 splits or return error
        queries = []

    # Parse and return immediately for JSON sources
    query_parser = PlywoodQueryParserV2(
        query_result=queries,
        data_cube_name=data_cube.source_name,
        shape=expression.shape,
        visualization=expression.visualization,
        data_cube=data_cube,
    )

    data = query_parser.parse_ply(data_cube.ply_engine)
    meta = data_cube.get_meta(queries)

    return ReportSerializer(
        queries=queries,
        data=data,
        meta=meta,
        shape=expression.shape,
        expression_queries=expression_queries,
    )


def parse_result(
    hash_string: str,
    queries: List[dict],
    data_cube: DataCube,
    expression: Expression,
    model: Model,
    current_org: Organization,
    expression_queries: List[dict] = None,
) -> ReportSerializer:
    """
    Redash caches result and returns query in the same endpoint
    So we poll this url and if jobs are ready we transform it
    """

    if data_cube.ply_engine in ["json"]:
        return handle_json_data_source(
            hash_string=hash_string,
            data_cube=data_cube,
            expression=expression,
            model=model,
            expression_queries=expression_queries,
        )

    # Below: Handle SQL-based data sources (existing logic)
    elif len(queries) == 0:
        abort(400, message="Error with query")

    is_fetching = jobs_status(queries)
    if is_fetching:
        return ReportSerializer(
            status=is_fetching,
            queries=queries,
        )
    errored = clean_errored(queries)
    if errored:
        clear_cache(hash_string)
        return ReportSerializer(
            status=is_fetching,
            queries=[],
        )

    split = len(expression.filter["splits"]) or 1

    if split == 2:
        queries_2_splits = expression.get_2_splits_queries(prev_result=queries)
        queries = cache_or_get(hash_string, queries_2_splits, current_org, model, split)
        errored = clean_errored(queries)
        if errored:
            clear_cache(hash_string, split)
            return ReportSerializer(status=is_fetching, queries=[])
        is_fetching = jobs_status(queries)
        if is_fetching:
            return ReportSerializer(status=is_fetching, queries=queries)

    query_parser = PlywoodQueryParserV2(
        query_result=queries,
        data_cube_name=data_cube.source_name,
        shape=expression.shape,
        visualization=expression.visualization,
        data_cube=data_cube,
    )

    data = query_parser.parse_ply(data_cube.ply_engine)
    meta = data_cube.get_meta(queries)

    serializer = ReportSerializer(
        queries=queries,
        data=data,
        meta=meta,
        shape=expression.shape,
        expression_queries=expression_queries,
    )

    return serializer


def clean_errored(queries: list) -> list:
    errored = []

    for index, query in enumerate(queries):
        if "job" in query and query["job"]["status"] == FAILED_QUERY_CODE:
            errored.append(index)

    return errored


def get_data_cube(model: Model) -> DataCube:
    data_cube = DataCube(model)
    return data_cube


def is_admin(user) -> bool:
    if "admin" in user.permissions or "super_admin" in user.permissions or "edit_report" in user.permissions:
        return True
    return False


class ReportHash:
    def __init__(self, o: Report):
        self.version = "1.26.0-beta.1"
        self.appSettings = {
            "dataCubes": [],
            "customization": {
                "urlShortener": "return request.get('http://tinyurl.com/api-create.php?url=' + encodeURIComponent(url))"
            },
            "clusters": [],
        }
        self.is_favorite = o.is_favorite_v2(o.user, o)
        public_key = ApiKey.get_by_object(o)
        self.api_key = o.api_key
        if public_key:
            self.public_url = url_for("public.public", token=public_key.api_key, _external=True)
        else:
            self.public_url = None
        self.id = o.id
        self.is_archived = o.is_archived
        self.color_1 = o.color_1
        self.color_2 = o.color_2
        self.hash = o.hash
        self.name = o.name
        self.model_id = o.model_id
        self.data_source_id = o.model.data_source.id
        self.report = ""
        self.schedule = None
        self.tags = o.tags
        self.user = {
            "id": o.user.id,
            "name": o.user.name,
            "org_id": o.user.org_id,
            "profile_image_url": o.user.profile_image_url,
            "permissions": o.user.permissions,
            "isAdmin": is_admin(o.user),
        }
        self.landed = True
        self.can_edit = None
        self.queries = []
        self.last_modified_by_id = o.last_modified_by_id
        self.last_modified_by = User.get_by_id(o.last_modified_by_id).to_dict()
        self.results = None

    def set_data_cube(self, data_cube: DataCube):
        self.appSettings["dataCubes"].append(data_cube)

    def set(self, key, value):
        setattr(self, key, value)

    def set_results(self):
        model = Model.get_by_id(self.model_id)
        org = Organization.get_by_id(self.user["org_id"])
        self.results = hash_to_result(self.hash, model, org).serialized()

    def get_results(self):
        if not self.results:
            self.set_results()
        return self.results

    def to_json(self):
        obj = {}
        for key, value in self.__dict__.items():
            obj[key] = value
        return obj

    def to_dict(self):
        return self.to_json()

    def set_from_dict(self, obj):
        for key, value in obj.items():
            setattr(self, key, value)
        return self

    def set_data_cube_from_dict(self, obj):
        self.set_from_dict(obj)
        data_cube = DataCube(obj)
        self.set_data_cube(data_cube)
        return self


def hash_report(o: dict, can_edit: bool, get_results: bool = False):
    data_cube = get_data_cube(o.model)
    report = ReportHash(o)
    report.set_data_cube(data_cube.data_cube)
    report.set("source_name", data_cube.source_name)
    report.set("can_edit", can_edit)
    if get_results:
        report.set_results()
    return report.to_dict()


def hash_to_result(hash_string: str, model: Model, organisation, bypass_cache: bool = False):
    data_cube = get_data_cube(model)
    expression = Expression(hash_string, data_cube)
    if bypass_cache:
        queries_result = clear_cache_and_get(
            hash_string,
            expression.queries,
            organisation,
            model,
        )
    else:
        queries_result = cache_or_get(
            hash_string,
            expression.queries,
            organisation,
            model,
        )

    return parse_result(hash_string, queries_result, data_cube, expression, model, organisation, expression.queries)


def filter_expression_to_result(expression: dict, model: Model, organisation: Organization) -> ReportSerializer:
    data_cube = DataCube(model=model)
    expression = replace_item(expression, "main", data_cube.source_name)

    queries = Expression.get_queries_from_prepared_expression(data_cube, expression)

    queries_result = cache_or_get(
        hash_string=ExpressionBase64Parser.parse_dict_to_base64(expression),
        queries=queries,
        current_org=organisation,
        model=model,
    )

    is_fetching = jobs_status(queries_result)

    if is_fetching:
        return ReportSerializer(status=is_fetching, queries=queries_result)

    shape = Expression.get_shape_from_prepared_expression(data_cube, expression)

    data = PlywoodFilterParser(queries_result, data_cube, shape)

    return ReportSerializer(
        data=data.get_plywood_value(),
        queries=queries_result,
    )
