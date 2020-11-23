from redash.models import db
from tests import BaseTestCase


class TestModelsConfigCreateResource(BaseTestCase):

    def test_without_user(self):
        response = self.make_request(
            "post",
            "/api/models/1/config",
            data={"content": "dataCube: 12"},
        )

        self.assertEqual(403, response.status_code)

    def test_user_without_model_permission(self):
        response = self.make_request(
            "post",
            "/api/models/1/config",
            data={"content": "dataCube: 12"},
            user=self.factory.create_user()
        )

        self.assertEqual(403, response.status_code)

    def test_not_existing_model(self):
        group = self.factory.create_group(permissions=["edit_model_config"])
        db.session.commit()
        user = self.factory.create_admin(group_ids=[group.id])
        db.session.commit()

        response = self.make_request(
            "post",
            "/api/models/100/config",
            data={"content": "dataCube: 12"},
            user=user
        )

        self.assertEqual(404, response.status_code)

    def test_model_without_config(self):
        group = self.factory.create_group(permissions=["edit_model_config"])
        db.session.commit()
        user = self.factory.create_admin(group_ids=[group.id])
        model = self.factory.create_model(user=user)
        db.session.commit()

        response = self.make_request(
            "post",
            "/api/models/{}/config".format(model.id),
            data={"content": "key: 213"},
            user=user
        )

        self.assertEqual(200, response.status_code)
        self.assertEqual("key: 213", response.json['content'])

    def test_model_with_config(self):
        group = self.factory.create_group(permissions=["edit_model_config"])
        db.session.commit()
        user = self.factory.create_admin(group_ids=[group.id])
        model = self.factory.create_model(user=user)
        config = self.factory.create_model_config(model=model)
        db.session.commit()

        response = self.make_request(
            "post",
            "/api/models/{}/config".format(model.id),
            data={"content": "key: 314324"},
            user=user
        )

        self.assertEqual(200, response.status_code)
        self.assertEqual("key: 314324", response.json['content'])
