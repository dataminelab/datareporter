from redash.serializers.model_serializer import ModelConfigSerializer
from tests import BaseTestCase


class TestModelConfigSerializer(BaseTestCase):
    def test_serializes_needed_properties(self):
        model = self.factory.create_model()
        config = self.factory.create_model_config(model=model)

        serializer = ModelConfigSerializer(config)
        serialized = serializer.serialize()

        self.assertSetEqual({"id", "content", "user_id", "model_id", "created_at", "updated_at"},
                            set(serialized.keys()))
