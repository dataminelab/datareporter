import json
import logging

import requests

from redash.plywood.objects.report_serializer import ReportSerializer
from redash.plywood.parsers.query_parser_v2 import PlywoodQueryParserV2

logger = logging.getLogger(__name__)
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


def handle_json_data_source(hash_string, data_cube, expression, model, expression_queries=None) -> ReportSerializer:  # noqa: C901
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
