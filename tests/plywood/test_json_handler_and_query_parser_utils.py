import datetime

import pytest
from werkzeug.exceptions import HTTPException

from redash.plywood.handlers.json_handler import (
    JsonPlywoodQueryParser,
    clean_json_array_string,
    clean_row_values,
    flatten_dict,
    handle_json_data_source,
)
from redash.plywood.parsers.query_parser_v2 import (
    ExpressionNotSupported,
    convert_nested_splits_to_dataset,
    default,
    is_expression_object,
    sanitize_split_data,
)


class DummyResponse:
    def __init__(self, payload):
        self._payload = payload

    def json(self):
        return self._payload


class DummyModelDataSource:
    def __init__(self, base_url="https://example.local", inner_data_path=None):
        self.id = 42
        self.options = {"base_url": base_url, "inner_data_path": inner_data_path}


class DummyModel:
    def __init__(self, data_source):
        self.data_source = data_source


class DummyDataCube:
    def __init__(self, source_name="events"):
        self.source_name = source_name
        self.ply_engine = "json"
        self.null_value = "IS NULL"

    def get_meta(self, queries):
        return None


class DummyExpression:
    def __init__(self, filter_obj, shape, visualization="table", measure_name="count"):
        self.filter = filter_obj
        self.shape = shape
        self.visualization = visualization
        self.measure_name = measure_name


def _query(columns, rows, query=""):
    return {
        "query_result": {
            "data": {"columns": columns, "rows": rows},
            "query": query,
        }
    }


def test_clean_json_array_string_and_clean_row_values():
    assert clean_json_array_string('["Alice"]') == "Alice"
    assert clean_json_array_string('["A", "B"]') == "A, B"
    assert clean_json_array_string("[]") is None
    assert clean_json_array_string("not-json") == "not-json"
    assert clean_json_array_string(7) == 7

    cleaned_row = clean_row_values({"tags": '["x", "y"]', "raw": "value"})
    assert cleaned_row == {"tags": "x, y", "raw": "value"}
    assert clean_row_values("not-a-row") == "not-a-row"


def test_flatten_dict_with_nested_objects():
    assert flatten_dict({"a": {"b": 1}, "c": 2}) == {"a_b": 1, "c": 2}


def test_query_parser_utils_sanitize_and_convert_nested_split():
    obj = {"name": "top", "SPLIT": {"op": "ref", "name": "placeholder"}}
    sanitized = sanitize_split_data(obj)
    assert sanitized["SPLIT"] == {"keys": [], "data": [], "attributes": [], "type": "DATASET"}

    nested = {
        "group": "A",
        "SPLIT": {
            "keys": ["sub"],
            "attributes": [{"name": "sub", "type": "STRING"}],
            "data": [{"sub": "x"}],
        },
    }
    converted = convert_nested_splits_to_dataset(nested)
    assert converted["SPLIT"]["type"] == "DATASET"
    assert is_expression_object({"op": "ref", "name": "x"}) is True
    assert is_expression_object({"name": "x"}) is False


def test_default_datetime_serializer_and_type_error():
    dt = datetime.datetime(2025, 1, 2, 3, 4, 5, 120000)
    assert isinstance(default(dt), int)

    with pytest.raises(TypeError):
        default(object())


def test_handle_json_data_source_no_splits(monkeypatch):
    json_rows = [
        {"category": "A", "tags": '["x"]'},
        {"category": "B", "tags": '["y", "z"]'},
    ]
    monkeypatch.setattr(
        "redash.plywood.handlers.json_handler.requests.get",
        lambda *args, **kwargs: DummyResponse(json_rows),
    )

    expression = DummyExpression(
        filter_obj={"splits": [], "series": []},
        shape={"attributes": [{"name": "count", "type": "NUMBER"}], "data": [{"count": 0}]},
    )
    model = DummyModel(data_source=DummyModelDataSource())
    data_cube = DummyDataCube(source_name="events")

    result = handle_json_data_source("h1", data_cube, expression, model)
    payload = result.serialized()

    assert len(payload["queries"]) == 1
    assert payload["queries"][0]["query_result"]["data"]["rows"] == [{"__VALUE__": 2}]


