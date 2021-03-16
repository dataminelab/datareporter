from redash.models import db
from redash.models.models import Model
from redash.utils.configuration import ConfigurationContainer
from tests import BaseTestCase

database_configuration = lambda: ConfigurationContainer.from_json(
    '{"dbname": "postgres", "user": "postgres", "host": "localhost", "port": 5432}')


class TestModelsCreateResource(BaseTestCase):

    def test_without_user(self):
        response = self.make_request(
            "post",
            "/api/models",
            data={"name": "Test Model", "data_source_id": 1},
        )

        self.assertEqual(403, response.status_code)

    def test_user_without_model_permission(self):
        response = self.make_request(
            "post",
            "/api/models",
            data={"name": "Test Model", "data_source_id": 1},
            user=self.factory.create_user()
        )

        self.assertEqual(403, response.status_code)

    def test_without_table(self):
        group = self.factory.create_group(permissions=["create_model"])
        db.session.commit()
        user = self.factory.create_admin(group_ids=[group.id])
        db.session.commit()

        response = self.make_request(
            "post",
            "/api/models",
            data={"name": "Test Model", "data_source_id": 1000},
            user=user
        )

        self.assertEqual(400, response.status_code)

    def test_not_existing_data_source(self):
        group = self.factory.create_group(permissions=["create_model"])
        db.session.commit()
        user = self.factory.create_admin(group_ids=[group.id])
        db.session.commit()

        response = self.make_request(
            "post",
            "/api/models",
            data={"name": "Test Model", "data_source_id": 1000, "table": "wikitracker"},
            user=user
        )

        self.assertEqual(404, response.status_code)

    def test_with_existing_data_source(self):
        data_source = self.factory.create_data_source(options=database_configuration)

        group = self.factory.create_group(permissions=["create_model"])
        db.session.commit()
        user = self.factory.create_admin(group_ids=[group.id])
        db.session.commit()

        response = self.make_request(
            "post",
            "/api/models",
            data={"name": "Test Model", "data_source_id": data_source.id, "table": "models"},
            user=user
        )

        self.assertEqual(200, response.status_code)


class TestModelsListResource(BaseTestCase):

    def test_without_user(self):
        response = self.make_request("get", "/api/models")

        self.assertEqual(403, response.status_code)

    def test_user_without_view_model_permission(self):
        response = self.make_request("get", "/api/models", user=self.factory.create_user(group_ids=[3]))

        self.assertEqual(403, response.status_code)

    def test_user_with_view_model_permission(self):
        group = self.factory.create_group(permissions=["view_model"])
        db.session.commit()
        user = self.factory.create_admin(group_ids=[group.id])
        db.session.commit()
        model = self.factory.create_model(user=user)

        response = self.make_request("get", "/api/models", user=user)

        assert len(response.json["results"]) == 1
        assert set([result["id"] for result in response.json["results"]]) == {model.id}


class TestModelsGetResource(BaseTestCase):
    def test_without_user(self):
        response = self.make_request("get", "/api/models/{}".format(1))

        self.assertEqual(403, response.status_code)

    def test_user_without_view_model_permission(self):
        user = self.factory.create_user()

        response = self.make_request("get", "/api/models/{}".format(1), user=user)

        self.assertEqual(403, response.status_code)

    def test_requires_user_with_view_model(self):
        group = self.factory.create_group(permissions=["view_model"])
        db.session.commit()
        user = self.factory.create_admin(group_ids=[group.id])
        db.session.commit()
        model = self.factory.create_model(user=user)
        db.session.flush()

        response = self.make_request("get", "/api/models/{}".format(model.id), user=user)

        self.assertEqual(200, response.status_code)
        self.assertEqual(model.id, response.json["id"])

    def test_not_existing_model(self):
        group = self.factory.create_group(permissions=["view_model"])
        db.session.commit()
        user = self.factory.create_admin(group_ids=[group.id])
        db.session.commit()

        response = self.make_request("get", "/api/models/{}".format(1000), user=user)

        self.assertEqual(404, response.status_code)


