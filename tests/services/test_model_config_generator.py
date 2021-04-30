import unittest

import mock
import yaml
import json
from redash.services.model_config_generator import ModelConfigGenerator


class TestModelConfigGenerator(unittest.TestCase):

    @mock.patch("redash.models.models.Model")
    def test_yaml(self, mock_model):
        mock_model.table = "wikiticker"
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

      - name: deleted
        type: NUMBER

      - name: regionName
        type: STRING

      - name: user
        type: STRING

      - name: regionIsoCode
        type: STRING

      - name: metroCode
        type: NUMBER

      - name: namespace
        type: STRING

      - name: isNew
        type: BOOLEAN

      - name: deltaBucket100
        type: NUMBER

      - name: page
        type: STRING

      - name: time
        type: TIME

      - name: comment
        type: STRING

      - name: isMinor
        type: BOOLEAN

      - name: countryIsoCode
        type: STRING

      - name: delta
        type: NUMBER

      - name: countryName
        type: STRING

      - name: isUnpatrolled
        type: BOOLEAN

      - name: isRobot
        type: BOOLEAN

      - name: commentLength
        type: NUMBER

      - name: isAnonymous
        type: BOOLEAN

      - name: cityName
        type: STRING

      - name: added
        type: NUMBER

      - name: userChars
        type: STRING

      - name: channel
        type: STRING

      - name: sometimeLater
        type: TIME

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

      - name: comment
        title: Comment
        formula: $comment

      - name: isMinor
        title: Is Minor
        formula: $isMinor
        kind: boolean

      - name: countryIsoCode
        title: Country Iso Code
        formula: $countryIsoCode

      - name: countryName
        title: Country Name
        formula: $countryName

      - name: isUnpatrolled
        title: Is Unpatrolled
        formula: $isUnpatrolled
        kind: boolean

      - name: isRobot
        title: Is Robot
        formula: $isRobot
        kind: boolean

      - name: isAnonymous
        title: Is Anonymous
        formula: $isAnonymous
        kind: boolean

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
        kind: time

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
        mock_model.table = "wikiticker"
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
                    'clusterName' : "native",
                    'timeAttribute' : 'time',
                    'defaultSortMeasure': 'deltaByTen',
                    'defaultSelectedMeasures': ['deltaByTen'],
                    'attributes': [
                        {
                            'name': 'deltaByTen',
                            'type': 'NUMBER'
                        },
                        {
                            'name': 'deleted',
                            'type': 'NUMBER'
                        },
                        {
                            'name': 'regionName',
                            'type': 'STRING'
                        },
                        {
                            'name': 'user',
                            'type': 'STRING'
                        },
                        {
                            'name': 'regionIsoCode',
                            'type': 'STRING'
                        },
                        {
                            'name': 'metroCode',
                            'type': 'NUMBER'
                        },
                        {
                            'name': 'namespace',
                            'type': 'STRING'
                        },
                        {
                            'name': 'isNew',
                            'type': 'BOOLEAN'
                        },
                        {
                            'name': 'deltaBucket100',
                            'type': 'NUMBER'
                        },
                        {
                            'name': 'page',
                            'type': 'STRING'
                        },
                        {
                            'name': 'time',
                            'type': 'TIME'
                        },
                        {
                            'name': 'comment',
                            'type': 'STRING'
                        },
                        {
                            'name': 'isMinor',
                            'type': 'BOOLEAN'
                        },
                        {
                            'name': 'countryIsoCode',
                            'type': 'STRING'
                        },
                        {
                            'name': 'delta',
                            'type': 'NUMBER'
                        },
                        {
                            'name': 'countryName',
                            'type': 'STRING'
                        },
                        {
                            'name': 'isUnpatrolled',
                            'type': 'BOOLEAN'
                        },
                        {
                            'name': 'isRobot',
                            'type': 'BOOLEAN'
                        },
                        {
                            'name': 'commentLength',
                            'type': 'NUMBER'
                        },
                        {
                            'name': 'isAnonymous',
                            'type': 'BOOLEAN'
                        },
                        {
                            'name': 'cityName',
                            'type': 'STRING'
                        },
                        {
                            'name': 'added',
                            'type': 'NUMBER'
                        },
                        {
                            'name': 'userChars',
                            'type': 'STRING'
                        },
                        {
                            'name': 'channel',
                            'type': 'STRING'
                        },
                        {
                            'name': 'sometimeLater',
                            'type': 'TIME'}
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
                            'kind': 'boolean'
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
                            'kind': 'time'
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
                            'kind': 'boolean'
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
                            'kind': 'boolean'
                        },
                        {
                            'name': 'isRobot',
                            'title': 'Is Robot',
                            'formula': '$isRobot',
                            'kind': 'boolean'
                        },
                        {
                            'name': 'isAnonymous',
                            'title': 'Is Anonymous',
                            'formula': '$isAnonymous',
                            'kind': 'boolean'
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
                            'kind': 'time'
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
