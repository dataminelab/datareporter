from redash.serializers.model_serializer import ModelSerializer
from tests import BaseTestCase


class TestModelSerializer(BaseTestCase):
    def test_serializes_needed_properties(self):
        model = self.factory.create_model()
        serializer = ModelSerializer(model)
        serialized = serializer.serialize()

        self.assertSetEqual({"id",
                             "name",
                             "user_id",
                             "data_source_id",
                             "data_source_name",
                             "model_config_id",
                             "table",
                             "created_at",
                             "updated_at"}, set(serialized.keys()))
