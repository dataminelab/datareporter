import json
from sqlalchemy.orm.exc import NoResultFound
from redash.models import db
from redash.models.models import Report
from tests import BaseTestCase
import lzstring

EXPRESSION_BASE64 = "N4IgbglgzgrghgGwgLzgFwgewHYgFwhpwBGCApiADTjTxKoY4DKZaG2A5lPqAMaYIEcAA5QyAJUwB3bngBmiMQF9qGALZlkOCgQCiaXgHoAqgBUAwlRByICNGQBOsgNqg0AT2E7CEDVYdkcvg+fqq+ZAAKjlgAJi6gMTAO6Fi4BBEAjAAiVlD2wvgAtBmqnt5C9nkgSgC6Km5lwcSYAmRwuNQBQQTQAHJkUlZgiDBkLmgOozXU2Jho+AoIytMgUMJIaPGEjQR5DhCcVjHh2FCpwfww2BPuAJJQmLmYDvN4oF3BcDExZDFWHl5gmJ9mMjhAArxGGkQD8oLwyNhjodqF59pg/gRqtQkGoIK8AKwABnq20BuwmBw4YI0p3OPSgAEFZth3GpMDBuNQHi8eCAPgQvj8/qUyatoqDqMcIVDgrD4YjKVZUbFgliQDi8fh8bUueKtl1HAj4Z9vr8rHJnmp0LyAd4fgoYHYhiNvGrbcENHBYAFqithAdsL8siczjgXCBeAALdqBhBWbBwDRrODG6jQSTNeZ+gO/JjPV4gQVmpRAA="

EXPRESSION_OBJ = {
    "visualization": "table",
    "visualizationSettings": {
        "collapseRows": False
    },
    "timezone": "Etc/UTC",
    "filters": [
        {
            "type": "time",
            "ref": "time",
            "timePeriods": [
                {
                    "duration": "P1D",
                    "step": -1,
                    "type": "latest"
                }
            ]
        },
        {
            "type": "boolean",
            "ref": "isNew",
            "values": [
                True
            ],
            "not": False
        }
    ],
    "splits": [
        {
            "type": "string",
            "dimension": "countryIso",
            "sort": {
                "ref": "added",
                "type": "series",
                "direction": "descending",
                "period": ""
            },
            "limit": 50
        },
        {
            "type": "string",
            "dimension": "isAnonymous",
            "sort": {
                "ref": "added",
                "type": "series",
                "direction": "descending",
                "period": ""
            },
            "limit": 5
        }
    ],
    "series": [
        {
            "reference": "added",
            "format": {
                "type": "default",
                "value": ""
            },
            "type": "measure"
        }
    ],
    "pinnedDimensions": [
        "channel",
        "namespace",
        "isRobot"
    ],
    "pinnedSort": "added"
}

ANOTHER_BASE_64_OBJ = {
    'name': 'John'
}
parser = lzstring.LZString()

ANOTHER_BASE_64 = parser.compressToBase64(json.dumps(ANOTHER_BASE_64_OBJ, separators=(',', ':')))

NAME = "Test report"


