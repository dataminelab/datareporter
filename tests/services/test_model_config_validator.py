import unittest

from werkzeug.exceptions import BadRequest

from redash.services.model_config_validator import ModelConfigValidator


class TestModelConfigValidator(unittest.TestCase):
    def test_validate_max_length(self):
        attributes = "\n".join(["                    - key: {}\n                    value: {}".format(key, key) for key in range(680)])
        content = """dataCubes:
              - name: wikiticker
                title: Wikiticker
                defaultSortMeasure: deltaByTen
                clusterName: wiki
                timeAttribute: time
                defaultSelectedMeasures:
                  - deltaByTen
                attributes:
                    {}
                    """.format(attributes)
        validator = ModelConfigValidator(content=content)

        with self.assertRaises(BadRequest) as cm:
            validator.validate()
        ex = cm.exception

        self.assertEqual(ex.code, 400)
        self.assertEqual(ex.data, {'message': 'Maximum content length is 20000, actual 42275'})

    def test_validate_wrong_yaml(self):
        content = "key: 12 \n  key1: 34\n key2: 56"
        validator = ModelConfigValidator(content=content)

        with self.assertRaises(BadRequest) as cm:
            validator.validate()
        ex = cm.exception

        self.assertEqual(ex.code, 400)
        self.assertEqual(ex.data, {'message': 'Your config has an issue on line 1 at position 6'})

    def test_validate_correct_config(self):
        content = \
            """dataCubes:
                  - name: wikiticker
                    title: Wikiticker
                    defaultSortMeasure: deltaByTen
                    clusterName: wiki
                    timeAttribute: time
                    defaultSelectedMeasures:
                      - deltaByTen
                    attributes:

                      - name: deltaByTen
                        type: number

                      - name: deleted
                        type: number

                      - name: regionName
                        type: string

                      - name: user
                        type: string
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
                        kind: boolean

                      - name: page
                        title: Page
                        formula: $page

                      - name: time
                        title: Time
                        formula: $time
                        kind: time

                    measures:

                      - name: deltaByTen
                        title: Delta By Ten
                        formula: $main.sum($deltaByTen)

                      - name: deleted
                        title: Deleted
                        formula: $main.sum($deleted)
            """

        validator = ModelConfigValidator(content=content)

        self.assertIsNone(validator.validate())

    def test_validate_incorrect_config(self):
        content = \
            """dataCubes:
                  - name: wikiticker
                    title: Wikiticker
                    defaultSortMeasure: deltaByTen
                    defaultSelectedMeasures:
                      - deltaByTen
                    clusterName: wiki
                    timeAttribute: time
                    attributes:

                      - name: deltaByTen
                        type: number

                      - name: deleted
                        type: number

                      - name: regionName
                        type: string

                      - name: user
                        type: string
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
                        kind: boolean

                      - name: page
                        title: Page
                        formula: $page

                      - name: time
                        title: Time
                        formula: $time
                        kind: time

                    measures:

                      - name: deltaByTen
                        title: Delta By Ten

                      - name: deleted
                        title: Deleted
                        formula: $main.sum($deleted)
            """

        validator = ModelConfigValidator(content=content)
        with self.assertRaises(BadRequest) as cm:
            validator.validate()
        ex = cm.exception

        self.assertEqual(ex.code, 400)
        self.assertEqual(ex.data, {
            'message': "Config has the following issues: {'dataCubes': [{0: [{'measures': [{0: [{'formula': ['required field']}]}]}]}]}"})
