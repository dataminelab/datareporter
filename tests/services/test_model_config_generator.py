import unittest

import mock
import yaml

from redash.services.model_config_generator import ModelConfigGenerator


class TestModelConfigGenerator(unittest.TestCase):
    @mock.patch("redash.models.models.Model")
    def test_yaml(self, mock_model):
        with mock.patch("redash.plywood.plywood.PlywoodApi.convert_attributes") as parser:
            parser.return_value = [
                {"nativeType": "FLOAT", "name": "deltaByTen", "type": "NUMBER", "isSupported": True},
                {"nativeType": "INTEGER", "name": "deleted", "type": "NUMBER", "isSupported": True},
                {"nativeType": "STRING", "name": "regionName", "type": "STRING", "isSupported": True},
                {"nativeType": "STRING", "name": "user", "type": "STRING", "isSupported": True},
                {"nativeType": "STRING", "name": "regionIsoCode", "type": "STRING", "isSupported": True},
                {"nativeType": "INTEGER", "name": "metroCode", "type": "NUMBER", "isSupported": True},
                {"nativeType": "STRING", "name": "namespace", "type": "STRING", "isSupported": True},
                {"name": "isNew", "type": "BOOLEAN", "nativeType": "BOOLEAN", "isSupported": True},
                {"nativeType": "INTEGER", "name": "deltaBucket100", "type": "NUMBER", "isSupported": True},
                {"nativeType": "STRING", "name": "page", "type": "STRING", "isSupported": True},
                {"nativeType": "TIMESTAMP", "name": "time", "type": "TIME", "isSupported": True},
                {"nativeType": "STRING", "name": "comment", "type": "STRING", "isSupported": True},
                {"name": "isMinor", "type": "BOOLEAN", "nativeType": "BOOLEAN", "isSupported": True},
                {"nativeType": "STRING", "name": "countryIsoCode", "type": "STRING", "isSupported": True},
                {"nativeType": "INTEGER", "name": "delta", "type": "NUMBER", "isSupported": True},
                {"nativeType": "STRING", "name": "countryName", "type": "STRING", "isSupported": True},
                {"name": "isUnpatrolled", "type": "BOOLEAN", "nativeType": "BOOLEAN", "isSupported": True},
                {"name": "isRobot", "type": "BOOLEAN", "nativeType": "BOOLEAN", "isSupported": True},
                {"nativeType": "INTEGER", "name": "commentLength", "type": "NUMBER", "isSupported": True},
                {"name": "isAnonymous", "type": "BOOLEAN", "nativeType": "BOOLEAN", "isSupported": True},
                {"nativeType": "STRING", "name": "cityName", "type": "STRING", "isSupported": True},
                {"nativeType": "INTEGER", "name": "added", "type": "NUMBER", "isSupported": True},
                {"nativeType": "STRING", "name": "userChars", "type": "STRING", "isSupported": True},
                {"nativeType": "STRING", "name": "channel", "type": "STRING", "isSupported": True},
                {"nativeType": "TIMESTAMP", "name": "sometimeLater", "type": "TIME", "isSupported": True},
            ]

            mock_model.table = "wikiticker"
            mock_model.data_source.type = "bigquery"
            mock_model.data_source.get_schema = lambda refresh: [
                {
                    "name": "wikiticker",
                    "columns": [
                        {"name": "deltaByTen", "type": "FLOAT"},
                        {"name": "deleted", "type": "INTEGER"},
                        {"name": "regionName", "type": "STRING"},
                        {"name": "user", "type": "STRING"},
                        {"name": "regionIsoCode", "type": "STRING"},
                        {"name": "metroCode", "type": "INTEGER"},
                        {"name": "namespace", "type": "STRING"},
                        {"name": "isNew", "type": "BOOLEAN"},
                        {"name": "deltaBucket100", "type": "INTEGER"},
                        {"name": "page", "type": "STRING"},
                        {"name": "time", "type": "TIMESTAMP"},
                        {"name": "comment", "type": "STRING"},
                        {"name": "isMinor", "type": "BOOLEAN"},
                        {"name": "countryIsoCode", "type": "STRING"},
                        {"name": "delta", "type": "INTEGER"},
                        {"name": "countryName", "type": "STRING"},
                        {"name": "isUnpatrolled", "type": "BOOLEAN"},
                        {"name": "isRobot", "type": "BOOLEAN"},
                        {"name": "commentLength", "type": "INTEGER"},
                        {"name": "isAnonymous", "type": "BOOLEAN"},
                        {"name": "cityName", "type": "STRING"},
                        {"name": "added", "type": "INTEGER"},
                        {"name": "userChars", "type": "STRING"},
                        {"name": "channel", "type": "STRING"},
                        {"name": "sometimeLater", "type": "TIMESTAMP"},
                    ],
                }
            ]

            actual_yaml = ModelConfigGenerator.yaml(model=mock_model, refresh=True)

        expected_yaml = """dataCubes:
  - name: wikiticker

    title: Wikiticker

    timeAttribute: time

    clusterName: native

    defaultSortMeasure: deltaByTen

    defaultSelectedMeasures:
      - deltaByTen

    attributes:

      - name: deltaByTen
        type: NUMBER
        nativeType: FLOAT

      - name: deleted
        type: NUMBER
        nativeType: INTEGER

      - name: regionName
        type: STRING
        nativeType: STRING

      - name: user
        type: STRING
        nativeType: STRING

      - name: regionIsoCode
        type: STRING
        nativeType: STRING

      - name: metroCode
        type: NUMBER
        nativeType: INTEGER

      - name: namespace
        type: STRING
        nativeType: STRING

      - name: isNew
        type: BOOLEAN
        nativeType: BOOLEAN

      - name: deltaBucket100
        type: NUMBER
        nativeType: INTEGER

      - name: page
        type: STRING
        nativeType: STRING

      - name: time
        type: TIME
        nativeType: TIMESTAMP

      - name: comment
        type: STRING
        nativeType: STRING

      - name: isMinor
        type: BOOLEAN
        nativeType: BOOLEAN

      - name: countryIsoCode
        type: STRING
        nativeType: STRING

      - name: delta
        type: NUMBER
        nativeType: INTEGER

      - name: countryName
        type: STRING
        nativeType: STRING

      - name: isUnpatrolled
        type: BOOLEAN
        nativeType: BOOLEAN

      - name: isRobot
        type: BOOLEAN
        nativeType: BOOLEAN

      - name: commentLength
        type: NUMBER
        nativeType: INTEGER

      - name: isAnonymous
        type: BOOLEAN
        nativeType: BOOLEAN

      - name: cityName
        type: STRING
        nativeType: STRING


      - name: added
        type: NUMBER
        nativeType: INTEGER

      - name: userChars
        type: STRING
        nativeType: STRING

      - name: channel
        type: STRING
        nativeType: STRING

      - name: sometimeLater
        type: TIME
        nativeType: TIMESTAMP

    dimensions:

      - name: regionName
        title: Region Name
        formula: $regionName

      - name: user
        title: User
        formula: $user

      - name: regionIsoCode
        title: Region Iso Code
        formula: $regionIsoCode

      - name: namespace
        title: Namespace
        formula: $namespace

      - name: isNew
        title: Is New
        formula: $isNew
        kind: BOOLEAN

      - name: page
        title: Page
        formula: $page

      - name: time
        title: Time
        formula: $time
        kind: TIME

      - name: comment
        title: Comment
        formula: $comment

      - name: isMinor
        title: Is Minor
        formula: $isMinor
        kind: BOOLEAN

      - name: countryIsoCode
        title: Country Iso Code
        formula: $countryIsoCode

      - name: countryName
        title: Country Name
        formula: $countryName

      - name: isUnpatrolled
        title: Is Unpatrolled
        formula: $isUnpatrolled
        kind: BOOLEAN

      - name: isRobot
        title: Is Robot
        formula: $isRobot
        kind: BOOLEAN

      - name: isAnonymous
        title: Is Anonymous
        formula: $isAnonymous
        kind: BOOLEAN

      - name: cityName
        title: City Name
        formula: $cityName

      - name: userChars
        title: User Chars
        formula: $userChars

      - name: channel
        title: Channel
        formula: $channel

      - name: sometimeLater
        title: Sometime Later
        formula: $sometimeLater
        kind: TIME

    measures:

      - name: deltaByTen
        title: Delta By Ten
        formula: $main.sum($deltaByTen)

      - name: deleted
        title: Deleted
        formula: $main.sum($deleted)

      - name: metroCode
        title: Metro Code
        formula: $main.sum($metroCode)

      - name: deltaBucket100
        title: Delta Bucket100
        formula: $main.sum($deltaBucket100)

      - name: delta
        title: Delta
        formula: $main.sum($delta)

      - name: commentLength
        title: Comment Length
        formula: $main.sum($commentLength)

      - name: added
        title: Added
        formula: $main.sum($added)
"""

        expected_obj = yaml.safe_load(expected_yaml)
        actual_obj = yaml.safe_load(actual_yaml)

        self.assertDictEqual(expected_obj, actual_obj)

    @mock.patch("redash.models.models.Model")
    def test_json(self, mock_model):
        with mock.patch("redash.plywood.plywood.PlywoodApi.convert_attributes") as parser:
            parser.return_value = [
                {"nativeType": "FLOAT", "name": "deltaByTen", "type": "NUMBER", "isSupported": True},
                {"nativeType": "INTEGER", "name": "deleted", "type": "NUMBER", "isSupported": True},
                {"nativeType": "STRING", "name": "regionName", "type": "STRING", "isSupported": True},
                {"nativeType": "STRING", "name": "user", "type": "STRING", "isSupported": True},
                {"nativeType": "STRING", "name": "regionIsoCode", "type": "STRING", "isSupported": True},
                {"nativeType": "INTEGER", "name": "metroCode", "type": "NUMBER", "isSupported": True},
                {"nativeType": "STRING", "name": "namespace", "type": "STRING", "isSupported": True},
                {"name": "isNew", "type": "BOOLEAN", "nativeType": "BOOLEAN", "isSupported": True},
                {"nativeType": "INTEGER", "name": "deltaBucket100", "type": "NUMBER", "isSupported": True},
                {"nativeType": "STRING", "name": "page", "type": "STRING", "isSupported": True},
                {"nativeType": "TIMESTAMP", "name": "time", "type": "TIME", "isSupported": True},
                {"nativeType": "STRING", "name": "comment", "type": "STRING", "isSupported": True},
                {"name": "isMinor", "type": "BOOLEAN", "nativeType": "BOOLEAN", "isSupported": True},
                {"nativeType": "STRING", "name": "countryIsoCode", "type": "STRING", "isSupported": True},
                {"nativeType": "INTEGER", "name": "delta", "type": "NUMBER", "isSupported": True},
                {"nativeType": "STRING", "name": "countryName", "type": "STRING", "isSupported": True},
                {"name": "isUnpatrolled", "type": "BOOLEAN", "nativeType": "BOOLEAN", "isSupported": True},
                {"name": "isRobot", "type": "BOOLEAN", "nativeType": "BOOLEAN", "isSupported": True},
                {"nativeType": "INTEGER", "name": "commentLength", "type": "NUMBER", "isSupported": True},
                {"name": "isAnonymous", "type": "BOOLEAN", "nativeType": "BOOLEAN", "isSupported": True},
                {"nativeType": "STRING", "name": "cityName", "type": "STRING", "isSupported": True},
                {"nativeType": "INTEGER", "name": "added", "type": "NUMBER", "isSupported": True},
                {"nativeType": "STRING", "name": "userChars", "type": "STRING", "isSupported": True},
                {"nativeType": "STRING", "name": "channel", "type": "STRING", "isSupported": True},
                {"nativeType": "TIMESTAMP", "name": "sometimeLater", "type": "TIME", "isSupported": True},
            ]

            mock_model.table = "wikiticker"
            mock_model.data_source.type = "bigquery"
            mock_model.data_source.get_schema = lambda refresh: [
                {
                    "name": "wikiticker",
                    "columns": [
                        {"name": "deltaByTen", "type": "FLOAT"},
                        {"name": "deleted", "type": "INTEGER"},
                        {"name": "regionName", "type": "STRING"},
                        {"name": "user", "type": "STRING"},
                        {"name": "regionIsoCode", "type": "STRING"},
                        {"name": "metroCode", "type": "INTEGER"},
                        {"name": "namespace", "type": "STRING"},
                        {"name": "isNew", "type": "BOOLEAN"},
                        {"name": "deltaBucket100", "type": "INTEGER"},
                        {"name": "page", "type": "STRING"},
                        {"name": "time", "type": "TIMESTAMP"},
                        {"name": "comment", "type": "STRING"},
                        {"name": "isMinor", "type": "BOOLEAN"},
                        {"name": "countryIsoCode", "type": "STRING"},
                        {"name": "delta", "type": "INTEGER"},
                        {"name": "countryName", "type": "STRING"},
                        {"name": "isUnpatrolled", "type": "BOOLEAN"},
                        {"name": "isRobot", "type": "BOOLEAN"},
                        {"name": "commentLength", "type": "INTEGER"},
                        {"name": "isAnonymous", "type": "BOOLEAN"},
                        {"name": "cityName", "type": "STRING"},
                        {"name": "added", "type": "INTEGER"},
                        {"name": "userChars", "type": "STRING"},
                        {"name": "channel", "type": "STRING"},
                        {"name": "sometimeLater", "type": "TIMESTAMP"},
                    ],
                }
            ]

            actual_json = ModelConfigGenerator.json(model=mock_model, refresh=True)

        exptected_json = {
            "dataCubes": [
                {
                    "name": "wikiticker",
                    "title": "Wikiticker",
                    "clusterName": "native",
                    "timeAttribute": "time",
                    "defaultSortMeasure": "deltaByTen",
                    "defaultSelectedMeasures": ["deltaByTen"],
                    "attributes": [
                        {"name": "deltaByTen", "type": "NUMBER", "nativeType": "FLOAT"},
                        {"name": "deleted", "type": "NUMBER", "nativeType": "INTEGER"},
                        {"name": "regionName", "type": "STRING", "nativeType": "STRING"},
                        {"name": "user", "type": "STRING", "nativeType": "STRING"},
                        {"name": "regionIsoCode", "type": "STRING", "nativeType": "STRING"},
                        {"name": "metroCode", "type": "NUMBER", "nativeType": "INTEGER"},
                        {"name": "namespace", "type": "STRING", "nativeType": "STRING"},
                        {"name": "isNew", "type": "BOOLEAN", "nativeType": "BOOLEAN"},
                        {"name": "deltaBucket100", "type": "NUMBER", "nativeType": "INTEGER"},
                        {"name": "page", "type": "STRING", "nativeType": "STRING"},
                        {"name": "time", "type": "TIME", "nativeType": "TIMESTAMP"},
                        {"name": "comment", "type": "STRING", "nativeType": "STRING"},
                        {"name": "isMinor", "type": "BOOLEAN", "nativeType": "BOOLEAN"},
                        {"name": "countryIsoCode", "type": "STRING", "nativeType": "STRING"},
                        {"name": "delta", "type": "NUMBER", "nativeType": "INTEGER"},
                        {"name": "countryName", "type": "STRING", "nativeType": "STRING"},
                        {
                            "name": "isUnpatrolled",
                            "type": "BOOLEAN",
                            "nativeType": "BOOLEAN",
                        },
                        {
                            "name": "isRobot",
                            "type": "BOOLEAN",
                            "nativeType": "BOOLEAN",
                        },
                        {"name": "commentLength", "type": "NUMBER", "nativeType": "INTEGER"},
                        {"name": "isAnonymous", "type": "BOOLEAN", "nativeType": "BOOLEAN"},
                        {"name": "cityName", "type": "STRING", "nativeType": "STRING"},
                        {
                            "name": "added",
                            "type": "NUMBER",
                            "nativeType": "INTEGER",
                        },
                        {"name": "userChars", "type": "STRING", "nativeType": "STRING"},
                        {"name": "channel", "type": "STRING", "nativeType": "STRING"},
                        {
                            "name": "sometimeLater",
                            "type": "TIME",
                            "nativeType": "TIMESTAMP",
                        },
                    ],
                    "dimensions": [
                        {"name": "regionName", "title": "Region Name", "formula": "$regionName"},
                        {"name": "user", "title": "User", "formula": "$user"},
                        {"name": "regionIsoCode", "title": "Region Iso Code", "formula": "$regionIsoCode"},
                        {"name": "namespace", "title": "Namespace", "formula": "$namespace"},
                        {"name": "isNew", "title": "Is New", "formula": "$isNew", "kind": "BOOLEAN"},
                        {"name": "page", "title": "Page", "formula": "$page"},
                        {"name": "time", "title": "Time", "formula": "$time", "kind": "TIME"},
                        {"name": "comment", "title": "Comment", "formula": "$comment"},
                        {"name": "isMinor", "title": "Is Minor", "formula": "$isMinor", "kind": "BOOLEAN"},
                        {"name": "countryIsoCode", "title": "Country Iso Code", "formula": "$countryIsoCode"},
                        {"name": "countryName", "title": "Country Name", "formula": "$countryName"},
                        {
                            "name": "isUnpatrolled",
                            "title": "Is Unpatrolled",
                            "formula": "$isUnpatrolled",
                            "kind": "BOOLEAN",
                        },
                        {"name": "isRobot", "title": "Is Robot", "formula": "$isRobot", "kind": "BOOLEAN"},
                        {"name": "isAnonymous", "title": "Is Anonymous", "formula": "$isAnonymous", "kind": "BOOLEAN"},
                        {"name": "cityName", "title": "City Name", "formula": "$cityName"},
                        {"name": "userChars", "title": "User Chars", "formula": "$userChars"},
                        {"name": "channel", "title": "Channel", "formula": "$channel"},
                        {
                            "name": "sometimeLater",
                            "title": "Sometime Later",
                            "formula": "$sometimeLater",
                            "kind": "TIME",
                        },
                    ],
                    "measures": [
                        {"name": "deltaByTen", "title": "Delta By Ten", "formula": "$main.sum($deltaByTen)"},
                        {"name": "deleted", "title": "Deleted", "formula": "$main.sum($deleted)"},
                        {"name": "metroCode", "title": "Metro Code", "formula": "$main.sum($metroCode)"},
                        {
                            "name": "deltaBucket100",
                            "title": "Delta Bucket100",
                            "formula": "$main.sum($deltaBucket100)",
                        },
                        {"name": "delta", "title": "Delta", "formula": "$main.sum($delta)"},
                        {"name": "commentLength", "title": "Comment Length", "formula": "$main.sum($commentLength)"},
                        {"name": "added", "title": "Added", "formula": "$main.sum($added)"},
                    ],
                }
            ]
        }
        self.assertDictEqual(exptected_json, actual_json)


