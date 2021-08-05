import unittest

from redash.plywood.objects.plywood_value import PlywoodValue

test_data = {
    "attributes": [
        {"name": "main", "type": "DATASET"},
        {"name": "MillisecondsInInterval", "type": "NUMBER"},
        {"name": "added", "type": "NUMBER"},
        {"name": "SPLIT", "type": "DATASET"}
    ],
    "data": [
        {
            "MillisecondsInInterval": 86400000,
            "added": 38587,
            "SPLIT": {
                "keys": ["isNew"],
                "attributes": [
                    {"name": "isNew", "type": "BOOLEAN"},
                    {"name": "main", "type": "DATASET"},
                    {"name": "added", "type": "NUMBER"},
                    {"name": "SPLIT", "type": "DATASET"}],
                "data": [
                    {
                        "isNew": False,
                        "added": 37035,
                        "SPLIT": {
                            "keys": ["isAnonymous"],
                            "attributes": [
                                {"name": "isAnonymous", "type": "BOOLEAN"},
                                {"name": "main", "type": "DATASET"},
                                {"name": "added", "type": "NUMBER"}
                            ],
                            "data": [
                                {"isAnonymous": True, "added": 37035}
                            ]}
                    },
                    {
                        "isNew": True,
                        "added": 1552,
                        "SPLIT": {
                            "keys": ["isAnonymous"],
                            "attributes": [
                                {"name": "isAnonymous", "type": "BOOLEAN"},
                                {"name": "main", "type": "DATASET"},
                                {"name": "added", "type": "NUMBER"}
                            ],
                            "data": [
                                {"isAnonymous": True, "added": 1552}
                            ]}
                    }]
            }}
    ]
}


class TestPlywoodValue(unittest.TestCase):
    def test_from_to(self):
        data = PlywoodValue.from_json(test_data)

        self.assertListEqual([a.dict() for a in data.attributes], test_data['attributes'])
        self.assertEqual(data.keys, None)
        self.assertEqual(data.dict(), test_data)
