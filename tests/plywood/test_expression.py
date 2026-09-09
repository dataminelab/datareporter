import pytest

from redash.plywood.objects.expression import (
    REPLACE_DATA_CUBE_NAME,
    Expression,
    ExpressionNotSupported,
    replace_value_in_dict,
)


class DummyDataCube:
    def __init__(self):
        self.source_name = "analytics.events"
        self.context = {"engine": "postgres"}
        self.null_value = "IS NULL"
        self.data_cube = {
            "name": "analytics.events",
            "attributes": [{"name": "items", "type": "NUMBER"}],
            "dimensions": [{"name": "country", "kind": "time"}],
        }


def _make_expression(filter_data=None, queries=None):
    expr = Expression(_hash="unused", data_cube=DummyDataCube())
    expr._mem_cache["filter"] = filter_data or {
        "visualization": "table",
        "filters": [],
        "splits": [],
        "series": [],
        "applies": [],
    }
    if queries is not None:
        expr._mem_cache["queries"] = queries
    return expr


def test_replace_value_in_dict_replaces_nested_keys():
    payload = {
        "cube": "X",
        "nested": {"cube": "X", "arr": [{"ignore": "Y"}]},
    }

    replace_value_in_dict(payload, "X", "Z")

    assert payload["cube"] == "Z"
    assert payload["nested"]["cube"] == "Z"


def test_supported_validation_rejects_invalid_limits():
    expr = _make_expression(
        filter_data={
            "visualization": "pie",
            "filters": [{}, {}],
            "splits": [{}, {}, {}],
            "series": ["a", "b", "c"],
            "applies": [],
        }
    )

    with pytest.raises(ExpressionNotSupported):
        expr._supported_validation()


def test_supported_validation_accepts_valid_configuration():
    expr = _make_expression(
        filter_data={
            "visualization": "line-chart",
            "filters": [{"type": "string", "ref": "country", "values": ["US"]}],
            "splits": [{"dimension": "country"}],
            "series": ["items"],
            "applies": [{"name": "items"}],
        }
    )

    expr._supported_validation()


def test_expression_property_uses_cube_name_placeholder_and_restores(monkeypatch):
    expr = _make_expression()

    def fake_convert_hash_to_expression(hash, data_cube):
        assert data_cube["name"] == REPLACE_DATA_CUBE_NAME
        return {
            "op": "ref",
            "name": REPLACE_DATA_CUBE_NAME,
            "nested": {"name": REPLACE_DATA_CUBE_NAME},
        }

    monkeypatch.setattr(
        "redash.plywood.objects.expression.PlywoodApi.convert_hash_to_expression",
        fake_convert_hash_to_expression,
    )

    expression_value = expr.expression

    assert expression_value["name"] == "analytics.events"
    assert expression_value["nested"]["name"] == "analytics.events"


def test_shape_and_queries_static_helpers(monkeypatch):
    cube = DummyDataCube()

    monkeypatch.setattr(
        "redash.plywood.objects.expression.PlywoodApi.get_shape",
        lambda body: {"shape": {"attributes": [], "data": [{}], "received": body["dataCube"]}},
    )
    monkeypatch.setattr(
        "redash.plywood.objects.expression.PlywoodApi.convert_to_sql",
        lambda body: ["SELECT 1", f"SELECT '{body['dataCube']}'"],
    )

    shape = Expression.get_shape_from_prepared_expression(cube, {"op": "ref", "name": "x"})
    queries = Expression.get_queries_from_prepared_expression(cube, {"op": "ref", "name": "x"})

    assert shape["received"] == "analytics.events"
    assert queries == ["SELECT 1", "SELECT 'analytics.events'"]


