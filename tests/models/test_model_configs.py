from redash.models.models import ModelConfig
from tests import BaseTestCase


class TestModelConfigs(BaseTestCase):
    def test_returns_by_id(self):
        config = self.factory.create_model_config()

        actual_config = ModelConfig.get_by_id(config.id)

        self.assertEqual(config, actual_config)