class TestModelConfigGeneratorFromQuery(unittest.TestCase):
    """Tests for query-based model config generation (_build_from_query)."""

    @mock.patch("redash.models.models.Model")
    def test_build_from_query_produces_correct_config(self, mock_model):
        """Verifies that _build_from_query introspects columns via LIMIT 0
        and produces a valid config with correct dimensions and measures."""
        import json

        # Simulate a query-based model
        mock_model.query_id = 42
        mock_model.name = "revenue_cube"
        mock_model.table = None
        mock_model.data_source.type = "pg"
        mock_model.query_rel.query_text = "SELECT id, name, amount, created_at FROM orders"

        # Mock query runner to return LIMIT 0 column metadata
        introspect_result = json.dumps(
            {
                "columns": [
                    {"name": "id", "type": "INTEGER"},
                    {"name": "name", "type": "CHARACTER VARYING"},
                    {"name": "amount", "type": "FLOAT"},
                    {"name": "created_at", "type": "TIMESTAMP"},
                ],
                "rows": [],
            }
        )
        mock_model.data_source.query_runner.run_query.return_value = (introspect_result, None)

        with mock.patch("redash.plywood.plywood.PlywoodApi.convert_attributes") as converter:
            converter.return_value = [
                {"name": "id", "type": "NUMBER", "nativeType": "INTEGER", "isSupported": True},
                {"name": "name", "type": "STRING", "nativeType": "CHARACTER VARYING", "isSupported": True},
                {"name": "amount", "type": "NUMBER", "nativeType": "FLOAT", "isSupported": True},
                {"name": "created_at", "type": "TIME", "nativeType": "TIMESTAMP", "isSupported": True},
            ]

            result = ModelConfigGenerator.json(model=mock_model, refresh=False)

        data_cube = result["dataCubes"][0]

        # Name comes from model.name (not table)
        self.assertEqual("revenue_cube", data_cube["name"])
        self.assertEqual("Revenue Cube", data_cube["title"])

        # Time attribute detected
        self.assertEqual("created_at", data_cube["timeAttribute"])

        # Verify introspection query was called correctly
        call_args = mock_model.data_source.query_runner.run_query.call_args
        introspect_sql = call_args[0][0]
        self.assertIn("SELECT * FROM (", introspect_sql)
        self.assertIn("__introspect__", introspect_sql)
        self.assertIn("LIMIT 0", introspect_sql)

        # Verify dimensions (STRING, TIME, BOOLEAN — non-NUMBER types)
        dim_names = [d["name"] for d in data_cube["dimensions"]]
        self.assertIn("name", dim_names)
        self.assertIn("created_at", dim_names)
        self.assertNotIn("id", dim_names)  # NUMBER -> measure
        self.assertNotIn("amount", dim_names)  # NUMBER -> measure

        # Verify measures (NUMBER types)
        measure_names = [m["name"] for m in data_cube["measures"]]
        self.assertIn("id", measure_names)
        self.assertIn("amount", measure_names)

    @mock.patch("redash.models.models.Model")
    def test_build_from_query_raises_on_runner_error(self, mock_model):
        """Query runner failure should raise ValueError."""
        mock_model.query_id = 42
        mock_model.name = "bad_cube"
        mock_model.table = None
        mock_model.query_rel.query_text = "SELECT * FROM nonexistent"
        mock_model.data_source.query_runner.run_query.return_value = (None, "relation does not exist")

        with self.assertRaises(ValueError) as ctx:
            ModelConfigGenerator.json(model=mock_model, refresh=False)

        self.assertIn("Failed to introspect", str(ctx.exception))

    @mock.patch("redash.models.models.Model")
    def test_build_from_query_raises_on_no_columns(self, mock_model):
        """Query returning no columns should raise ValueError."""
        import json

        mock_model.query_id = 42
        mock_model.name = "empty_cube"
        mock_model.table = None
        mock_model.query_rel.query_text = "SELECT 1 WHERE false"
        mock_model.data_source.query_runner.run_query.return_value = (
            json.dumps({"columns": [], "rows": []}),
            None,
        )

        with self.assertRaises(ValueError) as ctx:
            ModelConfigGenerator.json(model=mock_model, refresh=False)

        self.assertIn("no columns", str(ctx.exception))

    @mock.patch("redash.models.models.Model")
    def test_build_from_query_strips_trailing_semicolon(self, mock_model):
        """Trailing semicolons in query SQL should be stripped before wrapping."""
        import json

        mock_model.query_id = 42
        mock_model.name = "semicolon_cube"
        mock_model.table = None
        mock_model.data_source.type = "pg"
        mock_model.query_rel.query_text = "SELECT id FROM orders;"

        mock_model.data_source.query_runner.run_query.return_value = (
            json.dumps({"columns": [{"name": "id", "type": "INTEGER"}], "rows": []}),
            None,
        )

        with mock.patch("redash.plywood.plywood.PlywoodApi.convert_attributes") as converter:
            converter.return_value = [
                {"name": "id", "type": "NUMBER", "nativeType": "INTEGER", "isSupported": True},
            ]
            ModelConfigGenerator.json(model=mock_model, refresh=False)

        call_args = mock_model.data_source.query_runner.run_query.call_args
        introspect_sql = call_args[0][0]
        # Should not have double semicolons or trailing semicolons inside subquery
        self.assertNotIn(";)", introspect_sql)
        self.assertIn("SELECT id FROM orders)", introspect_sql)

    @mock.patch("redash.models.models.Model")
    def test_build_dispatches_to_query_path_when_query_id_set(self, mock_model):
        """When model.query_id is set, _build should use _build_from_query."""
        import json

        mock_model.query_id = 42
        mock_model.name = "dispatch_test"
        mock_model.table = None
        mock_model.data_source.type = "pg"
        mock_model.query_rel.query_text = "SELECT 1 AS val"

        mock_model.data_source.query_runner.run_query.return_value = (
            json.dumps({"columns": [{"name": "val", "type": "INTEGER"}], "rows": []}),
            None,
        )

        with mock.patch("redash.plywood.plywood.PlywoodApi.convert_attributes") as converter:
            converter.return_value = [
                {"name": "val", "type": "NUMBER", "nativeType": "INTEGER", "isSupported": True},
            ]
            result = ModelConfigGenerator.json(model=mock_model, refresh=False)

        # Should NOT have called get_schema (table path)
        mock_model.data_source.get_schema.assert_not_called()

        # Should have called run_query (query path)
        mock_model.data_source.query_runner.run_query.assert_called_once()

        # Config should use model name, not table
        self.assertEqual("dispatch_test", result["dataCubes"][0]["name"])

    @mock.patch("redash.models.models.Model")
    def test_build_from_query_column_types_across_engines(self, mock_model):
        """Column types should be correctly derived regardless of engine type."""
        import json

        engines = ["pg", "bigquery", "mysql", "athena"]
        for engine in engines:
            mock_model.query_id = 42
            mock_model.name = f"engine_test_{engine}"
            mock_model.table = None
            mock_model.data_source.type = engine
            mock_model.query_rel.query_text = "SELECT id, ts FROM t"

            mock_model.data_source.query_runner.run_query.return_value = (
                json.dumps(
                    {
                        "columns": [
                            {"name": "id", "type": "INTEGER"},
                            {"name": "ts", "type": "TIMESTAMP"},
                        ],
                        "rows": [],
                    }
                ),
                None,
            )

            with mock.patch("redash.plywood.plywood.PlywoodApi.convert_attributes") as converter:
                converter.return_value = [
                    {"name": "id", "type": "NUMBER", "nativeType": "INTEGER", "isSupported": True},
                    {"name": "ts", "type": "TIME", "nativeType": "TIMESTAMP", "isSupported": True},
                ]
                result = ModelConfigGenerator.json(model=mock_model, refresh=False)

            data_cube = result["dataCubes"][0]

            # Converter should have been called with the engine type
            converter.assert_called_once_with(engine, mock.ANY)

            # Verify correct type mapping
            attr_types = {a["name"]: a["type"] for a in data_cube["attributes"]}
            self.assertEqual("NUMBER", attr_types["id"], f"Failed for engine: {engine}")
            self.assertEqual("TIME", attr_types["ts"], f"Failed for engine: {engine}")
