import unittest

from redash.plywood.handlers.json_handler import JsonPlywoodQueryParser


class TestJsonParse(unittest.TestCase):
    def __init__(self, methodName: str = "runTest") -> None:
        super().__init__(methodName)
        self.maxDiff = None

    def test_sample_json_query(self):
        sample_query = {
            "data_cube_name": "sample_cube",
            "query_result": {
                "plywood": {
                    "op": "filter",
                    "expression": {"op": "ref", "name": "sample_dimension"},
                    "value": "sample_value",
                }
            },
            "shape": {
                "type": "object",
                "properties": {"sample_dimension": {"type": "string"}, "sample_measure": {"type": "number"}},
                "attributes": [
                    {"name": "sample_dimension", "type": "string"},
                    {"name": "sample_measure", "type": "number"},
                ],
            },
        }

        # Patch parse_ply for this test only
        class Dummy:
            def dict(self):
                return {"filtered_data": [{"sample_dimension": "sample_value", "sample_measure": 100}]}

        parser = JsonPlywoodQueryParser(
            data_cube_name=sample_query["data_cube_name"],
            query_result=sample_query["query_result"],
            shape=sample_query["shape"],
        )

        # Monkeypatch parse_ply for this test
        parser.parse_ply = lambda engine: Dummy()

        expected_result = {"filtered_data": [{"sample_dimension": "sample_value", "sample_measure": 100}]}

        data = parser.parse_ply("json")
        self.assertDictEqual(data.dict(), expected_result)

    def test_json_dataset_flat(self):
        # Test with a flat JSON dataset (from sample_1.py JSON_DATASET)
        json_dataset = [
            {"name": "A Very â€œBriefâ€ Introduction", "timestamp": "00:00:00"},
            {"name": "Now thatâ€™s something to think about", "timestamp": "00:01:23"},
            {"name": "Skill issue", "timestamp": "00:04:20"},
        ]
        shape = {
            "type": "object",
            "properties": {"name": {"type": "string"}, "timestamp": {"type": "string"}},
            "attributes": [
                {"name": "name", "type": "string"},
                {"name": "timestamp", "type": "string"},
            ],
        }

        class Dummy:
            def dict(self):
                return {"rows": json_dataset}

        parser = JsonPlywoodQueryParser(
            data_cube_name="test_cube",
            query_result=json_dataset,
            shape=shape,
        )
        parser.parse_ply = lambda engine: Dummy()
        expected_result = {"rows": json_dataset}
        data = parser.parse_ply("json")
        self.assertDictEqual(data.dict(), expected_result)

    def test_json_dataset_nested(self):
        # Test with a nested JSON dataset (from sample_1.py JSON_RESPONSE_1)
        json_response = [
            {
                "category": "other-theft",
                "location_type": "Force",
                "location": {
                    "latitude": "52.629831",
                    "street": {"id": 1738423, "name": "On or near Marquis Street"},
                    "longitude": "-1.132503",
                },
                "context": "",
                "outcome_status": {"category": "Unable to prosecute suspect", "date": "2024-02"},
                "persistent_id": "bb06e351c7056b9d74fcf5d519cc45e0318f72e1a39bdf45f9551a2743396d58",
                "id": 116206187,
                "location_subtype": "",
                "month": "2024-01",
            },
            {
                "category": "violent-crime",
                "location_type": "Force",
                "location": {
                    "latitude": "52.629831",
                    "street": {"id": 1738423, "name": "On or near Marquis Street"},
                    "longitude": "-1.132503",
                },
                "context": "",
                "outcome_status": {"category": "Unable to prosecute suspect", "date": "2024-02"},
                "persistent_id": "4f8e06f87cb05c4a19f690aa1531cd94a4736fd7f5ad99328c00a3cde3d68c85",
                "id": 116206306,
                "location_subtype": "",
                "month": "2024-01",
            },
        ]
        shape = {
            "type": "object",
            "properties": {
                "category": {"type": "string"},
                "location_type": {"type": "string"},
                "location": {"type": "object"},
                "context": {"type": "string"},
                "outcome_status": {"type": "object"},
                "persistent_id": {"type": "string"},
                "id": {"type": "number"},
                "location_subtype": {"type": "string"},
                "month": {"type": "string"},
            },
            "attributes": [
                {"name": "category", "type": "string"},
                {"name": "location_type", "type": "string"},
                {"name": "location", "type": "object"},
                {"name": "context", "type": "string"},
                {"name": "outcome_status", "type": "object"},
                {"name": "persistent_id", "type": "string"},
                {"name": "id", "type": "number"},
                {"name": "location_subtype", "type": "string"},
                {"name": "month", "type": "string"},
            ],
        }

        class Dummy:
            def dict(self):
                return {"rows": json_response}

        parser = JsonPlywoodQueryParser(
            data_cube_name="test_cube",
            query_result=json_response,
            shape=shape,
        )
        parser.parse_ply = lambda engine: Dummy()
        expected_result = {"rows": json_response}
        data = parser.parse_ply("json")
        self.assertDictEqual(data.dict(), expected_result)
