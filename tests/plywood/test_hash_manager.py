import types

import pytest

from redash.plywood import hash_manager


def test_replace_item_replaces_nested_values():
    payload = {
        "name": "main",
        "inner": {"name": "main", "other": "keep"},
    }

    replaced = hash_manager.replace_item(payload, "main", "events")

    assert replaced["name"] == "events"
    assert replaced["inner"]["name"] == "events"
    assert replaced["inner"]["other"] == "keep"


def test_pending_and_status_helpers():
    assert hash_manager.has_pending([]) is False
    assert hash_manager.has_pending([hash_manager.FAILED_QUERY_CODE, hash_manager.FAILED_QUERY_CODE]) is False
    assert hash_manager.has_pending([1, hash_manager.FAILED_QUERY_CODE]) is True

    assert hash_manager.jobs_status([]) is None
    assert hash_manager.jobs_status([{"query_result": {}}]) is None
    assert hash_manager.jobs_status([{"job": {"status": hash_manager.FAILED_QUERY_CODE}}]) is None
    assert hash_manager.jobs_status([{"job": {"status": 1}}]) == 1


def test_extract_measure_name_from_expression():
    assert hash_manager.extract_measure_name_from_expression({"applies": [{"name": "sum_items"}]}) == "sum_items"
    assert hash_manager.extract_measure_name_from_expression({"applies": []}) == "count"


def test_clean_errored_indexes():
    queries = [
        {"job": {"status": hash_manager.FAILED_QUERY_CODE}},
        {"job": {"status": 1}},
        {"query_result": {}},
        {"job": {"status": hash_manager.FAILED_QUERY_CODE}},
    ]
    assert hash_manager.clean_errored(queries) == [0, 3]


def test_is_admin_permissions():
    assert hash_manager.is_admin(types.SimpleNamespace(permissions=["admin"])) is True
    assert hash_manager.is_admin(types.SimpleNamespace(permissions=["super_admin"])) is True
    assert hash_manager.is_admin(types.SimpleNamespace(permissions=["edit_report"])) is True
    assert hash_manager.is_admin(types.SimpleNamespace(permissions=["view"])) is False


def test_cache_or_get_fetches_and_recurses(monkeypatch):
    store = {}

    class DummyRedis:
        @staticmethod
        def exists(key):
            return key in store

        @staticmethod
        def get(key):
            return store[key]

        @staticmethod
        def setex(key, ttl, value):
            store[key] = value

    monkeypatch.setattr(hash_manager, "redis_connection", DummyRedis)
    monkeypatch.setattr(hash_manager, "execute_query", lambda query, model, query_id, org: {"job": {"id": query}})
    monkeypatch.setattr(hash_manager, "parse_job", lambda job_id, org: {"query_result": {"id": job_id}})

    result = hash_manager.cache_or_get(
        hash_string="abc",
        queries=["job-1", "job-2"],
        current_org=object(),
        model=object(),
    )

    assert result == [{"query_result": {"id": "job-1"}}, {"query_result": {"id": "job-2"}}]


def test_clear_cache_and_get(monkeypatch):
    called = {"clear": 0, "get": 0}

    monkeypatch.setattr(hash_manager, "clear_cache", lambda hash_string, split=1: called.__setitem__("clear", 1))
    monkeypatch.setattr(
        hash_manager,
        "cache_or_get",
        lambda hash_string, queries, current_org, model, split=1: called.__setitem__("get", 1) or [{"ok": True}],
    )

    result = hash_manager.clear_cache_and_get("h", ["q"], object(), object(), 2)

    assert called["clear"] == 1
    assert called["get"] == 1
    assert result == [{"ok": True}]


def test_parse_result_json_source_uses_json_handler(monkeypatch):
    class Cube:
        ply_engine = "json"

    expected = object()
    monkeypatch.setattr(hash_manager, "handle_json_data_source", lambda **kwargs: expected)

    result = hash_manager.parse_result(
        hash_string="h",
        queries=[{"query_result": {}}],
        data_cube=Cube(),
        expression=types.SimpleNamespace(filter={"splits": []}),
        model=object(),
        current_org=object(),
    )

    assert result is expected


def test_parse_result_empty_queries_aborts(monkeypatch):
    class Cube:
        ply_engine = "postgres"

    with pytest.raises(Exception):
        hash_manager.parse_result(
            hash_string="h",
            queries=[],
            data_cube=Cube(),
            expression=types.SimpleNamespace(filter={"splits": []}),
            model=object(),
            current_org=object(),
        )


def test_parse_result_returns_fetching_serializer(monkeypatch):
    class Cube:
        ply_engine = "postgres"

    monkeypatch.setattr(hash_manager, "jobs_status", lambda data: 1)

    result = hash_manager.parse_result(
        hash_string="h",
        queries=[{"job": {"status": 1}}],
        data_cube=Cube(),
        expression=types.SimpleNamespace(filter={"splits": []}),
        model=object(),
        current_org=object(),
    )

    assert result.status == 1