def test_handle_json_data_source_one_split(monkeypatch):
    json_rows = [
        {"Category": "A"},
        {"Category": "A"},
        {"Category": "B"},
        {"Category": None},
    ]
    monkeypatch.setattr(
        "redash.plywood.handlers.json_handler.requests.get",
        lambda *args, **kwargs: DummyResponse(json_rows),
    )

    expression = DummyExpression(
        filter_obj={
            "splits": [{"dimension": "category"}],
            "series": [{"reference": "items"}],
        },
        shape={
            "attributes": [{"name": "items", "type": "NUMBER"}],
            "data": [{"items": 0, "SPLIT": {"keys": ["category"], "attributes": [], "data": []}}],
        },
    )
    model = DummyModel(data_source=DummyModelDataSource())
    data_cube = DummyDataCube(source_name="events")

    result = handle_json_data_source("h2", data_cube, expression, model)
    payload = result.serialized()

    assert len(payload["queries"]) == 2
    assert payload["queries"][0]["query_result"]["data"]["rows"] == [{"__VALUE__": 4}]
    assert payload["queries"][1]["query_result"]["data"]["rows"][0] == {"category": "A", "items": 2}


def test_handle_json_data_source_more_than_two_splits_raises(monkeypatch):
    monkeypatch.setattr(
        "redash.plywood.handlers.json_handler.requests.get",
        lambda *args, **kwargs: DummyResponse([{"x": 1}]),
    )

    expression = DummyExpression(
        filter_obj={
            "splits": [
                {"dimension": "a"},
                {"dimension": "b"},
                {"dimension": "c"},
            ],
            "series": [],
        },
        shape={"attributes": [{"name": "count", "type": "NUMBER"}], "data": [{"count": 0}]},
    )
    model = DummyModel(data_source=DummyModelDataSource())
    data_cube = DummyDataCube()

    with pytest.raises(HTTPException):
        handle_json_data_source("h3", data_cube, expression, model)


def test_json_query_parser_parse_ply_for_two_splits_json_source():
    shape = {
        "attributes": [
            {"name": "main", "type": "DATASET"},
            {"name": "items", "type": "NUMBER"},
            {"name": "SPLIT", "type": "DATASET"},
        ],
        "data": [
            {
                "items": 0,
                "SPLIT": {
                    "keys": ["country"],
                    "attributes": [
                        {"name": "country", "type": "STRING"},
                        {"name": "items", "type": "NUMBER"},
                        {"name": "SPLIT", "type": "DATASET"},
                    ],
                    "data": [
                        {
                            "country": "",
                            "items": 0,
                            "SPLIT": {"op": "ref", "name": "placeholder"},
                        }
                    ],
                },
            }
        ],
    }

    query_result = [
        _query(
            columns=[{"name": "__VALUE__", "type": "integer"}],
            rows=[{"__VALUE__": 3}],
        ),
        _query(
            columns=[{"name": "country", "type": "string"}, {"name": "items", "type": "integer"}],
            rows=[{"country": "US", "items": 2}, {"country": "CA", "items": 1}],
        ),
        _query(
            columns=[{"name": "city", "type": "string"}, {"name": "items", "type": "integer"}],
            rows=[{"city": "NY", "items": 2}],
            query="WHERE country = 'US'",
        ),
        _query(
            columns=[{"name": "city", "type": "string"}, {"name": "items", "type": "integer"}],
            rows=[{"city": "Toronto", "items": 1}],
            query="WHERE country = 'CA'",
        ),
    ]

    parser = JsonPlywoodQueryParser(
        query_result=query_result,
        data_cube_name="events",
        shape=shape,
        data_cube=DummyDataCube(),
    )

    data = parser.parse_ply("json")
    result = data.dict()

    assert result["data"][0]["items"] == 3
    assert len(result["data"][0]["SPLIT"]["data"]) == 2
    assert result["data"][0]["SPLIT"]["data"][0]["country"] == "US"
    assert result["data"][0]["SPLIT"]["data"][0]["SPLIT"]["data"][0]["city"] == "NY"


def test_query_parser_rejects_unsupported_engine():
    parser = JsonPlywoodQueryParser(query_result=[], data_cube_name="events", shape={"attributes": [], "data": [{}]})

    with pytest.raises(ExpressionNotSupported):
        parser.parse_ply("oracle")
