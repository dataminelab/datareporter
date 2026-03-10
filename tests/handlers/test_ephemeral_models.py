from unittest.mock import patch

from redash.models import db
from tests import BaseTestCase


class TestEphemeralModelResource(BaseTestCase):
    def test_creates_model_from_query(self):
        query = self.factory.create_query()
        db.session.flush()

        with patch("redash.handlers.models.ModelConfigGenerator") as mock_gen:
            mock_gen.yaml.return_value = "dataCubes: []"
            response = self.make_request(
                "post",
                "/api/models/ephemeral",
                data={"query_id": query.id, "data_source_id": query.data_source_id},
            )

        self.assertEqual(200, response.status_code)
        self.assertIn("[AI Explore]", response.json["name"])

    def test_rejects_missing_query_id(self):
        response = self.make_request(
            "post",
            "/api/models/ephemeral",
            data={"data_source_id": 1},
        )

        self.assertEqual(400, response.status_code)

    def test_rejects_missing_data_source_id(self):
        response = self.make_request(
            "post",
            "/api/models/ephemeral",
            data={"query_id": 1},
        )

        self.assertEqual(400, response.status_code)

    def test_rejects_nonexistent_query(self):
        response = self.make_request(
            "post",
            "/api/models/ephemeral",
            data={"query_id": 99999, "data_source_id": 1},
        )

        self.assertEqual(404, response.status_code)

    def test_rejects_mismatched_data_source(self):
        query = self.factory.create_query()
        other_ds = self.factory.create_data_source()
        db.session.flush()

        response = self.make_request(
            "post",
            "/api/models/ephemeral",
            data={"query_id": query.id, "data_source_id": other_ds.id},
        )

        self.assertEqual(400, response.status_code)

    def test_requires_create_model_permission(self):
        group = self.factory.create_group(org=self.factory.create_org(), permissions=[""])
        db.session.flush()
        user = self.factory.create_user(group_ids=[group.id])
        db.session.flush()

        response = self.make_request(
            "post",
            "/api/models/ephemeral",
            data={"query_id": 1, "data_source_id": 1},
            user=user,
        )

        self.assertEqual(403, response.status_code)