def test_get_where_statement_and_boolean_query_builders():
    expr = _make_expression(
        queries=[
            "SELECT * FROM t WHERE a='x' GROUP BY 1",
            "SELECT * FROM t WHERE TRUE GROUP BY 1",
        ]
    )

    where_part = expr.get_where_statement("SELECT * FROM t WHERE country='US' GROUP BY 1")
    assert "country='US'" in where_part

    boolean_queries = expr._get_boolean_queries("SELECT * FROM t WHERE TRUE GROUP BY 1")
    assert boolean_queries[-1] == "SELECT * FROM t WHERE FALSE GROUP BY 1"

    true_queries = expr._get_boolean_queries_true("SELECT * FROM t WHERE FALSE GROUP BY 1")
    assert true_queries[-1] == "SELECT * FROM t WHERE TRUE GROUP BY 1"


def test_get_filter_ref_and_missing_ref_error():
    expr_ok = _make_expression(
        filter_data={
            "visualization": "table",
            "filters": [{"type": "string", "ref": "country", "values": ["US"]}],
            "splits": [{"dimension": "country"}],
            "series": ["items"],
            "applies": [],
        }
    )
    assert expr_ok.get_filter_ref() == "country"

    expr_fail = _make_expression(
        filter_data={
            "visualization": "table",
            "filters": [{"type": "number", "ref": "items", "values": [1]}],
            "splits": [],
            "series": [],
            "applies": [],
        }
    )
    with pytest.raises(Exception, match="No string filter found"):
        expr_fail.get_filter_ref()


def test_get_2_splits_queries_boolean_branch():
    expr = _make_expression(
        filter_data={
            "visualization": "table",
            "filters": [],
            "splits": [{"dimension": "country"}, {"dimension": "city"}],
            "series": ["items"],
            "applies": [],
        },
        queries=[
            "SELECT total FROM t",
            "SELECT country, items FROM t GROUP BY 1",
            "SELECT city, items FROM t WHERE TRUE GROUP BY 1",
        ],
    )

    built = expr.get_2_splits_queries(prev_result=[])

    assert built[-1] == "SELECT city, items FROM t WHERE FALSE GROUP BY 1"


def test_get_2_splits_queries_string_branch():
    expr = _make_expression(
        filter_data={
            "visualization": "table",
            "filters": [{"type": "string", "ref": "country", "values": ["US"]}],
            "splits": [{"dimension": "country"}],
            "series": ["items"],
            "applies": [],
        },
        queries=[
            "SELECT total FROM t",
            "SELECT country, items FROM t GROUP BY 1",
            "SELECT city, items FROM t WHERE country='some_country' GROUP BY 1",
        ],
    )

    prev_result = [
        None,
        {
            "query_result": {
                "data": {
                    "rows": [
                        {"country": "US"},
                        {"country": "CA"},
                    ]
                }
            }
        },
    ]

    built = expr.get_2_splits_queries(prev_result=prev_result)

    assert built[-2] == "SELECT city, items FROM t WHERE country='US' GROUP BY 1"
    assert built[-1] == "SELECT city, items FROM t WHERE country='CA' GROUP BY 1"


def test_measure_name_resolution_paths(monkeypatch):
    expr_series_ref = _make_expression(
        filter_data={
            "visualization": "table",
            "filters": [],
            "splits": [],
            "series": [{"reference": "sum_items"}],
            "applies": [],
        }
    )
    assert expr_series_ref.measure_name == "sum_items"

    expr_applies = _make_expression(
        filter_data={
            "visualization": "table",
            "filters": [],
            "splits": [],
            "series": [],
            "applies": [{"name": "default"}, {"name": "avg_items"}],
        }
    )
    assert expr_applies.measure_name == "avg_items"

    expr_recursive = _make_expression(
        filter_data={
            "visualization": "table",
            "filters": [],
            "splits": [],
            "series": [],
            "applies": [],
        }
    )
    monkeypatch.setattr(
        Expression,
        "expression",
        property(lambda self: {"op": "apply", "name": "total", "expression": {"op": "sum"}}),
    )
    assert expr_recursive.measure_name == "total"
