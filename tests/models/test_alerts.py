from unittest import TestCase
from tests import BaseTestCase
from redash.models import Alert, db, next_state, OPERATORS


class TestAlertAll(BaseTestCase):
    def test_returns_all_alerts_for_given_groups(self):
        ds1 = self.factory.data_source
        group = self.factory.create_group()
        ds2 = self.factory.create_data_source(group=group)

        query1 = self.factory.create_query(data_source=ds1)
        query2 = self.factory.create_query(data_source=ds2)

        alert1 = self.factory.create_alert(query_rel=query1)
        alert2 = self.factory.create_alert(query_rel=query2)
        db.session.flush()

        alerts = Alert.all(group_ids=[group.id, self.factory.default_group.id])
        self.assertIn(alert1, alerts)
        self.assertIn(alert2, alerts)

        alerts = Alert.all(group_ids=[self.factory.default_group.id])
        self.assertIn(alert1, alerts)
        self.assertNotIn(alert2, alerts)

        alerts = Alert.all(group_ids=[group.id])
        self.assertNotIn(alert1, alerts)
        self.assertIn(alert2, alerts)

    def test_return_each_alert_only_once(self):
        group = self.factory.create_group()
        self.factory.data_source.add_group(group)

        alert = self.factory.create_alert()

        alerts = Alert.all(group_ids=[self.factory.default_group.id, group.id])
        self.assertEqual(1, len(list(alerts)))
        self.assertIn(alert, alerts)


def get_results(value):
    return {"rows": [{"foo": value}], "columns": [{"name": "foo", "type": "STRING"}]}


class TestAlertEvaluate(BaseTestCase):
    def create_alert(self, results, column="foo", value="1"):
        result = self.factory.create_query_result(data=results)
        query = self.factory.create_query(latest_query_data_id=result.id)
        alert = self.factory.create_alert(
            query_rel=query, options={"op": "equals", "column": column, "value": value}
        )
        return alert

    def test_evaluate_triggers_alert_when_equal(self):
        alert = self.create_alert(get_results(1))
        self.assertEqual(alert.evaluate(), Alert.TRIGGERED_STATE)

    def test_evaluate_number_value_and_string_threshold(self):
        alert = self.create_alert(get_results(1), value="string")
        self.assertEqual(alert.evaluate(), Alert.UNKNOWN_STATE)

    def test_evaluate_return_unknown_when_missing_column(self):
        alert = self.create_alert(get_results(1), column="bar")
        self.assertEqual(alert.evaluate(), Alert.UNKNOWN_STATE)

    def test_evaluate_return_unknown_when_empty_results(self):
        results = {"rows": [], "columns": [{"name": "foo", "type": "STRING"}]}
        alert = self.create_alert(results)
        self.assertEqual(alert.evaluate(), Alert.UNKNOWN_STATE)

    def test_evaluate_alerts_without_query_rel(self):
        query = self.factory.create_query(latest_query_data_id=None)
        alert = self.factory.create_alert(
            query_rel=query, options={"selector": "first", "op": "equals", "column": "foo", "value": "1"}
        )
        self.assertEqual(alert.evaluate(), Alert.UNKNOWN_STATE)

    def test_evaluate_return_unknown_when_value_is_none(self):
        alert = self.create_alert(get_results(None))
        self.assertEqual(alert.evaluate(), Alert.UNKNOWN_STATE)


class TestNextState(TestCase):
    def test_numeric_value(self):
        self.assertEqual(Alert.TRIGGERED_STATE, next_state(OPERATORS.get("=="), 1, "1"))
        self.assertEqual(
            Alert.TRIGGERED_STATE, next_state(OPERATORS.get("=="), 1, "1.0")
        )
        self.assertEqual(Alert.TRIGGERED_STATE, next_state(OPERATORS.get(">"), "5", 1))

    def test_numeric_value_and_plain_string(self):
        self.assertEqual(
            Alert.UNKNOWN_STATE, next_state(OPERATORS.get("=="), 1, "string")
        )

    def test_non_numeric_value(self):
        self.assertEqual(Alert.OK_STATE, next_state(OPERATORS.get("=="), "string", "1.0"))

    def test_string_value(self):
        self.assertEqual(
            Alert.TRIGGERED_STATE, next_state(OPERATORS.get("=="), "string", "string")
        )

    def test_boolean_value(self):
        self.assertEqual(
            Alert.TRIGGERED_STATE, next_state(OPERATORS.get("=="), False, "false")
        )
        self.assertEqual(
            Alert.TRIGGERED_STATE, next_state(OPERATORS.get("!="), False, "true")
        )