class TestModelsEditResource(BaseTestCase):
    def test_without_user(self):
        response = self.make_request("post", "/api/models/{}".format(1))

        self.assertEqual(403, response.status_code)

    def test_user_without_view_model_permission(self):
        user = self.factory.create_user()

        response = self.make_request("post", "/api/models/{}".format(1), user=user)

        self.assertEqual(403, response.status_code)

    def test_requires_owner_or_admin(self):
        group = self.factory.create_group(permissions=["edit_model"])
        db.session.commit()
        owner_user = self.factory.create_admin(group_ids=[group.id])
        current_user = self.factory.create_admin(group_ids=[group.id])

        model = self.factory.create_model(user=owner_user)
        db.session.flush()

        response = self.make_request(
            "post",
            "/api/models/{}".format(model.id),
            user=current_user,
            data={
                "name": "New Test Model Name"
            }
        )

        self.assertEqual(403, response.status_code)

    def test_requires_user_with_edit_model(self):
        group = self.factory.create_group(permissions=["edit_model"])
        db.session.commit()
        user = self.factory.create_admin(group_ids=[group.id])
        db.session.commit()
        model = self.factory.create_model(user=user)
        db.session.flush()

        response = self.make_request(
            "post",
            "/api/models/{}".format(model.id),
            user=user,
            data={
                "name": "New Test Model Name"
            }
        )

        self.assertEqual(200, response.status_code)
        self.assertEqual(model.id, response.json["id"])
        self.assertEqual("New Test Model Name", response.json["name"])

    def test_requires_existing_data_source(self):
        group = self.factory.create_group(permissions=["edit_model"])
        db.session.commit()
        user = self.factory.create_admin(group_ids=[group.id])
        db.session.commit()
        model = self.factory.create_model(user=user)
        db.session.flush()

        response = self.make_request(
            "post",
            "/api/models/{}".format(model.id),
            user=user,
            data={
                "name": "New Test Model Name",
                "data_source_id": 1212
            }
        )

        self.assertEqual(404, response.status_code)

    def test_with_existing_data_source(self):
        group = self.factory.create_group(permissions=["edit_model"])
        db.session.commit()
        user = self.factory.create_admin(group_ids=[group.id])
        db.session.commit()
        model = self.factory.create_model(user=user)
        data_source = self.factory.create_data_source()
        db.session.flush()

        response = self.make_request(
            "post",
            "/api/models/{}".format(model.id),
            user=user,
            data={
                "name": "New Test Model Name",
                "data_source_id": data_source.id
            }
        )

        self.assertEqual(200, response.status_code)

    def test_update_table(self):
        group = self.factory.create_group(permissions=["edit_model"])
        db.session.commit()
        user = self.factory.create_admin(group_ids=[group.id])
        db.session.commit()
        model = self.factory.create_model(user=user)
        data_source = self.factory.create_data_source(options=database_configuration)

        db.session.flush()

        response = self.make_request(
            "post",
            "/api/models/{}".format(model.id),
            user=user,
            data={
                "name": "New Test Model Name",
                "data_source_id": data_source.id,
                "table": "models"
            }
        )

        previous_table_column = Model.get_by_id(model.id).table_columns.filter_by(name="Some cool column").first()
        self.assertEqual(200, response.status_code)
        self.assertIsNone(previous_table_column)


class TestModelsDeleteResource(BaseTestCase):
    def test_not_existing_model(self):
        response = self.make_request("delete", "/api/models/{}".format(1))

        self.assertEqual(404, response.status_code)

    def test_user_is_not_owner(self):
        user = self.factory.create_user()
        model = self.factory.create_model(user=user)
        response = self.make_request("delete", "/api/models/{}".format(model.id), user=self.factory.create_user())

        self.assertEqual(403, response.status_code)

    def test_user_is_owner(self):
        user = self.factory.create_user()
        model = self.factory.create_model(user=user)
        response = self.make_request("delete", "/api/models/{}".format(model.id), user=user)

        self.assertEqual(204, response.status_code)
