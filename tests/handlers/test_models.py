from unittest import mock

from redash.models import db
from redash.models.model_config import ModelConfig
from tests import BaseTestCase


class TestModelsCreateResource(BaseTestCase):
    def test_user_without_model_permission(self):
        group1 = self.factory.create_group(org=self.factory.create_org(), permissions=[""])
        db.session.flush()
        user = self.factory.create_user(group_ids=[group1.id])
        db.session.flush()
        response = self.make_request(
            "post", "/api/models", data={"name": "Test Model", "data_source_id": 1, "table": "users"}, user=user
        )

        self.assertEqual(403, response.status_code)

    def test_without_table(self):
        group = self.factory.create_group(permissions=["create_model"])
        db.session.commit()
        user = self.factory.create_admin(group_ids=[group.id])
        db.session.commit()

        response = self.make_request(
            "post", "/api/models", data={"name": "Test Model", "data_source_id": 1000}, user=user
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
              - name: time
                type: TIME
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
            data={"name": "Test Model", "data_source_id": data_source.id, "table": "models", "content": content},
            user=user,
        )
        config_id = response.json["model_config_id"]
        config: ModelConfig = ModelConfig.query.get(config_id)

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
            user=user,
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
            user=user,
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

    def test_user_with_data_source_id(self):
        group = self.factory.create_group(permissions=["view_model"])
        db.session.commit()
        user = self.factory.create_admin(group_ids=[group.id])
        db.session.commit()
        model_1 = self.factory.create_model(user=user)
        self.factory.create_model(user=user)
        db.session.commit()

        response = self.make_request("get", f"/api/models?data_source={model_1.data_source_id}", user=user)

        assert len(response.json["results"]) == 1

    def test_user_with_data_source_id_does_not_exists(self):
        group = self.factory.create_group(permissions=["view_model"])
        db.session.commit()
        user = self.factory.create_admin(group_ids=[group.id])
        db.session.commit()
        self.factory.create_model(user=user)
        self.factory.create_model(user=user)
        db.session.commit()
        response = self.make_request("get", "/api/models?data_source=10", user=user)

        assert len(response.json["results"]) == 0


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
            "post", "/api/models/{}".format(model.id), user=current_user, data={"name": "New Test Model Name"}
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
            "post", "/api/models/{}".format(model.id), user=user, data={"name": "New Test Model Name"}
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
            data={"name": "New Test Model Name", "data_source_id": data_source.id},
        )

        self.assertEqual(200, response.status_code)


class TestModelsCreateWithQueryResource(BaseTestCase):
    """Tests for query-based model creation (SQL-powered OLAP cubes)."""

    @mock.patch("redash.services.model_config_generator.ModelConfigGenerator.yaml", return_value="")
    def test_create_model_with_query_id(self, _content):
        data_source = self.factory.create_data_source()
        db.session.commit()
        group = self.factory.create_group(permissions=["create_model"])
        db.session.commit()
        user = self.factory.create_admin(group_ids=[group.id])
        db.session.commit()

        query = self.factory.create_query(data_source=data_source)
        db.session.commit()

        response = self.make_request(
            "post",
            "/api/models",
            data={"name": "Query Model", "data_source_id": data_source.id, "query_id": query.id},
            user=user,
        )

        self.assertEqual(200, response.status_code)
        self.assertEqual(query.id, response.json["query_id"])
        self.assertIsNone(response.json["table"])

    def test_rejects_both_table_and_query_id(self):
        data_source = self.factory.create_data_source()
        db.session.commit()
        group = self.factory.create_group(permissions=["create_model"])
        db.session.commit()
        user = self.factory.create_admin(group_ids=[group.id])
        db.session.commit()

        query = self.factory.create_query(data_source=data_source)
        db.session.commit()

        response = self.make_request(
            "post",
            "/api/models",
            data={
                "name": "Bad Model",
                "data_source_id": data_source.id,
                "table": "users",
                "query_id": query.id,
            },
            user=user,
        )

        self.assertEqual(400, response.status_code)

    def test_rejects_neither_table_nor_query_id(self):
        group = self.factory.create_group(permissions=["create_model"])
        db.session.commit()
        user = self.factory.create_admin(group_ids=[group.id])
        db.session.commit()

        response = self.make_request(
            "post",
            "/api/models",
            data={"name": "Bad Model", "data_source_id": 1000},
            user=user,
        )

        self.assertEqual(400, response.status_code)

    @mock.patch("redash.services.model_config_generator.ModelConfigGenerator.yaml", return_value="")
    def test_rejects_nonexistent_query_id(self, _content):
        data_source = self.factory.create_data_source()
        db.session.commit()
        group = self.factory.create_group(permissions=["create_model"])
        db.session.commit()
        user = self.factory.create_admin(group_ids=[group.id])
        db.session.commit()

        response = self.make_request(
            "post",
            "/api/models",
            data={"name": "Bad Model", "data_source_id": data_source.id, "query_id": 99999},
            user=user,
        )

        self.assertEqual(404, response.status_code)

    @mock.patch("redash.services.model_config_generator.ModelConfigGenerator.yaml", return_value="")
    def test_rejects_query_from_different_data_source(self, _content):
        ds1 = self.factory.create_data_source()
        ds2 = self.factory.create_data_source()
        db.session.commit()
        group = self.factory.create_group(permissions=["create_model"])
        db.session.commit()
        user = self.factory.create_admin(group_ids=[group.id])
        db.session.commit()

        query = self.factory.create_query(data_source=ds2)
        db.session.commit()

        response = self.make_request(
            "post",
            "/api/models",
            data={"name": "Bad Model", "data_source_id": ds1.id, "query_id": query.id},
            user=user,
        )

        self.assertEqual(400, response.status_code)


