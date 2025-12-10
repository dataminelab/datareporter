import calendar
import copy
import datetime
import logging
from typing import List

import pydash
from dateutil import parser

from redash.plywood.objects.data_cube import DataCube
from redash.plywood.objects.expression import ExpressionNotSupported
from redash.plywood.objects.plywood_value import PlywoodValue

SYSTEM_FIELDS = ("MillisecondsInInterval", "SPLIT")
TIME_SHIFT_ATTRS = "_delta__"
SUPPORTED_ENGINES = ["postgres", "mysql", "bigquery", "athena", "druid", "pg", "json"]
TYPE_MAPPING = {
    "string": "STRING",
    "integer": "NUMBER",
    "float": "NUMBER",
    "number": "NUMBER",
    "boolean": "BOOLEAN",
    "datetime": "TIME",
    "date": "TIME",
}

logger = logging.getLogger(__name__)


def iso_format(dt):
    try:
        utc = dt + dt.utcoffset()
    except TypeError:
        utc = dt
    isostring = datetime.datetime.strftime(utc, "%Y-%m-%dT%H:%M:%S.{0}Z")
    return isostring.format(int(round(utc.microsecond / 1000.0)))


def is_expression_object(obj):
    """Check if an object is a serialized Plywood expression (has 'op' property)"""
    return isinstance(obj, dict) and "op" in obj and isinstance(obj.get("op"), str)


def sanitize_split_data(data):
    """
    Recursively sanitize SPLIT data by replacing expression objects with empty datasets.
    """
    if not isinstance(data, dict):
        return data

    result = copy.deepcopy(data)

    if "SPLIT" in result:
        split_value = result["SPLIT"]
        if is_expression_object(split_value):
            result["SPLIT"] = {"keys": [], "data": [], "attributes": [], "type": "DATASET"}
        elif isinstance(split_value, dict) and "data" in split_value:
            split_value["data"] = [sanitize_split_data(item) for item in split_value.get("data", [])]

    return result


def convert_nested_splits_to_dataset(data_item):
    """
    Recursively convert nested SPLIT dictionaries to proper Dataset format with type marker.
    """
    if not isinstance(data_item, dict):
        return data_item

    result = copy.deepcopy(data_item)

    if "SPLIT" in result:
        split_value = result["SPLIT"]
        if isinstance(split_value, dict) and not is_expression_object(split_value):
            # Recursively process nested data items
            if "data" in split_value and isinstance(split_value["data"], list):
                split_value["data"] = [convert_nested_splits_to_dataset(item) for item in split_value["data"]]
            # Add type marker for PlywoodValue parsing
            split_value["type"] = "DATASET"
            result["SPLIT"] = split_value

    return result


