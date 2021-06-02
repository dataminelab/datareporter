import unittest

import mock
import yaml
import json
from redash.services.model_config_generator import ModelConfigGenerator


class TestModelConfigGenerator(unittest.TestCase):
    @mock.patch("redash.models.models.Model")
    def test_yaml(self, mock_model):
        with mock.patch("redash.plywood.plywood.PlywoodApi.convert_attributes") as parser:
            parser.return_value = [
                {
                    "nativeType": "FLOAT",
                    "name": "deltaByTen",
                    "type": "NUMBER",
                    "isSupported": True
                },
                {
                    "nativeType": "INTEGER",
                    "name": "deleted",
                    "type": "NUMBER",
                    "isSupported": True
                },
                {
                    "nativeType": "STRING",
                    "name": "regionName",
                    "type": "STRING",
                    "isSupported": True
                },
                {
                    "nativeType": "STRING",
                    "name": "user",
                    "type": "STRING",
                    "isSupported": True
                },
                {
                    "nativeType": "STRING",
                    "name": "regionIsoCode",
                    "type": "STRING",
                    "isSupported": True
                },
                {
                    "nativeType": "INTEGER",
                    "name": "metroCode",
                    "type": "NUMBER",
                    "isSupported": True
                },
                {
                    "nativeType": "STRING",
                    "name": "namespace",
                    "type": "STRING",
                    "isSupported": True
                },
                {
                    "name": "isNew",
                    "type": "BOOLEAN",
                    "nativeType": "BOOLEAN",
                    "isSupported": True
                },
                {
                    "nativeType": "INTEGER",
                    "name": "deltaBucket100",
                    "type": "NUMBER",
                    "isSupported": True
                },
                {
                    "nativeType": "STRING",
                    "name": "page",
                    "type": "STRING",
                    "isSupported": True
                },
                {
                    "nativeType": "TIMESTAMP",
                    "name": "time",
                    "type": "TIME",
                    "isSupported": True
                },
                {
                    "nativeType": "STRING",
                    "name": "comment",
                    "type": "STRING",
                    "isSupported": True
                },
                {
                    "name": "isMinor",
                    "type": "BOOLEAN",
                    "nativeType": "BOOLEAN",
                    "isSupported": True
                },
                {
                    "nativeType": "STRING",
                    "name": "countryIsoCode",
                    "type": "STRING",
                    "isSupported": True
                },
                {
                    "nativeType": "INTEGER",
                    "name": "delta",
                    "type": "NUMBER",
                    "isSupported": True
                },
                {
                    "nativeType": "STRING",
                    "name": "countryName",
                    "type": "STRING",
                    "isSupported": True
                },
                {
                    "name": "isUnpatrolled",
                    "type": "BOOLEAN",
                    "nativeType": "BOOLEAN",
                    "isSupported": True
                },
                {
                    "name": "isRobot",
                    "type": "BOOLEAN",
                    "nativeType": "BOOLEAN",
                    "isSupported": True
                },
                {
                    "nativeType": "INTEGER",
                    "name": "commentLength",
                    "type": "NUMBER",
                    "isSupported": True
                },
                {
                    "name": "isAnonymous",
                    "type": "BOOLEAN",
                    "nativeType": "BOOLEAN",
                    "isSupported": True
                },
                {
                    "nativeType": "STRING",
                    "name": "cityName",
                    "type": "STRING",
                    "isSupported": True
                },
                {
                    "nativeType": "INTEGER",
                    "name": "added",
                    "type": "NUMBER",
                    "isSupported": True
                },
                {
                    "nativeType": "STRING",
                    "name": "userChars",
                    "type": "STRING",
                    "isSupported": True
                },
                {
                    "nativeType": "STRING",
                    "name": "channel",
                    "type": "STRING",
                    "isSupported": True
                },
                {
                    "nativeType": "TIMESTAMP",
                    "name": "sometimeLater",
                    "type": "TIME",
                    "isSupported": True
                }
            ]

            mock_model.table = "wikiticker"
            mock_model.data_source.type = 'bigquery'
            mock_model.data_source.get_schema = lambda refresh: [{
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
                    {"name": "sometimeLater", "type": "TIMESTAMP"}
                ]
            }]

            actual_yaml = ModelConfigGenerator.yaml(model=mock_model, refresh=True)

        expected_yaml = \
            '''dataCubes:
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
'''

        expected_obj = yaml.safe_load(expected_yaml)
        actual_obj = yaml.safe_load(actual_yaml)

        self.assertDictEqual(expected_obj, actual_obj)

    @mock.patch("redash.models.models.Model")
    def test_json(self, mock_model):
        with mock.patch("redash.plywood.plywood.PlywoodApi.convert_attributes") as parser:
            parser.return_value = [
                {
                    "nativeType": "FLOAT",
                    "name": "deltaByTen",
                    "type": "NUMBER",
                    "isSupported": True
                },
                {
                    "nativeType": "INTEGER",
                    "name": "deleted",
                    "type": "NUMBER",
                    "isSupported": True
                },
                {
                    "nativeType": "STRING",
                    "name": "regionName",
                    "type": "STRING",
                    "isSupported": True
                },
                {
                    "nativeType": "STRING",
                    "name": "user",
                    "type": "STRING",
                    "isSupported": True
                },
                {
                    "nativeType": "STRING",
                    "name": "regionIsoCode",
                    "type": "STRING",
                    "isSupported": True
                },
                {
                    "nativeType": "INTEGER",
                    "name": "metroCode",
                    "type": "NUMBER",
                    "isSupported": True
                },
                {
                    "nativeType": "STRING",
                    "name": "namespace",
                    "type": "STRING",
                    "isSupported": True
                },
                {
                    "name": "isNew",
                    "type": "BOOLEAN",
                    "nativeType": "BOOLEAN",
                    "isSupported": True
                },
                {
                    "nativeType": "INTEGER",
                    "name": "deltaBucket100",
                    "type": "NUMBER",
                    "isSupported": True
                },
                {
                    "nativeType": "STRING",
                    "name": "page",
                    "type": "STRING",
                    "isSupported": True
                },
                {
                    "nativeType": "TIMESTAMP",
                    "name": "time",
                    "type": "TIME",
                    "isSupported": True
                },
                {
                    "nativeType": "STRING",
                    "name": "comment",
                    "type": "STRING",
                    "isSupported": True
                },
                {
                    "name": "isMinor",
                    "type": "BOOLEAN",
                    "nativeType": "BOOLEAN",
                    "isSupported": True
                },
                {
                    "nativeType": "STRING",
                    "name": "countryIsoCode",
                    "type": "STRING",
                    "isSupported": True
                },
                {
                    "nativeType": "INTEGER",
                    "name": "delta",
                    "type": "NUMBER",
                    "isSupported": True
                },
                {
                    "nativeType": "STRING",
                    "name": "countryName",
                    "type": "STRING",
                    "isSupported": True
                },
                {
                    "name": "isUnpatrolled",
                    "type": "BOOLEAN",
                    "nativeType": "BOOLEAN",
                    "isSupported": True
                },
                {
                    "name": "isRobot",
                    "type": "BOOLEAN",
                    "nativeType": "BOOLEAN",
                    "isSupported": True
                },
                {
                    "nativeType": "INTEGER",
                    "name": "commentLength",
                    "type": "NUMBER",
                    "isSupported": True
                },
                {
                    "name": "isAnonymous",
                    "type": "BOOLEAN",
                    "nativeType": "BOOLEAN",
                    "isSupported": True
                },
                {
                    "nativeType": "STRING",
                    "name": "cityName",
                    "type": "STRING",
                    "isSupported": True
                },
                {
                    "nativeType": "INTEGER",
                    "name": "added",
                    "type": "NUMBER",
                    "isSupported": True
                },
                {
                    "nativeType": "STRING",
                    "name": "userChars",
                    "type": "STRING",
                    "isSupported": True
                },
                {
                    "nativeType": "STRING",
                    "name": "channel",
                    "type": "STRING",
                    "isSupported": True
                },
                {
                    "nativeType": "TIMESTAMP",
                    "name": "sometimeLater",
                    "type": "TIME",
                    "isSupported": True
                }
            ]

            mock_model.table = "wikiticker"
            mock_model.data_source.type = 'bigquery'
            mock_model.data_source.get_schema = lambda refresh: [{
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
                    {"name": "sometimeLater", "type": "TIMESTAMP"}
                ]
            }]

            actual_json = ModelConfigGenerator.json(model=mock_model, refresh=True)

        exptected_json = {
            'dataCubes': [
                {
                    'name': 'wikiticker',
                    'title': 'Wikiticker',
                    'clusterName': "native",
                    'timeAttribute': 'time',
                    'defaultSortMeasure': 'deltaByTen',
                    'defaultSelectedMeasures': ['deltaByTen'],
                    'attributes': [
                        {
                            'name': 'deltaByTen',
                            'type': 'NUMBER',
                            'nativeType': 'FLOAT'
                        },
                        {
                            'name': 'deleted',
                            'type': 'NUMBER',
                            'nativeType': 'INTEGER'
                        },
                        {
                            'name': 'regionName',
                            'type': 'STRING',
                            'nativeType': 'STRING'
                        },
                        {
                            'name': 'user',
                            'type': 'STRING',
                            'nativeType': 'STRING'

                        },
                        {
                            'name': 'regionIsoCode',
                            'type': 'STRING',
                            'nativeType': 'STRING'
                        },
                        {
                            'name': 'metroCode',
                            'type': 'NUMBER',
                            'nativeType': 'INTEGER'
                        },
                        {
                            'name': 'namespace',
                            'type': 'STRING',
                            'nativeType': 'STRING'
                        },
                        {
                            'name': 'isNew',
                            'type': 'BOOLEAN',
                            'nativeType': 'BOOLEAN'
                        },
                        {
                            'name': 'deltaBucket100',
                            'type': 'NUMBER',
                            'nativeType': 'INTEGER'
                        },
                        {
                            'name': 'page',
                            'type': 'STRING',
                            'nativeType': 'STRING'
                        },
                        {
                            'name': 'time',
                            'type': 'TIME',
                            'nativeType': 'TIMESTAMP'
                        },
                        {
                            'name': 'comment',
                            'type': 'STRING',
                            'nativeType': 'STRING'
                        },
                        {
                            'name': 'isMinor',
                            'type': 'BOOLEAN',
                            'nativeType': 'BOOLEAN'
                        },
                        {
                            'name': 'countryIsoCode',
                            'type': 'STRING',
                            'nativeType': 'STRING'
                        },
                        {
                            'name': 'delta',
                            'type': 'NUMBER',
                            'nativeType': 'INTEGER'
                        },
                        {
                            'name': 'countryName',
                            'type': 'STRING',
                            'nativeType': 'STRING'
                        },
                        {
                            'name': 'isUnpatrolled',
                            'type': 'BOOLEAN',
                            'nativeType': 'BOOLEAN',

                        },
                        {
                            'name': 'isRobot',
                            'type': 'BOOLEAN',
                            'nativeType': 'BOOLEAN',

                        },
                        {
                            'name': 'commentLength',
                            'type': 'NUMBER',
                            'nativeType': 'INTEGER'
                        },
                        {
                            'name': 'isAnonymous',
                            'type': 'BOOLEAN',
                            'nativeType': 'BOOLEAN'
                        },
                        {
                            'name': 'cityName',
                            'type': 'STRING',
                            'nativeType': 'STRING'
                        },
                        {
                            'name': 'added',
                            'type': 'NUMBER',
                            'nativeType': 'INTEGER',
                        },
                        {
                            'name': 'userChars',
                            'type': 'STRING',
                            'nativeType': 'STRING'
                        },
                        {
                            'name': 'channel',
                            'type': 'STRING',
                            'nativeType': 'STRING'
                        },
                        {
                            'name': 'sometimeLater',
                            'type': 'TIME',
                            'nativeType': 'TIMESTAMP',
                        }
                    ],
                    'dimensions': [
                        {
                            'name': 'regionName',
                            'title': 'Region Name',
                            'formula': '$regionName'
                        },
                        {
                            'name': 'user',
                            'title': 'User',
                            'formula': '$user'
                        },
                        {
                            'name': 'regionIsoCode',
                            'title': 'Region Iso Code',
                            'formula': '$regionIsoCode'
                        },
                        {
                            'name': 'namespace',
                            'title': 'Namespace',
                            'formula': '$namespace'
                        },
                        {
                            'name': 'isNew',
                            'title': 'Is New',
                            'formula': '$isNew',
                            'kind': 'BOOLEAN'
                        },
                        {
                            'name': 'page',
                            'title': 'Page',
                            'formula': '$page'
                        },
                        {
                            'name': 'time',
                            'title': 'Time',
                            'formula': '$time',
                            'kind': 'TIME'
                        },
                        {
                            'name': 'comment',
                            'title': 'Comment',
                            'formula': '$comment'
                        },
                        {
                            'name': 'isMinor',
                            'title': 'Is Minor',
                            'formula': '$isMinor',
                            'kind': 'BOOLEAN'
                        },
                        {
                            'name': 'countryIsoCode',
                            'title': 'Country Iso Code',
                            'formula': '$countryIsoCode'
                        },
                        {
                            'name': 'countryName',
                            'title': 'Country Name',
                            'formula': '$countryName'
                        },
                        {
                            'name': 'isUnpatrolled',
                            'title': 'Is Unpatrolled',
                            'formula': '$isUnpatrolled',
                            'kind': 'BOOLEAN'
                        },
                        {
                            'name': 'isRobot',
                            'title': 'Is Robot',
                            'formula': '$isRobot',
                            'kind': 'BOOLEAN'
                        },
                        {
                            'name': 'isAnonymous',
                            'title': 'Is Anonymous',
                            'formula': '$isAnonymous',
                            'kind': 'BOOLEAN'
                        },
                        {
                            'name': 'cityName',
                            'title': 'City Name',
                            'formula': '$cityName'
                        },
                        {
                            'name': 'userChars',
                            'title': 'User Chars',
                            'formula': '$userChars'
                        },
                        {
                            'name': 'channel',
                            'title': 'Channel',
                            'formula': '$channel'
                        },
                        {
                            'name': 'sometimeLater',
                            'title': 'Sometime Later',
                            'formula': '$sometimeLater',
                            'kind': 'TIME'
                        }
                    ],
                    'measures': [
                        {
                            'name': 'deltaByTen',
                            'title': 'Delta By Ten',
                            'formula': '$main.sum($deltaByTen)'
                        },
                        {
                            'name': 'deleted',
                            'title': 'Deleted',
                            'formula': '$main.sum($deleted)'
                        },
                        {
                            'name': 'metroCode',
                            'title': 'Metro Code',
                            'formula': '$main.sum($metroCode)'
                        },
                        {
                            'name': 'deltaBucket100',
                            'title': 'Delta Bucket100',
                            'formula': '$main.sum($deltaBucket100)'
                        },
                        {
                            'name': 'delta',
                            'title': 'Delta',
                            'formula': '$main.sum($delta)'
                        },
                        {
                            'name': 'commentLength',
                            'title': 'Comment Length',
                            'formula': '$main.sum($commentLength)'
                        },
                        {
                            'name': 'added',
                            'title': 'Added',
                            'formula': '$main.sum($added)'
                        }
                    ]
                }
            ]
        }
        self.assertDictEqual(exptected_json, actual_json)
