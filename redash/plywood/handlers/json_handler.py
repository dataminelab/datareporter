import copy
import json
import logging
from collections import defaultdict

import pydash
import requests
from flask_restful import abort

from redash.plywood.objects.report_serializer import ReportSerializer
from redash.plywood.parsers.query_parser_v2 import (
    TYPE_MAPPING,
    PlywoodQueryParserV2,
    is_expression_object,
)

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


def flatten_dict(d, parent_key="", sep="_"):
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key, sep=sep).items())
        else:
            items.append((new_key, v))
    return dict(items)


def handle_json_data_source(  # noqa: C901
    hash_string, data_cube, expression, model, expression_queries=None
) -> ReportSerializer:
    """
    Handle JSON data sources for parse_result.
    """
    queries = []
    logger.info(f"Expression filter keys: {list(expression.filter.keys())}")
    logger.info(f"Expression filter series: {expression.filter.get('series', [])}")

    # For JSON data sources, fetch data directly from the API
    response = requests.get(model.data_source.options.get("base_url"), verify=False, timeout=30)
    json_data = response.json()

    path = model.data_source.options.get("inner_data_path")
    if path:
        json_data = pydash.get(json_data, path, [])

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
        abort(400, message="Splits greater than 2 are not supported for JSON data sources.")

    # Parse and return immediately for JSON sources
    query_parser = JsonPlywoodQueryParser(
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


class JsonPlywoodQueryParser(PlywoodQueryParserV2):
    def _build_first_split(self, shape: dict):
        split_data = shape["data"][0]["SPLIT"]
        data = self._get_first_split()

        if not data:
            logger.info("_build_first_split: No data from first split query")
            return

        split_keys = split_data.get("keys", [])
        num_queries = len(self._query_result)
        has_second_split = num_queries > 2
        logger.info(f"_build_first_split: num_queries={num_queries}, has_second_split={has_second_split}")

        nested_split_template = self._get_nested_split_template(split_data, has_second_split)
        query_index = self._get_first_split_query_index()
        sample = self._create_sample(query_index, nested_split_template)

        split_data["data"] = self._build_split_data(data, sample, nested_split_template)
        logger.info(f"_build_first_split: Built {len(split_data['data'])} rows in split_data")

        self._update_split_attributes(split_data, data, query_index, nested_split_template)

        if not split_data.get("keys") and split_keys:
            split_data["keys"] = split_keys

    def _get_nested_split_template(self, split_data, has_second_split):
        nested_split_template = None
        if has_second_split:
            # Try to extract from the shape first
            if split_data.get("data") and len(split_data["data"]) > 0:
                first_item = split_data["data"][0]
                if "SPLIT" in first_item:
                    nested_split = first_item.get("SPLIT", {})
                    if isinstance(nested_split, dict) and not is_expression_object(nested_split):
                        if nested_split.get("keys") or nested_split.get("attributes"):
                            nested_split_template = {
                                "keys": nested_split.get("keys", []),
                                "attributes": nested_split.get("attributes", []),
                                "data": [],
                                "type": "DATASET",
                            }
                            logger.info("_build_first_split: Found nested_split_template from shape")
            # If we couldn't extract from shape, create from the second split query
            if not nested_split_template and len(self._query_result) > 2:
                second_split_query = self._query_result[2]
                if second_split_query and "query_result" in second_split_query:
                    columns = second_split_query["query_result"]["data"].get("columns", [])
                    if columns:
                        second_split_keys = [columns[0]["name"]]
                        second_split_attrs = []
                        for col in columns:
                            col_type = col.get("type", "string")
                            ply_type = TYPE_MAPPING.get(col_type, "STRING")
                            second_split_attrs.append({"name": col["name"], "type": ply_type})
                        nested_split_template = {
                            "keys": second_split_keys,
                            "attributes": second_split_attrs,
                            "data": [],
                            "type": "DATASET",
                        }
                        logger.info("_build_first_split: Created nested_split_template from query")
        return nested_split_template

    def _create_sample(self, query_index, nested_split_template):
        sample = {}
        if len(self._query_result) > query_index:
            columns = self._query_result[query_index]["query_result"]["data"]["columns"]
            for col in columns:
                col_name = col["name"]
                col_type = col.get("type", "string")
                if col_type in ["integer", "float", "number"]:
                    sample[col_name] = 0
                elif col_type == "boolean":
                    sample[col_name] = False
                else:
                    sample[col_name] = ""
        if nested_split_template:
            sample["SPLIT"] = copy.deepcopy(nested_split_template)
        return sample

    def _build_split_data(self, data, sample, nested_split_template):
        split_data_list = []
        for value in data:
            sample_copy = copy.deepcopy(sample)
            sample_copy.update(value)
            # Only process SPLIT if we have a template (2-split case)
            if "SPLIT" in sample_copy and is_expression_object(sample_copy["SPLIT"]):
                if nested_split_template:
                    sample_copy["SPLIT"] = copy.deepcopy(nested_split_template)
                else:
                    del sample_copy["SPLIT"]
            split_data_list.append(sample_copy)
        return split_data_list

    def _update_split_attributes(self, split_data, data, query_index, nested_split_template):
        if data and len(self._query_result) > query_index:
            columns = self._query_result[query_index]["query_result"]["data"]["columns"]
            split_data["attributes"] = []
            for col in columns:
                col_name = col["name"]
                col_type = col.get("type", "string")
                ply_type = TYPE_MAPPING.get(col_type, "STRING")
                split_data["attributes"].append({"name": col_name, "type": ply_type})
            # Only add SPLIT attribute for 2-split queries
            if nested_split_template:
                split_data["attributes"].append({"name": "SPLIT", "type": "DATASET"})

    def _build_second_split(self, shape: dict):
        split = shape["data"][0]["SPLIT"]

        if not split.get("keys") or not split.get("data"):
            logger.info("_build_second_split: No keys or data in first split")
            return

        column_name = pydash.head(split["keys"])
        second_split_start = self._get_second_split_start_index()

        logger.info(f"_build_second_split: column_name={column_name}, second_split_start={second_split_start}")
        logger.info(f"_build_second_split: Total queries={len(self._query_result)}")

        # Get second split queries (skip the first split query/queries)
        second_split_queries = self._query_result[second_split_start:]

        logger.info(f"_build_second_split: Second split queries count={len(second_split_queries)}")

        if not second_split_queries:
            logger.info("_build_second_split: No second split queries available")
            return

        # Get second split keys and attributes from the first second-split query
        second_split_keys = []
        second_split_attributes = []

        if second_split_queries and second_split_queries[0]["query_result"]["data"]["columns"]:
            query_columns = second_split_queries[0]["query_result"]["data"]["columns"]
            second_split_keys = [query_columns[0]["name"]]
            for col in query_columns:
                col_name = col["name"]
                col_type = col.get("type", "string")
                ply_type = TYPE_MAPPING.get(col_type, "STRING")
                second_split_attributes.append({"name": col_name, "type": ply_type})

        logger.info(f"_build_second_split: second_split_keys={second_split_keys}")

        # For JSON sources, the second split queries are in order matching the first split data
        if self._is_json_source:
            for index, value in enumerate(split["data"]):
                if index < len(second_split_queries):
                    query_data = second_split_queries[index]["query_result"]["data"]["rows"]
                    logger.info(f"_build_second_split: Setting SPLIT for index {index} with {len(query_data)} rows")
                    split["data"][index]["SPLIT"] = {
                        "keys": second_split_keys,
                        "data": query_data,
                        "attributes": second_split_attributes,
                        "type": "DATASET",
                    }
                else:
                    logger.info(f"_build_second_split: No query for index {index}, setting empty SPLIT")
                    split["data"][index]["SPLIT"] = {
                        "keys": second_split_keys,
                        "data": [],
                        "attributes": second_split_attributes,
                        "type": "DATASET",
                    }

                if self._visualization == "line-chart":
                    self._prepare_line_chart(shape=shape, top_index=index)
        else:
            # For SQL sources, match by query WHERE clause
            for value in split["data"]:
                if column_name not in value:
                    continue

                search_value = value[column_name]
                search_column_name = self.null if search_value is None else f"'{search_value}'"

                # Try different query matching strategies
                query = pydash.find(
                    second_split_queries,
                    lambda v: f'"{search_column_name[1:-1]}"' in v["query_result"].get("query", ""),
                )
                if query is None:
                    query = pydash.find(
                        second_split_queries, lambda v: search_column_name[1:-1] in v["query_result"].get("query", "")
                    )

                if query is None:
                    value["SPLIT"] = {
                        "keys": second_split_keys,
                        "data": [],
                        "attributes": second_split_attributes,
                        "type": "DATASET",
                    }
                    continue

                index = pydash.find_index(split["data"], lambda v: v.get(column_name) == search_value)
                if index == -1:
                    continue

                query_data = query["query_result"]["data"]["rows"]
                split["data"][index]["SPLIT"] = {
                    "keys": second_split_keys,
                    "data": query_data,
                    "attributes": second_split_attributes,
                    "type": "DATASET",
                }

                if self._visualization == "line-chart":
                    self._prepare_line_chart(shape=shape, top_index=index)