def test_parse_result_returns_failed_serializer_and_clears_cache(monkeypatch):
    class Cube:
        ply_engine = "postgres"

    called = {"clear": 0}
    monkeypatch.setattr(hash_manager, "jobs_status", lambda data: None)
    monkeypatch.setattr(hash_manager, "clean_errored", lambda data: [0])
    monkeypatch.setattr(hash_manager, "clear_cache", lambda h, split=1: called.__setitem__("clear", split))

    result = hash_manager.parse_result(
        hash_string="h",
        queries=[{"job": {"status": hash_manager.FAILED_QUERY_CODE}}],
        data_cube=Cube(),
        expression=types.SimpleNamespace(filter={"splits": []}),
        model=object(),
        current_org=object(),
    )

    assert called["clear"] == 1
    assert result.status == 4
    assert result.failed is True


def test_parse_result_split_more_than_two_aborts(monkeypatch):
    class Cube:
        ply_engine = "postgres"

    monkeypatch.setattr(hash_manager, "jobs_status", lambda data: None)
    monkeypatch.setattr(hash_manager, "clean_errored", lambda data: [])

    with pytest.raises(Exception):
        hash_manager.parse_result(
            hash_string="h",
            queries=[{"query_result": {}}],
            data_cube=Cube(),
            expression=types.SimpleNamespace(filter={"splits": [{}, {}, {}]}),
            model=object(),
            current_org=object(),
        )


def test_parse_result_success_path(monkeypatch):
    class Cube:
        ply_engine = "postgres"
        source_name = "events"

        @staticmethod
        def get_meta(queries):
            return None

    class DummyParser:
        def __init__(self, **kwargs):
            self.kwargs = kwargs

        def parse_ply(self, engine):
            return types.SimpleNamespace(dict=lambda: {"rows": [{"x": 1}]})

    expression = types.SimpleNamespace(
        filter={"splits": []},
        shape={"attributes": [], "data": [{}]},
        visualization="table",
    )

    monkeypatch.setattr(hash_manager, "jobs_status", lambda data: None)
    monkeypatch.setattr(hash_manager, "clean_errored", lambda data: [])
    monkeypatch.setattr(hash_manager, "PlywoodQueryParserV2", DummyParser)

    result = hash_manager.parse_result(
        hash_string="h",
        queries=[{"query_result": {"data": {"rows": [], "columns": []}}}],
        data_cube=Cube(),
        expression=expression,
        model=object(),
        current_org=object(),
    )

    assert result.status == 200
    assert result.data.dict() == {"rows": [{"x": 1}]}


def test_filter_expression_to_result_fetching(monkeypatch):
    class Cube:
        source_name = "events"

        def __init__(self, model):
            self.model = model

    monkeypatch.setattr(hash_manager, "DataCube", Cube)
    monkeypatch.setattr(hash_manager, "cache_or_get", lambda **kwargs: [{"job": {"status": 1}}])
    monkeypatch.setattr(hash_manager, "jobs_status", lambda data: 1)
    monkeypatch.setattr(hash_manager.ExpressionBase64Parser, "parse_dict_to_base64", lambda obj: "encoded")
    monkeypatch.setattr(hash_manager.Expression, "get_queries_from_prepared_expression", lambda cube, expr: ["Q1"])

    result = hash_manager.filter_expression_to_result(
        expression={"main": "main"},
        model=object(),
        organisation=object(),
    )

    assert result.status == 1


def test_filter_expression_to_result_success(monkeypatch):
    class Cube:
        source_name = "events"

        def __init__(self, model):
            self.model = model

    monkeypatch.setattr(hash_manager, "DataCube", Cube)
    monkeypatch.setattr(
        hash_manager, "cache_or_get", lambda **kwargs: [{"query_result": {"data": {"rows": [{"y": 2}]}}}]
    )
    monkeypatch.setattr(hash_manager, "jobs_status", lambda data: None)
    monkeypatch.setattr(hash_manager.ExpressionBase64Parser, "parse_dict_to_base64", lambda obj: "encoded")
    monkeypatch.setattr(hash_manager.Expression, "get_queries_from_prepared_expression", lambda cube, expr: ["Q1"])
    monkeypatch.setattr(
        hash_manager.Expression,
        "get_shape_from_prepared_expression",
        lambda cube, expr: {"attributes": [], "data": []},
    )

    result = hash_manager.filter_expression_to_result(
        expression={"main": "main"},
        model=object(),
        organisation=object(),
    )

    assert result.status == 200
    assert result.data == {"attributes": [], "data": [{"y": 2}]}
