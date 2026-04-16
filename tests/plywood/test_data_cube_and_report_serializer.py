from unittest.mock import patch

from redash.plywood.objects.data_cube import DataCube
from redash.plywood.objects.report_serializer import (
    Progress,
    ReportMetaData,
    ReportSerializer,
)


class DummyConfig:
    def __init__(self, content):
        self.content = content


class DummyDataSource:
    def __init__(self, ds_type="pg", ds_id=1, options=None):
        self.type = ds_type
        self.id = ds_id
        self.options = options or {}


class DummyModel:
    def __init__(self, data_source=None, config=None, table="events"):
        self.data_source = data_source or DummyDataSource()
        self.config = config
        self.table = table


def test_data_cube_config_attributes_and_context():
    model = DummyModel(
        data_source=DummyDataSource(ds_type="pg"),
        config=DummyConfig("""
dataCubes:
  - name: TestCube
    attributes:
      - name: category
        type: STRING
    dimensions:
      - name: country
        kind: TIME
"""),
        table="analytics.events",
    )

    cube = DataCube(model)

    assert cube.source_name == "analytics.events"
    assert cube.ply_engine == "postgres"
    assert cube.attributes == [{"name": "category", "type": "STRING"}]
    assert cube.context == {
        "engine": "postgres",
        "source": "analytics.events",
        "attributes": [{"name": "category", "type": "STRING"}],
    }

    data_cube = cube.data_cube
    assert data_cube["dimensions"][0]["kind"] == "time"


def test_data_cube_config_is_empty_when_missing():
    cube_no_config = DataCube(DummyModel(config=None))
    assert cube_no_config.config == {}

    cube_no_content = DataCube(DummyModel(config=DummyConfig(content=None)))
    assert cube_no_content.config == {}


def test_data_cube_get_meta_athena_accumulates_cost_and_scanned_data():
    model = DummyModel(data_source=DummyDataSource(ds_type="athena"))
    cube = DataCube(model)

    queries = [
        {"query_result": {"data": {"metadata": {"query_cost": 1.5, "data_scanned": 100}}}},
        {"query_result": {"data": {"metadata": {"query_cost": 0.5, "data_scanned": 50}}}},
    ]

    meta = cube.get_meta(queries)

    assert meta is not None
    assert meta.price == 2.0
    assert meta.proceed_data == 150


def test_data_cube_get_meta_bigquery_skips_cache_hit_and_sets_price():
    model = DummyModel(data_source=DummyDataSource(ds_type="bigquery"))
    cube = DataCube(model)

    queries = [
        {"query_result": {"data": {"metadata": {"cache_hit": True, "data_scanned": 1000}}}},
        {"query_result": {"data": {"metadata": {"cache_hit": False, "data_scanned": 600}}}},
    ]

    with patch("redash.plywood.objects.data_cube.get_price_for_query", return_value=9.99) as mocked_price:
        meta = cube.get_meta(queries)

    assert meta is not None
    assert meta.proceed_data == 600
    assert meta.price == 9.99
    mocked_price.assert_called_once_with(600)


def test_data_cube_get_meta_returns_none_when_no_cost_data():
    model = DummyModel(data_source=DummyDataSource(ds_type="pg"))
    cube = DataCube(model)

    queries = [{"query_result": {"data": {"metadata": {}}}}]

    assert cube.get_meta(queries) is None


def test_progress_dict_handles_zero_total():
    progress = Progress(jobs=0, results=0).dict()
    assert progress == {"all": 0, "results": 0, "progress": 0}


def test_report_metadata_helpers():
    meta = ReportMetaData(price=0, proceed_data=0)
    assert meta.has_data is False

    meta_with_data = ReportMetaData(price=1.25, proceed_data=2048)
    assert meta_with_data.has_data is True
    assert meta_with_data.to_dict() == {"price": 1.25, "proceed_data": 2048}


def test_report_serializer_serialized_with_dict_data_and_meta():
    serializer = ReportSerializer(
        queries=[{"job": {"id": "a"}}, {"query_result": {"id": 1}}],
        failed=["q2"],
        shape={"type": "object"},
        data={"rows": [{"id": 1}]},
        meta=ReportMetaData(price=2.5, proceed_data=300),
        expression_queries=[{"sql": "SELECT 1"}],
    )

    serialized = serializer.serialized()

    assert serialized["data"] == {"rows": [{"id": 1}]}
    assert serialized["failed"] == ["q2"]
    assert serialized["shape"] == {"type": "object"}
    assert serialized["meta"] == {"price": 2.5, "proceed_data": 300}
    assert serialized["progress"] == {"all": 2, "results": 1, "progress": 50}
    assert serialized["expression_queries"] == [{"sql": "SELECT 1"}]
