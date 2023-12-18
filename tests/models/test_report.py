from redash.models.models import Report
from tests import BaseTestCase


class TestReports(BaseTestCase):
    def test_returns_by_id(self):
        report = self.factory.create_report()

        actual_report = Report.get_by_id(report.id)

        self.assertEqual(report, actual_report)

    def test_return_by_user(self):
        user = self.factory.create_user()
        report = self.factory.create_report(user=user)

        actual_report = Report.get_by_user(user)

        self.assertTrue(report.id in [m.id for m in actual_report])

    def test_returns_by_id_and_user(self):
        user = self.factory.create_user()
        report = self.factory.create_report(user=user)

        actual_report = Report.get_by_user_and_id(user=user, _id=report.id)

        self.assertEqual(report, actual_report)

