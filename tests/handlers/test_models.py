from unittest import mock

from redash.models.models import ModelConfig
from tests import BaseTestCase
from redash.models import db


class TestModelsCreateResource(BaseTestCase):

    def test_user_without_model_permission(self):
        group1 = self.factory.create_group(
            org=self.factory.create_org(), permissions=[""]
        )
        db.session.flush()
        user = self.factory.create_user(
            group_ids=[group1.id]
        )
        db.session.flush()
        response = self.make_request(
            "post",
            "/api/models",
            data={"name": "Test Model", "data_source_id": 1, 'table': 'users'},
            user=user
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

    def test_with_context_provided(self):
        data_source = self.factory.create_data_source()
        db.session.commit()
        group = self.factory.create_group(permissions=["create_model"])
        db.session.commit()
        user = self.factory.create_user(group_ids=[group.id])
        db.session.commit()

        content = """
        dataCubes:
          - name: users
            title: Users
            timeAttribute: time
            clusterName: native
            defaultSortMeasure: id
            defaultSelectedMeasures:
              - id
            attributes:
              - name: api_key
                type: CHARACTER VARYING
              - name: created_at
                type: TIMESTAMP WITH TIME ZONE
              - name: details
                type: JSON
              - name: disabled_at
                type: TIMESTAMP WITH TIME ZONE
              - name: email
                type: CHARACTER VARYING
              - name: groups
                type: ARRAY
              - name: id
                type: NUMBER
              - name: name
                type: CHARACTER VARYING
              - name: org_id
                type: NUMBER
              - name: password_hash
                type: CHARACTER VARYING
              - name: profile_image_url
                type: CHARACTER VARYING
              - name: updated_at
                type: TIMESTAMP WITH TIME ZONE
            dimensions:
              - name: api_key
                title: Api Key
                formula: $api_key
              - name: created_at
                title: Created At
                formula: $created_at
              - name: details
                title: Details
                formula: $details
              - name: disabled_at
                title: Disabled At
                formula: $disabled_at
              - name: email
                title: Email
                formula: $email
              - name: groups
                title: Groups
                formula: $groups
              - name: name
                title: Name
                formula: $name
              - name: password_hash
                title: Password Hash
                formula: $password_hash
              - name: profile_image_url
                title: Profile Image Url
                formula: $profile_image_url
              - name: updated_at
                title: Updated At
                formula: $updated_at
            measures:
              - name: id
                title: Id
                formula: $main.sum($id)
              - name: org_id
                title: Org
                formula: $main.sum($org_id)

        """

        response = self.make_request(
            "post",
            "/api/models",
            data={"name": "Test Model", "data_source_id": data_source.id, "table": "models", 'content': content},
            user=user
        )
        config_id = response.json['model_config_id']
        config:ModelConfig = ModelConfig.query.get(config_id)

        self.assertEqual(200, response.status_code)
        self.assertEqual(config.content, content)

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

    @mock.patch("redash.services.model_config_generator.ModelConfigGenerator.yaml", return_value="")
    def test_with_existing_data_source(self, content):
        data_source = self.factory.create_data_source()

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

    @mock.patch("redash.services.model_config_generator.ModelConfigGenerator.yaml", return_value="")
    def test_requires_user_with_edit_model(self, content):
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

    @mock.patch("redash.services.model_config_generator.ModelConfigGenerator.yaml", return_value="")
    def test_with_existing_data_source(self, content):
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