class TestReportListCreateResource(BaseTestCase):

    def test_create_without_permission(self):
        group1 = self.factory.create_group(permissions=[""])
        user = self.factory.create_user(group_ids=[group1.id])

        response = self.make_request(
            "post",
            "/api/reports",
            data={"name": NAME, "model_id": 1, 'expression': EXPRESSION_BASE64},
            user=user
        )

        self.assertEqual(403, response.status_code)

    def test_create_bad_request_no_name(self):
        user = self.factory.create_user()

        response = self.make_request(
            "post",
            "/api/reports",
            data={"model_id": 1, 'expression': EXPRESSION_BASE64},
            user=user
        )

        self.assertEqual(400, response.status_code)

    def test_create_without_model_existing(self):
        user = self.factory.create_user()

        response = self.make_request(
            "post",
            "/api/reports",
            data={"name": NAME, "model_id": 1, 'expression': EXPRESSION_BASE64},
            user=user
        )

        self.assertEqual(404, response.status_code)

    def test_create_success(self):
        user = self.factory.create_user()
        model = self.factory.create_model(user=user)

        response = self.make_request(
            "post",
            "/api/reports",
            data={"name": NAME, "model_id": model.id, 'expression': EXPRESSION_BASE64},
            user=user
        )
        data = response.json
        self.assertEqual(200, response.status_code)
        self.assertTrue('id' in data)
        self.assertEqual(model.id, data['model_id'])
        self.assertEqual(EXPRESSION_BASE64, data['expression'])

    def test_create_success_formatting(self):
        user = self.factory.create_user()
        model = self.factory.create_model(user=user)

        response = self.make_request(
            "post",
            "/api/reports?format=json",
            data={"name": NAME, "model_id": model.id, 'expression': EXPRESSION_BASE64},
            user=user
        )
        data = response.json
        self.assertEqual(200, response.status_code)
        self.assertTrue('id' in data)
        self.assertEqual(model.id, data['model_id'])
        self.assertTrue(isinstance(data['expression'], dict))
        self.assertDictEqual(EXPRESSION_OBJ, data['expression'])


class TestReportListGetResource(BaseTestCase):

    def test_without_user_permission(self):
        group1 = self.factory.create_group(permissions=[""])
        db.session.flush()
        user = self.factory.create_user(group_ids=[group1.id])
        db.session.flush()

        response = self.make_request(
            "get",
            "/api/reports",
            user=user
        )

        self.assertEqual(403, response.status_code)

    def test_get_success(self):
        user = self.factory.create_user()
        model = self.factory.create_model(user=user)
        report = self.factory.create_report(user=user, model=model)

        response = self.make_request('get', '/api/reports', user=user)
        data = response.json

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(data['results']), 1)

        [self.assertEqual(x['id'], report.id) for x in data['results']]
        [self.assertEqual(x['model_id'], model.id) for x in data['results']]
        [self.assertTrue(isinstance(x['expression'], str)) for x in data['results']]

    def test_get_success_formatting(self):
        user = self.factory.create_user()

        model = self.factory.create_model(user=user)

        report = self.factory.create_report(user=user, model=model)

        response = self.make_request('get', '/api/reports?format=json', user=user)
        data = response.json

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(data['results']), 1)

        [self.assertEqual(x['id'], report.id) for x in data['results']]
        [self.assertEqual(x['model_id'], model.id) for x in data['results']]
        [self.assertTrue(isinstance(x['expression'], dict)) for x in data['results']]


class TestReportGetResource(BaseTestCase):

    def test_get_report_without_permission(self):
        group1 = self.factory.create_group(permissions=[""])
        user = self.factory.create_user(group_ids=[group1.id])
        report = self.factory.create_report(user=user)

        response = self.make_request('get', f'/api/reports/{report.id}')

        self.assertEqual(403, response.status_code)

    def test_get_report_does_not_exist(self):
        response = self.make_request('get', f'/api/reports/{20}')

        self.assertEqual(404, response.status_code)

    def test_get_report_success(self):
        report = self.factory.create_report()

        response = self.make_request('get', f'/api/reports/{report.id}')

        self.assertEqual(200, response.status_code)
        self.assertEqual(report.id, response.json['id'])
        self.assertTrue(isinstance(response.json['expression'], str))

    def test_get_report_success_formatting(self):
        report = self.factory.create_report()

        response = self.make_request('get', f'/api/reports/{report.id}?format=json')

        self.assertEqual(200, response.status_code)
        self.assertEqual(report.id, response.json['id'])
        self.assertTrue(isinstance(response.json['expression'], dict))


