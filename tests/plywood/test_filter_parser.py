from redash.plywood.parsers.filter_parser import PlywoodFilterParser


def test_get_plywood_value_replaces_data_without_mutating_shape():
    shape = {
        "attributes": [{"name": "count", "type": "NUMBER"}],
        "data": [{"count": 0}],
    }
    query_result = [
        {
            "query_result": {
                "data": {
                    "rows": [{"count": 3}, {"count": 5}],
                }
            }
        }
    ]

    parser = PlywoodFilterParser(result=query_result, data_cube=None, shape=shape)

    value = parser.get_plywood_value()

    assert value["data"] == [{"count": 3}, {"count": 5}]
    assert shape["data"] == [{"count": 0}]