class PlywoodQueryParserV2:
    version = 2

    def __init__(
        self, query_result: List, data_cube_name: str, shape: dict, visualization="table", data_cube: DataCube = None
    ):
        self._query_result = query_result
        self._data_cube_name = data_cube_name
        self._shape = self._sanitize_shape(shape)
        self._visualization = visualization
        self._data_cube = data_cube
        self._is_json_source = data_cube.ply_engine == "json" if data_cube else False

    def _sanitize_shape(self, shape: dict) -> dict:
        """Sanitize the shape by replacing expression objects in SPLIT with empty datasets"""
        if not shape or not isinstance(shape, dict):
            return shape

        sanitized = copy.deepcopy(shape)

        if "data" in sanitized and isinstance(sanitized["data"], list):
            sanitized["data"] = [sanitize_split_data(item) for item in sanitized["data"]]

        return sanitized

    @property
    def null(self):
        if self._data_cube:
            return self._data_cube.null_value
        else:
            return "IS NULL"

    def parse_ply(self, engine: str):
        if engine in SUPPORTED_ENGINES:
            return self._query_to_ply_data(engine)

        raise ExpressionNotSupported(message=f"{engine} is not supported")

    @staticmethod
    def _contains_time_shift(columns: list):
        for column in columns:
            if TIME_SHIFT_ATTRS in column["name"]:
                return True
        return False

    def _get_change_attrs(self, attributes: dict) -> List[dict]:
        change_attrs = list(
            filter(
                lambda x: (x["name"] not in SYSTEM_FIELDS and x["name"] != self._data_cube_name),
                attributes["attributes"],
            )
        )

        return change_attrs

    def _get_zero_value(self, attributes: list):
        """First query is always about count"""
        res = {}
        query_results = self._query_result

        if not query_results or len(query_results) == 0:
            return res

        rows: list = query_results[0]["query_result"]["data"]["rows"]
        columns: list = query_results[0]["query_result"]["data"]["columns"]

        if not rows:
            return res

        for value in attributes:
            key = value["name"]
            _type = value["type"]

            row = pydash.head(rows)
            if PlywoodQueryParserV2._contains_time_shift(columns):
                row_value = row.get(key) or 0
                res[key] = float(row_value) if _type == "NUMBER" else row_value
            else:
                if columns[0]["name"] == "__VALUE__":
                    row_value = row.get("__VALUE__") or 0
                else:
                    row_value = row.get(key) or 0
                res[key] = float(row_value) if _type == "NUMBER" else row_value

        return res

    def _get_first_split_query_index(self):
        """
        Get the index of the query that contains first split data.
        For JSON sources with single split: index 1 (index 0 is total)
        For SQL sources: index 1 contains first split (index 0 is total)
        """
        return 1

    def _get_first_split(self):
        """Get the first split data from the correct query"""
        query_index = self._get_first_split_query_index()

        if len(self._query_result) <= query_index:
            return []

        rows: list = self._query_result[query_index]["query_result"]["data"]["rows"]
        return rows

    def _get_second_split_start_index(self):
        """
        Get the starting index for second split queries.
        For both JSON and SQL sources: index 2 onwards
        """
        return 2

    def _build_first_split(self, shape: dict):
        split_data = shape["data"][0]["SPLIT"]
        data = self._get_first_split()

        if not data:
            logger.info("_build_first_split: No data from first split query")
            return

        split_keys = split_data.get("keys", [])

        # Only create nested SPLIT if we have more than 2 queries (meaning 2 splits)
        num_queries = len(self._query_result)
        has_second_split = num_queries > 2

        logger.info(f"_build_first_split: num_queries={num_queries}, has_second_split={has_second_split}")

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
                            logger.info(f"_build_first_split: Found nested_split_template from shape")

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
                        logger.info(f"_build_first_split: Created nested_split_template from query")

        # Get query index for first split
        query_index = self._get_first_split_query_index()

        # Create sample based on the query result columns
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

        # Only add empty nested SPLIT structure for 2-split queries
        if nested_split_template:
            sample["SPLIT"] = copy.deepcopy(nested_split_template)

        # Clear and rebuild data array
        split_data["data"] = []

        for value in data:
            sample_copy = copy.deepcopy(sample)
            sample_copy.update(value)
            # Only process SPLIT if we have a template (2-split case)
            if "SPLIT" in sample_copy and is_expression_object(sample_copy["SPLIT"]):
                if nested_split_template:
                    sample_copy["SPLIT"] = copy.deepcopy(nested_split_template)
                else:
                    del sample_copy["SPLIT"]
            split_data["data"].append(sample_copy)

        logger.info(f"_build_first_split: Built {len(split_data['data'])} rows in split_data")

        # Update attributes
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

        if not split_data.get("keys") and split_keys:
            split_data["keys"] = split_keys

    def _prepare_line_chart(self, shape, top_index):
        split = shape["data"][0]["SPLIT"]

        if "SPLIT" not in split["data"][top_index]:
            return
        if "data" not in split["data"][top_index]["SPLIT"]:
            return
        if not split["data"][top_index]["SPLIT"]["data"]:
            return

        split["data"][top_index]["SPLIT"]["attributes"].append(dict(name=self._data_cube_name, type="DATASET"))

        size = len(split["data"][top_index]["SPLIT"]["data"])

        if "keys" not in split["data"][top_index]["SPLIT"] or not split["data"][top_index]["SPLIT"]["keys"]:
            return

        column_name = split["data"][top_index]["SPLIT"]["keys"][0]

        for inner_index, item in enumerate(split["data"][top_index]["SPLIT"]["data"]):
            if column_name not in item:
                continue
            tmp_value = copy.deepcopy(item[column_name])
            real_date = 0
            if isinstance(tmp_value, str) or isinstance(tmp_value, datetime.datetime):
                real_date = parser.parse(tmp_value)
            elif isinstance(tmp_value, dict):
                real_date = parser.parse(tmp_value["start"])

            str_date = iso_format(real_date)
            if inner_index + 1 < size:
                next_value = split["data"][top_index]["SPLIT"]["data"][inner_index + 1]
                next_tmp_value = copy.deepcopy(next_value[column_name])
                real_date_next = None
                if isinstance(tmp_value, str) or isinstance(tmp_value, datetime.datetime):
                    real_date_next = parser.parse(next_tmp_value)
                elif isinstance(tmp_value, dict):
                    real_date_next = parser.parse(next_tmp_value["start"])
                str_date_next = iso_format(real_date_next)

                item[column_name] = dict(start=str_date, end=str_date_next)

            else:
                end_date = real_date + datetime.timedelta(seconds=1)
                end_date_str = iso_format(end_date)
                item[column_name] = dict(start=str_date, end=end_date_str)

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

    def _add_dataset_type_markers(self, shape: dict):
        """Add 'type': 'DATASET' markers to all SPLIT structures for PlywoodValue parsing"""
        if "data" not in shape:
            return

        for item in shape["data"]:
            if "SPLIT" in item and isinstance(item["SPLIT"], dict):
                self._add_type_marker_recursive(item["SPLIT"])

    def _add_type_marker_recursive(self, split_dict: dict):
        """Recursively add type markers to SPLIT structures"""
        if not isinstance(split_dict, dict):
            return

        if "data" in split_dict or "keys" in split_dict:
            split_dict["type"] = "DATASET"

        if "data" in split_dict and isinstance(split_dict["data"], list):
            for item in split_dict["data"]:
                if isinstance(item, dict) and "SPLIT" in item:
                    self._add_type_marker_recursive(item["SPLIT"])

    def _populate_splits_recursive(self, split, queries, query_idx=0):
        """
        Recursively populate SPLITs for N-level splits.
        - split: the SPLIT dict to populate
        - queries: the list of query results (starting from query_idx)
        - query_idx: the index in queries corresponding to this split level
        Returns: next unused query_idx
        """
        if not split or "keys" not in split or "data" not in split:
            return query_idx

        if query_idx >= len(queries):
            return query_idx

        query = queries[query_idx]
        rows = query["query_result"]["data"]["rows"]
        columns = query["query_result"]["data"]["columns"]
        split_key = split["keys"][0] if split["keys"] else None

        next_query_idx = query_idx + 1

        # For each row at this split level, assign data and recurse if SPLIT exists
        for i, row in enumerate(rows):
            # Find the corresponding item in split["data"] (by key value)
            match = None
            for item in split["data"]:
                if split_key in item and item[split_key] == row.get(split_key):
                    match = item
                    break
            if not match:
                # fallback: match by index
                if i < len(split["data"]):
                    match = split["data"][i]
                else:
                    continue

            # Update values for this row
            for col in columns:
                match[col["name"]] = row.get(col["name"])

            # If there's a nested SPLIT, recurse only if next_query_idx < len(queries)
            if (
                "SPLIT" in match
                and isinstance(match["SPLIT"], dict)
                and match["SPLIT"].get("keys")
                and next_query_idx < len(queries)
            ):
                next_query_idx = self._populate_splits_recursive(match["SPLIT"], queries, next_query_idx)

        return next_query_idx

    def _build_all_splits(self, shape: dict):
        """
        Recursively populate all SPLITs in the shape using all queries.
        """
        split = shape["data"][0].get("SPLIT")
        if not split:
            return
        self._populate_splits_recursive(split, self._query_result[1:])  # skip total query

    def _query_to_ply_data(self, engine: str):
        shape = copy.deepcopy(self._shape)

        logger.info(f"_query_to_ply_data: engine={engine}, mode detected from query count")
        logger.info(f"_query_to_ply_data: Total queries={len(self._query_result)}")
        logger.info(f"_query_to_ply_data: is_json_source={self._is_json_source}")

        # First query - get zero/total values
        first_change_attributes = self._get_change_attrs(shape)
        first_replace = self._get_zero_value(first_change_attributes)

        if len(first_replace.keys()) > 0:
            shape["data"][0].update(first_replace)
            logger.info(f"_query_to_ply_data: Updated shape with zero values: {first_replace}")

        # Determine number of splits based on query count
        # For both JSON and SQL: 2 queries = 1 split, 3+ queries = 2 splits
        num_queries = len(self._query_result)
        has_first_split = num_queries >= 2
        has_second_split = num_queries >= 3

        logger.info(f"_query_to_ply_data: has_first_split={has_first_split}, has_second_split={has_second_split}")

        if has_first_split:
            self._build_first_split(shape=shape)
            logger.info(f"_query_to_ply_data: After _build_first_split")

        if has_second_split:
            self._build_second_split(shape=shape)
            logger.info(f"_query_to_ply_data: After _build_second_split")

        # Add type markers to all SPLIT structures
        self._add_dataset_type_markers(shape)

        # Convert nested splits to proper format
        if "data" in shape:
            shape["data"] = [convert_nested_splits_to_dataset(item) for item in shape["data"]]

        # Log final structure for debugging
        if shape.get("data") and len(shape["data"]) > 0:
            first_data = shape["data"][0]
            if "SPLIT" in first_data and isinstance(first_data["SPLIT"], dict):
                split_data = first_data["SPLIT"].get("data", [])
                logger.info(f"_query_to_ply_data: Final first SPLIT has {len(split_data)} rows")
                if split_data and len(split_data) > 0:
                    first_row = split_data[0]
                    if "SPLIT" in first_row:
                        nested_split = first_row["SPLIT"]
                        if isinstance(nested_split, dict):
                            logger.info(
                                f"_query_to_ply_data: First row has nested SPLIT with {len(nested_split.get('data', []))} rows"
                            )

        return PlywoodValue.from_json(shape)


def default(obj):
    """Default JSON serializer."""

    if isinstance(obj, datetime.datetime):
        if obj.utcoffset() is not None:
            obj = obj - obj.utcoffset()
        millis = int(calendar.timegm(obj.timetuple()) * 1000 + obj.microsecond / 1000)
        return millis
    raise TypeError(f"Not sure how to serialize {obj}")
