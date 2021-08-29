from redash.models.models import Model
from tests import BaseTestCase


class TestModels(BaseTestCase):
    def test_returns_by_id(self):
        model = self.factory.create_model()

        actual_model = Model.get_by_id(model.id)

        self.assertEqual(model, actual_model)

    def test_returns_by_user(self):
        user = self.factory.create_user()
        model = self.factory.create_model(user=user)

        actual_model = Model.get_by_user(user=user)

        self.assertTrue(model.id in [m.id for m in actual_model])

    def test_returns_by_id_and_user(self):
        user = self.factory.create_user()
        model = self.factory.create_model(user=user)

        actual_model = Model.get_by_id_and_user(_id=model.id, user=user)

        self.assertEqual(model, actual_model)

    def test_returns_by_data_source_id(self):
        user_1 = self.factory.create_user()
        user_2 = self.factory.create_user()
        data_source_1 = self.factory.create_data_source()
        data_source_2 = self.factory.create_data_source()
        model_1 = self.factory.create_model(user=user_1, data_source=data_source_1)
        model_2 = self.factory.create_model(user=user_1, data_source=data_source_1)
        model_3 = self.factory.create_model(user=user_2, data_source=data_source_1)
        model_4 = self.factory.create_model(user=user_2, data_source=data_source_2)

        models = Model.get_by_data_source(data_source_id=data_source_1.id)

        self.assertListEqual(models, [model_1, model_2, model_3])
