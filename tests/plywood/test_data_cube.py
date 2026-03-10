import unittest
from datetime import datetime, timezone

import mock

from redash.plywood.objects.data_cube import DataCube


class TestDataCubeQueryBased(unittest.TestCase):
    """Tests for query-based DataCube behavior."""

    def _make_model(self, query_id=None, table="test_table", name="test_model"):
        model = mock.MagicMock()
        model.query_id = query_id
        model.table = table
        model.name = name
        model.data_source.type = "pg"
        model.config.content = """
dataCubes:
  - name: {name}
    title: Test
    timeAttribute: created_at
    clusterName: native
    attributes:
      - name: id
        type: NUMBER
        nativeType: INTEGER
      - name: created_at
        type: TIME
        nativeType: TIMESTAMP
    dimensions:
      - name: created_at
        title: Created At
        formula: $created_at
        kind: TIME
    measures:
      - name: id
        title: Id
        formula: $main.sum($id)
""".format(name=name)
        return model

    def test_is_query_based_true_when_query_id_set(self):
        model = self._make_model(query_id=42)
        cube = DataCube(model)
        self.assertTrue(cube.is_query_based)

    def test_is_query_based_false_when_no_query_id(self):
        model = self._make_model(query_id=None)
        cube = DataCube(model)
        self.assertFalse(cube.is_query_based)

    def test_source_name_uses_model_name_for_query_based(self):
        model = self._make_model(query_id=42, name="revenue_cube")
        cube = DataCube(model)
        self.assertEqual("revenue_cube", cube.source_name)

    def test_source_name_uses_table_for_table_based(self):
        model = self._make_model(query_id=None, table="orders")
        cube = DataCube(model)
        self.assertEqual("orders", cube.source_name)

    def test_context_includes_withQuery_for_query_based(self):
        model = self._make_model(query_id=42, name="q_cube")
        model.query_rel.query_text = "SELECT id, amount FROM orders WHERE active = true"
        cube = DataCube(model)

        ctx = cube.context
        self.assertIn("withQuery", ctx)
        self.assertEqual("SELECT id, amount FROM orders WHERE active = true", ctx["withQuery"])
        self.assertEqual("q_cube", ctx["source"])

    def test_context_omits_withQuery_for_table_based(self):
        model = self._make_model(query_id=None, table="orders")
        cube = DataCube(model)

        ctx = cube.context
        self.assertNotIn("withQuery", ctx)
        self.assertEqual("orders", ctx["source"])

    def test_context_has_engine_and_attributes(self):
        model = self._make_model(query_id=42, name="ctx_test")
        model.query_rel.query_text = "SELECT 1"
        cube = DataCube(model)

        ctx = cube.context
        self.assertIn("engine", ctx)
        self.assertIn("attributes", ctx)
        self.assertIsInstance(ctx["attributes"], list)


class TestRefreshStaleConfig(unittest.TestCase):
    """Tests for _refresh_stale_config in hash_manager."""

    def test_refreshes_config_when_query_updated_after_config(self):
        """Config should regenerate when backing query is newer."""
        from redash.plywood.hash_manager import _refresh_stale_config

        model = mock.MagicMock()
        model.query_id = 42
        model.id = 1
        model.config.updated_at = datetime(2026, 1, 1, tzinfo=timezone.utc)
        model.query_rel.updated_at = datetime(2026, 1, 15, tzinfo=timezone.utc)

        with mock.patch("redash.services.model_config_generator.ModelConfigGenerator") as gen_mock, mock.patch(
            "redash.models.db"
        ) as db_mock:
            gen_mock.yaml.return_value = "new-yaml-content"

            _refresh_stale_config(model)

            gen_mock.yaml.assert_called_once_with(model=model, refresh=False)
            self.assertEqual("new-yaml-content", model.config.content)
            db_mock.session.commit.assert_called_once()

    def test_skips_refresh_when_config_is_newer(self):
        """No regeneration when config is already up to date."""
        from redash.plywood.hash_manager import _refresh_stale_config

        model = mock.MagicMock()
        model.query_id = 42
        model.id = 1
        model.config.updated_at = datetime(2026, 1, 15, tzinfo=timezone.utc)
        model.query_rel.updated_at = datetime(2026, 1, 1, tzinfo=timezone.utc)

        with mock.patch("redash.services.model_config_generator.ModelConfigGenerator") as gen_mock:
            _refresh_stale_config(model)
            gen_mock.yaml.assert_not_called()

    def test_skips_refresh_for_table_based_models(self):
        """Table-based models (no query_id) should never trigger refresh."""
        from redash.plywood.hash_manager import _refresh_stale_config

        model = mock.MagicMock()
        model.query_id = None

        with mock.patch("redash.services.model_config_generator.ModelConfigGenerator") as gen_mock:
            _refresh_stale_config(model)
            gen_mock.yaml.assert_not_called()

    def test_skips_refresh_when_no_config(self):
        """Models without config should not crash."""
        from redash.plywood.hash_manager import _refresh_stale_config

        model = mock.MagicMock()
        model.query_id = 42
        model.config = None

        with mock.patch("redash.services.model_config_generator.ModelConfigGenerator") as gen_mock:
            _refresh_stale_config(model)
            gen_mock.yaml.assert_not_called()

    def test_get_data_cube_calls_refresh(self):
        """get_data_cube should trigger stale config check."""
        from redash.plywood.hash_manager import get_data_cube

        model = mock.MagicMock()
        model.query_id = None  # table-based, won't actually refresh

        with mock.patch("redash.plywood.hash_manager._refresh_stale_config") as refresh_mock:
            get_data_cube(model)
            refresh_mock.assert_called_once_with(model)
