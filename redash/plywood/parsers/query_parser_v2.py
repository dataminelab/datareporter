import calendar
import copy
import datetime
import logging
from abc import ABC
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


class PlywoodQueryParserV2(ABC):
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
            else:
                if columns[0]["name"] == "__VALUE__":
                    row_value = row.get("__VALUE__") or 0
                else:
                    row_value = row.get(key) or 0
            # Ensure integer-like floats are returned as int
            if _type == "NUMBER":
                try:
                    float_val = float(row_value)
                    if float_val.is_integer():
                        res[key] = int(float_val)
                    else:
                        res[key] = float_val
                except Exception:
                    res[key] = row_value
            else:
                res[key] = row_value

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
        sample = copy.deepcopy(split_data["data"][0])
        split_data["data"] = list()

        for value in data:
            sample_copy = copy.deepcopy(sample)
            sample_copy.update(value)
            split_data["data"].append(sample_copy)

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
        column_name = pydash.head(split["keys"])
        for value in split["data"]:
            search_column_name = self.null if value[column_name] is None else f"'{value[column_name]}'"
            query = pydash.find(
                self._query_result, lambda v: f'"{search_column_name[1:-1]}"' in v["query_result"]["query"]
            )
            if query is None:
                query = pydash.find(
                    self._query_result, lambda v: f"'{search_column_name[1:-1]}'" in v["query_result"]["query"]
                )
            if query is None:
                query = pydash.find(
                    self._query_result, lambda v: search_column_name[1:-1] in v["query_result"]["query"]
                )
            if query is None:
                continue
            index = pydash.find_index(split["data"], lambda v: v[column_name] == value[column_name])
            if index == -1:
                continue
            split["data"][index]["SPLIT"]["data"] = query["query_result"]["data"]["rows"]
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

        # First query
        first_change_attributes = self._get_change_attrs(shape)
        first_replace = self._get_zero_value(first_change_attributes)

        if len(first_replace.keys()) > 0:
            shape["data"][0].update(first_replace)

        # If second query exists it means it's a 1 split
        num_queries = len(self._query_result)
        has_first_split = num_queries >= 2
        has_second_split = num_queries >= 3
        if has_first_split:
            self._build_first_split(shape=shape)

        if has_second_split:
            self._build_second_split(shape=shape)

        return PlywoodValue.from_json(shape)


def default(obj):
    """Default JSON serializer."""

    if isinstance(obj, datetime.datetime):
        if obj.utcoffset() is not None:
            obj = obj - obj.utcoffset()
        millis = int(calendar.timegm(obj.timetuple()) * 1000 + obj.microsecond / 1000)
        return millis
    raise TypeError(f"Not sure how to serialize {obj}")