class TestModelsEditWithQueryResource(BaseTestCase):
    """Tests for editing query-based models."""

    @mock.patch("redash.services.model_config_generator.ModelConfigGenerator.yaml", return_value="")
    def test_update_query_id(self, _content):
        group = self.factory.create_group(permissions=["edit_model"])
        db.session.commit()
        user = self.factory.create_admin(group_ids=[group.id])
        db.session.commit()

        data_source = self.factory.create_data_source()
        query = self.factory.create_query(data_source=data_source)
        model = self.factory.create_model(user=user, data_source=data_source)
        db.session.flush()

        response = self.make_request(
            "post",
            "/api/models/{}".format(model.id),
            user=user,
            data={"query_id": query.id},
        )

        self.assertEqual(200, response.status_code)
        self.assertEqual(query.id, response.json["query_id"])

    @mock.patch("redash.services.model_config_generator.ModelConfigGenerator.yaml", return_value="")
    def test_warns_about_downstream_reports(self, _content):
        group = self.factory.create_group(permissions=["edit_model"])
        db.session.commit()
        user = self.factory.create_admin(group_ids=[group.id])
        db.session.commit()

        data_source = self.factory.create_data_source()
        query1 = self.factory.create_query(data_source=data_source)
        query2 = self.factory.create_query(data_source=data_source)
        model = self.factory.create_model(user=user, data_source=data_source, query_id=query1.id)
        self.factory.create_report(model=model, user=user, data_source_id=data_source.id)
        db.session.flush()

        response = self.make_request(
            "post",
            "/api/models/{}".format(model.id),
            user=user,
            data={"query_id": query2.id},
        )

        self.assertEqual(200, response.status_code)
        self.assertIn("_warnings", response.json)
        self.assertIn("1 report(s)", response.json["_warnings"][0])


class TestModelQueriesResource(BaseTestCase):
    """Tests for the query picker endpoint."""

    def test_returns_queries_for_data_source(self):
        group = self.factory.create_group(permissions=["create_model"])
        db.session.commit()
        user = self.factory.create_admin(group_ids=[group.id])
        db.session.commit()

        data_source = self.factory.create_data_source()
        q1 = self.factory.create_query(data_source=data_source, name="Revenue Report", is_draft=False)
        q2 = self.factory.create_query(data_source=data_source, name="User Stats", is_draft=False)
        db.session.commit()

        response = self.make_request(
            "get",
            "/api/models/queries?data_source_id={}".format(data_source.id),
            user=user,
        )

        self.assertEqual(200, response.status_code)
        self.assertEqual(2, response.json["count"])
        names = {r["name"] for r in response.json["results"]}
        self.assertIn("Revenue Report", names)
        self.assertIn("User Stats", names)

    def test_excludes_archived_and_draft_queries(self):
        group = self.factory.create_group(permissions=["create_model"])
        db.session.commit()
        user = self.factory.create_admin(group_ids=[group.id])
        db.session.commit()

        data_source = self.factory.create_data_source()
        self.factory.create_query(data_source=data_source, name="Active", is_draft=False, is_archived=False)
        self.factory.create_query(data_source=data_source, name="Draft", is_draft=True)
        self.factory.create_query(data_source=data_source, name="Archived", is_draft=False, is_archived=True)
        db.session.commit()

        response = self.make_request(
            "get",
            "/api/models/queries?data_source_id={}".format(data_source.id),
            user=user,
        )

        self.assertEqual(200, response.status_code)
        self.assertEqual(1, response.json["count"])
        self.assertEqual("Active", response.json["results"][0]["name"])

    def test_requires_data_source_id_parameter(self):
        group = self.factory.create_group(permissions=["create_model"])
        db.session.commit()
        user = self.factory.create_admin(group_ids=[group.id])
        db.session.commit()

        response = self.make_request("get", "/api/models/queries", user=user)
        self.assertEqual(400, response.status_code)


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