class TestReportEditResource(BaseTestCase):
    def test_edit_without_permission(self):
        group = self.factory.create_group(permissions=[""])
        user = self.factory.create_admin(group_ids=[group.id])
        report = self.factory.create_report(user=user)

        response = self.make_request(
            'post',
            f'/api/reports/{report.id}',
            data={"name": f'new {NAME}'},
            user=user
        )

        self.assertEqual(403, response.status_code)

    def test_edit_another_user_report(self):
        user1 = self.factory.create_user()
        user2 = self.factory.create_user()

        report = self.factory.create_report(user=user1)

        response = self.make_request(
            'post',
            f'/api/reports/{report.id}',
            data={"name": f'new {NAME}'},
            user=user2
        )

        self.assertEqual(403, response.status_code)

    def test_edit_report_does_not_exist(self):
        user = self.factory.create_user()

        response = self.make_request(
            'post',
            f'/api/reports/{100}',
            data={"name": f'new {NAME}'},
            user=user
        )

        self.assertEqual(404, response.status_code)

    def test_edit_model_does_not_exists(self):
        user = self.factory.create_user()
        report = self.factory.create_report(user=user)

        response = self.make_request(
            'post',
            f'/api/reports/{report.id}',
            data={'model_id': 200},
            user=user
        )

        self.assertEqual(400, response.status_code)

    def test_edit_using_another_user_model(self):
        user1 = self.factory.create_user()
        user2 = self.factory.create_user()
        model = self.factory.create_model(user=user1)

        report = self.factory.create_report(user=user2, model=model)

        response = self.make_request(
            'post',
            f'/api/reports/{report.id}',
            data={'model_id': model.id},
            user=user2
        )

        self.assertEqual(403, response.status_code)

    def test_edit_model_success(self):
        user = self.factory.create_user()
        model1 = self.factory.create_model(user=user)
        model2 = self.factory.create_model(user=user)

        report = self.factory.create_report(user=user, model=model1)

        response = self.make_request(
            'post',
            f'/api/reports/{report.id}',
            data={'model_id': model2.id, 'name': f'new name', 'expression': ANOTHER_BASE_64},
            user=user
        )

        refreshed_report = Report.get_by_id(report.id)

        data = response.json
        self.assertEqual(200, response.status_code)

        self.assertEqual(report.id, data['id'])
        self.assertEqual(report.id, data['id'])
        self.assertEqual(model2.id, data['model_id'])
        self.assertEqual('new name', data['name'])
        self.assertEqual(ANOTHER_BASE_64, data['expression'])

        self.assertEqual(refreshed_report.model_id, model2.id)
        self.assertEqual(refreshed_report.name, 'new name')
        self.assertEqual(refreshed_report.expression, ANOTHER_BASE_64_OBJ)

    def test_edit_model_success_formatting(self):
        user = self.factory.create_user()
        model1 = self.factory.create_model(user=user)
        model2 = self.factory.create_model(user=user)

        report = self.factory.create_report(user=user, model=model1)

        response = self.make_request(
            'post',
            f'/api/reports/{report.id}?format=json',
            data={'model_id': model2.id, 'name': f'new name'},
            user=user
        )

        self.assertEqual(200, response.status_code)
        self.assertTrue(isinstance(response.json['expression'], dict))


class TestReportDeleteResource(BaseTestCase):
    def test_delete_without_permission(self):
        group = self.factory.create_group(permissions=[""])
        user = self.factory.create_user(group_ids=[group.id])
        report = self.factory.create_report(user=user)

        response = self.make_request('delete', f'/api/reports/{report.id}', user=user)

        self.assertEqual(403, response.status_code)

    def test_user_not_owner(self):
        user1 = self.factory.create_user()
        user2 = self.factory.create_user()

        report = self.factory.create_report(user=user1)

        response = self.make_request('delete', f'/api/reports/{report.id}', user=user2)

        self.assertEqual(403, response.status_code)

    def test_delete_does_not_exists(self):
        user = self.factory.create_user()

        response = self.make_request('delete', f'/api/reports/{100}', user=user)

        self.assertEqual(404, response.status_code)

    def test_delete_success(self):
        user = self.factory.create_user()
        report = self.factory.create_report(user=user)

        response = self.make_request('delete', f'/api/reports/{report.id}', user=user)

        with self.assertRaises(NoResultFound) as _:
            Report.get_by_id(report.id)

        self.assertEqual(204, response.status_code)
