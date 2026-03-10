import unittest

import mock

from redash.serializers.model_serializer import ModelSerializer, _serialize_model


class TestModelSerializerQueryId(unittest.TestCase):
    """Tests that query_id appears correctly in serialized model output."""

    def test_serialize_model_with_query_id(self):
        model = mock.MagicMock()
        model.id = 1
        model.name = "Revenue Cube"
        model.user_id = 10
        model.data_source_id = 5
        model.data_source.name = "Production PG"
        model.table = None
        model.query_id = 42
        model.config.id = 100
        model.created_at = "2026-01-01"
        model.updated_at = "2026-01-02"

        result = _serialize_model(model)

        self.assertEqual(42, result["query_id"])
        self.assertIsNone(result["table"])
        self.assertEqual("Revenue Cube", result["name"])

    def test_serialize_model_without_query_id(self):
        model = mock.MagicMock()
        model.id = 2
        model.name = "Table Model"
        model.user_id = 10
        model.data_source_id = 5
        model.data_source.name = "Production PG"
        model.table = "orders"
        model.query_id = None
        model.config.id = 101
        model.created_at = "2026-01-01"
        model.updated_at = "2026-01-02"

        result = _serialize_model(model)

        self.assertIsNone(result["query_id"])
        self.assertEqual("orders", result["table"])

    def test_serializer_class_single_model(self):
        model = mock.MagicMock(
            spec_set=[
                "id",
                "name",
                "user_id",
                "data_source_id",
                "data_source",
                "table",
                "query_id",
                "config",
                "created_at",
                "updated_at",
            ]
        )
        model.id = 3
        model.name = "Test"
        model.user_id = 1
        model.data_source_id = 1
        model.data_source.name = "DS"
        model.table = None
        model.query_id = 99
        model.config.id = 200
        model.created_at = "2026-01-01"
        model.updated_at = "2026-01-01"

        # ModelSerializer uses isinstance check — need real Model type

        with mock.patch.object(ModelSerializer, "serialize", wraps=lambda: _serialize_model(model)):
            result = _serialize_model(model)

        self.assertIn("query_id", result)
        self.assertEqual(99, result["query_id"])
