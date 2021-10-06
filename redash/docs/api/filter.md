## Api for filtering expression

- Generates response for filter part

POST http://{host}/api/reports/generate/{model_id}/filter

`Body`

| Key          | Type     | Description                                                      |
| :----------- | :------- | :--------------------------------------------------------------- |
| `expression`   | `object` | **Required**. |


Example
```json
{
    "expression": {
        "op": "limit",
        "operand": {
            "op": "sort",
            "operand": {
                "op": "apply",
                "operand": {
                    "op": "split",
                    "operand": {
                        "op": "filter",
                        "operand": {
                            "op": "ref",
                            "name": "main"
                        },
                        "expression": {
                            "op": "overlap",
                            "operand": {
                                "op": "ref",
                                "name": "time"
                            },
                            "expression": {
                                "op": "literal",
                                "value": {
                                    "setType": "TIME_RANGE",
                                    "elements": [
                                        {
                                            "start": "2015-09-12T00:01:00.000Z",
                                            "end": "2015-09-13T00:01:00.000Z"
                                        }
                                    ]
                                },
                                "type": "SET"
                            }
                        }
                    },
                    "name": "countryIso",
                    "expression": {
                        "op": "ref",
                        "name": "countryIsoCode"
                    },
                    "dataName": "main"
                },
                "expression": {
                    "op": "count",
                    "operand": {
                        "op": "ref",
                        "name": "main"
                    }
                },
                "name": "MEASURE"
            },
            "expression": {
                "op": "ref",
                "name": "MEASURE"
            },
            "direction": "descending"
        },
        "value": 101
    }
}
```

`Responses`. All responses with code not equal `200` should be
considered as fail.


| Key          | Type     | Description                                                      |
| :----------- | :------- | :--------------------------------------------------------------- |
| `data`   | `object` | Nullable. PlyValueJs object. Will appear when ready |
| `status`   | `number` | Number 1-5 or 200. If 1-5 it's redash jobs statuses. The list can be found below, if 200 means teh result has been received and you can use the data |
| `query`   | `object` | Query is redash jobs fields. They are not useless for front end but needed for other things


```
Redash status codes
1 == PENDING (waiting to be executed)
2 == STARTED (executing)
3 == SUCCESS
4 == FAILURE
5 == CANCELLED
```
The first time  it's called it will create jobs and return jobs and status 1 which is pending.

Then it should go to redash executor and once it's done you will be able to get PlywoodValue by using
the  save url.


`Response`

```json
{
    "data": {
        "keys": [
            "countryIso"
        ],
        "attributes": [
            {
                "name": "countryIso",
                "type": "STRING"
            },
            {
                "name": "MEASURE",
                "type": "NUMBER"
            }
        ],
        "data": [
            {
                "countryIso": null,
                "MEASURE": 35445
            },
            {
                "countryIso": "US",
                "MEASURE": 528
            },
            {
                "countryIso": "IT",
                "MEASURE": 256
            },
            {
                "countryIso": "GB",
                "MEASURE": 234
            },
            {
                "countryIso": "FR",
                "MEASURE": 205
            },
            {
                "countryIso": "RU",
                "MEASURE": 194
            },
            {
                "countryIso": "JP",
                "MEASURE": 171
            },
            {
                "countryIso": "DE",
                "MEASURE": 162
            },
            {
                "countryIso": "BR",
                "MEASURE": 136
            },
            {
                "countryIso": "IN",
                "MEASURE": 125
            },
            {
                "countryIso": "KR",
                "MEASURE": 118
            },
            {
                "countryIso": "CA",
                "MEASURE": 117
            },
            {
                "countryIso": "TW",
                "MEASURE": 94
            },
            {
                "countryIso": "ES",
                "MEASURE": 94
            },
            {
                "countryIso": "PH",
                "MEASURE": 74
            },
            {
                "countryIso": "PL",
                "MEASURE": 70
            },
            {
                "countryIso": "CO",
                "MEASURE": 69
            },
            {
                "countryIso": "AU",
                "MEASURE": 65
            },
            {
                "countryIso": "HK",
                "MEASURE": 61
            },
            {
                "countryIso": "MX",
                "MEASURE": 60
            },
            {
                "countryIso": "UA",
                "MEASURE": 56
            },
            {
                "countryIso": "AR",
                "MEASURE": 53
            },
            {
                "countryIso": "IL",
                "MEASURE": 45
            },
            {
                "countryIso": "NL",
                "MEASURE": 43
            },
            {
                "countryIso": "CL",
                "MEASURE": 41
            },
            {
                "countryIso": "TR",
                "MEASURE": 35
            },
            {
                "countryIso": "FI",
                "MEASURE": 27
            },
            {
                "countryIso": "SE",
                "MEASURE": 26
            },
            {
                "countryIso": "RS",
                "MEASURE": 25
            },
            {
                "countryIso": "IR",
                "MEASURE": 25
            },
            {
                "countryIso": "ID",
                "MEASURE": 23
            },
            {
                "countryIso": "CZ",
                "MEASURE": 21
            },
            {
                "countryIso": "VN",
                "MEASURE": 20
            },
            {
                "countryIso": "GR",
                "MEASURE": 19
            },
            {
                "countryIso": "BE",
                "MEASURE": 18
            },
            {
                "countryIso": "RO",
                "MEASURE": 18
            },
            {
                "countryIso": "MY",
                "MEASURE": 18
            },
            {
                "countryIso": "HU",
                "MEASURE": 17
            },
            {
                "countryIso": "DK",
                "MEASURE": 16
            },
            {
                "countryIso": "TH",
                "MEASURE": 16
            },
            {
                "countryIso": "NZ",
                "MEASURE": 16
            },
            {
                "countryIso": "NO",
                "MEASURE": 16
            },
            {
                "countryIso": "PT",
                "MEASURE": 16
            },
            {
                "countryIso": "HR",
                "MEASURE": 15
            },
            {
                "countryIso": "VE",
                "MEASURE": 15
            },
            {
                "countryIso": "PE",
                "MEASURE": 15
            },
            {
                "countryIso": "AE",
                "MEASURE": 14
            },
            {
                "countryIso": "IE",
                "MEASURE": 13
            },
            {
                "countryIso": "CN",
                "MEASURE": 13
            },
            {
                "countryIso": "CH",
                "MEASURE": 13
            },
            {
                "countryIso": "UY",
                "MEASURE": 12
            },
            {
                "countryIso": "SG",
                "MEASURE": 12
            },
            {
                "countryIso": "AT",
                "MEASURE": 12
            },
            {
                "countryIso": "KZ",
                "MEASURE": 12
            },
            {
                "countryIso": "SK",
                "MEASURE": 12
            },
            {
                "countryIso": "SA",
                "MEASURE": 11
            },
            {
                "countryIso": "PK",
                "MEASURE": 10
            },
            {
                "countryIso": "BY",
                "MEASURE": 10
            },
            {
                "countryIso": "BG",
                "MEASURE": 9
            },
            {
                "countryIso": "KW",
                "MEASURE": 9
            },
            {
                "countryIso": "ZA",
                "MEASURE": 9
            },
            {
                "countryIso": "BD",
                "MEASURE": 9
            },
            {
                "countryIso": "MA",
                "MEASURE": 8
            },
            {
                "countryIso": "CR",
                "MEASURE": 8
            },
            {
                "countryIso": "PY",
                "MEASURE": 6
            },
            {
                "countryIso": "DO",
                "MEASURE": 6
            },
            {
                "countryIso": "EC",
                "MEASURE": 6
            },
            {
                "countryIso": "PR",
                "MEASURE": 5
            },
            {
                "countryIso": "EG",
                "MEASURE": 5
            },
            {
                "countryIso": "BA",
                "MEASURE": 5
            },
            {
                "countryIso": "AO",
                "MEASURE": 4
            },
            {
                "countryIso": "GE",
                "MEASURE": 4
            },
            {
                "countryIso": "LK",
                "MEASURE": 4
            },
            {
                "countryIso": "LU",
                "MEASURE": 4
            },
            {
                "countryIso": "IQ",
                "MEASURE": 4
            },
            {
                "countryIso": "EE",
                "MEASURE": 3
            },
            {
                "countryIso": "JO",
                "MEASURE": 3
            },
            {
                "countryIso": "BO",
                "MEASURE": 3
            },
            {
                "countryIso": "MO",
                "MEASURE": 3
            },
            {
                "countryIso": "SV",
                "MEASURE": 3
            },
            {
                "countryIso": "GT",
                "MEASURE": 3
            },
            {
                "countryIso": "ZW",
                "MEASURE": 3
            },
            {
                "countryIso": "QA",
                "MEASURE": 2
            },
            {
                "countryIso": "AL",
                "MEASURE": 2
            },
            {
                "countryIso": "LT",
                "MEASURE": 2
            },
            {
                "countryIso": "GH",
                "MEASURE": 2
            },
            {
                "countryIso": "MM",
                "MEASURE": 2
            },
            {
                "countryIso": "SI",
                "MEASURE": 2
            },
            {
                "countryIso": "MD",
                "MEASURE": 2
            },
            {
                "countryIso": "MH",
                "MEASURE": 2
            },
            {
                "countryIso": "NG",
                "MEASURE": 2
            },
            {
                "countryIso": "JM",
                "MEASURE": 1
            },
            {
                "countryIso": "MR",
                "MEASURE": 1
            },
            {
                "countryIso": "MV",
                "MEASURE": 1
            },
            {
                "countryIso": "KG",
                "MEASURE": 1
            },
            {
                "countryIso": "TJ",
                "MEASURE": 1
            },
            {
                "countryIso": "ME",
                "MEASURE": 1
            },
            {
                "countryIso": "NP",
                "MEASURE": 1
            },
            {
                "countryIso": "BH",
                "MEASURE": 1
            },
            {
                "countryIso": "ZM",
                "MEASURE": 1
            },
            {
                "countryIso": "PA",
                "MEASURE": 1
            }
        ]
    },
    "status": 200,
    "query": [
        {
            "query_result": {
                "id": 390,
                "query_hash": "b9d179e721599b9e790dc3634b697112",
                "query": "SELECT `countryIsoCode` AS `countryIso`, COUNT(*) AS `MEASURE` FROM public.`wikiticker` AS t WHERE (TIMESTAMP('2015-09-12T00:01:00.000Z')<=`time` AND `time`<TIMESTAMP('2015-09-13T00:01:00.000Z')) GROUP BY 1 ORDER BY `MEASURE` DESC LIMIT 101",
                "data": {
                    "columns": [
                        {
                            "name": "countryIso",
                            "friendly_name": "countryIso",
                            "type": "string"
                        },
                        {
                            "name": "MEASURE",
                            "friendly_name": "MEASURE",
                            "type": "integer"
                        }
                    ],
                    "rows": [
                        {
                            "countryIso": null,
                            "MEASURE": 35445
                        },
                        {
                            "countryIso": "US",
                            "MEASURE": 528
                        },
                        {
                            "countryIso": "IT",
                            "MEASURE": 256
                        },
                        {
                            "countryIso": "GB",
                            "MEASURE": 234
                        },
                        {
                            "countryIso": "FR",
                            "MEASURE": 205
                        },
                        {
                            "countryIso": "RU",
                            "MEASURE": 194
                        },
                        {
                            "countryIso": "JP",
                            "MEASURE": 171
                        },
                        {
                            "countryIso": "DE",
                            "MEASURE": 162
                        },
                        {
                            "countryIso": "BR",
                            "MEASURE": 136
                        },
                        {
                            "countryIso": "IN",
                            "MEASURE": 125
                        },
                        {
                            "countryIso": "KR",
                            "MEASURE": 118
                        },
                        {
                            "countryIso": "CA",
                            "MEASURE": 117
                        },
                        {
                            "countryIso": "TW",
                            "MEASURE": 94
                        },
                        {
                            "countryIso": "ES",
                            "MEASURE": 94
                        },
                        {
                            "countryIso": "PH",
                            "MEASURE": 74
                        },
                        {
                            "countryIso": "PL",
                            "MEASURE": 70
                        },
                        {
                            "countryIso": "CO",
                            "MEASURE": 69
                        },
                        {
                            "countryIso": "AU",
                            "MEASURE": 65
                        },
                        {
                            "countryIso": "HK",
                            "MEASURE": 61
                        },
                        {
                            "countryIso": "MX",
                            "MEASURE": 60
                        },
                        {
                            "countryIso": "UA",
                            "MEASURE": 56
                        },
                        {
                            "countryIso": "AR",
                            "MEASURE": 53
                        },
                        {
                            "countryIso": "IL",
                            "MEASURE": 45
                        },
                        {
                            "countryIso": "NL",
                            "MEASURE": 43
                        },
                        {
                            "countryIso": "CL",
                            "MEASURE": 41
                        },
                        {
                            "countryIso": "TR",
                            "MEASURE": 35
                        },
                        {
                            "countryIso": "FI",
                            "MEASURE": 27
                        },
                        {
                            "countryIso": "SE",
                            "MEASURE": 26
                        },
                        {
                            "countryIso": "RS",
                            "MEASURE": 25
                        },
                        {
                            "countryIso": "IR",
                            "MEASURE": 25
                        },
                        {
                            "countryIso": "ID",
                            "MEASURE": 23
                        },
                        {
                            "countryIso": "CZ",
                            "MEASURE": 21
                        },
                        {
                            "countryIso": "VN",
                            "MEASURE": 20
                        },
                        {
                            "countryIso": "GR",
                            "MEASURE": 19
                        },
                        {
                            "countryIso": "BE",
                            "MEASURE": 18
                        },
                        {
                            "countryIso": "RO",
                            "MEASURE": 18
                        },
                        {
                            "countryIso": "MY",
                            "MEASURE": 18
                        },
                        {
                            "countryIso": "HU",
                            "MEASURE": 17
                        },
                        {
                            "countryIso": "DK",
                            "MEASURE": 16
                        },
                        {
                            "countryIso": "TH",
                            "MEASURE": 16
                        },
                        {
                            "countryIso": "NZ",
                            "MEASURE": 16
                        },
                        {
                            "countryIso": "NO",
                            "MEASURE": 16
                        },
                        {
                            "countryIso": "PT",
                            "MEASURE": 16
                        },
                        {
                            "countryIso": "HR",
                            "MEASURE": 15
                        },
                        {
                            "countryIso": "VE",
                            "MEASURE": 15
                        },
                        {
                            "countryIso": "PE",
                            "MEASURE": 15
                        },
                        {
                            "countryIso": "AE",
                            "MEASURE": 14
                        },
                        {
                            "countryIso": "IE",
                            "MEASURE": 13
                        },
                        {
                            "countryIso": "CN",
                            "MEASURE": 13
                        },
                        {
                            "countryIso": "CH",
                            "MEASURE": 13
                        },
                        {
                            "countryIso": "UY",
                            "MEASURE": 12
                        },
                        {
                            "countryIso": "SG",
                            "MEASURE": 12
                        },
                        {
                            "countryIso": "AT",
                            "MEASURE": 12
                        },
                        {
                            "countryIso": "KZ",
                            "MEASURE": 12
                        },
                        {
                            "countryIso": "SK",
                            "MEASURE": 12
                        },
                        {
                            "countryIso": "SA",
                            "MEASURE": 11
                        },
                        {
                            "countryIso": "PK",
                            "MEASURE": 10
                        },
                        {
                            "countryIso": "BY",
                            "MEASURE": 10
                        },
                        {
                            "countryIso": "BG",
                            "MEASURE": 9
                        },
                        {
                            "countryIso": "KW",
                            "MEASURE": 9
                        },
                        {
                            "countryIso": "ZA",
                            "MEASURE": 9
                        },
                        {
                            "countryIso": "BD",
                            "MEASURE": 9
                        },
                        {
                            "countryIso": "MA",
                            "MEASURE": 8
                        },
                        {
                            "countryIso": "CR",
                            "MEASURE": 8
                        },
                        {
                            "countryIso": "PY",
                            "MEASURE": 6
                        },
                        {
                            "countryIso": "DO",
                            "MEASURE": 6
                        },
                        {
                            "countryIso": "EC",
                            "MEASURE": 6
                        },
                        {
                            "countryIso": "PR",
                            "MEASURE": 5
                        },
                        {
                            "countryIso": "EG",
                            "MEASURE": 5
                        },
                        {
                            "countryIso": "BA",
                            "MEASURE": 5
                        },
                        {
                            "countryIso": "AO",
                            "MEASURE": 4
                        },
                        {
                            "countryIso": "GE",
                            "MEASURE": 4
                        },
                        {
                            "countryIso": "LK",
                            "MEASURE": 4
                        },
                        {
                            "countryIso": "LU",
                            "MEASURE": 4
                        },
                        {
                            "countryIso": "IQ",
                            "MEASURE": 4
                        },
                        {
                            "countryIso": "EE",
                            "MEASURE": 3
                        },
                        {
                            "countryIso": "JO",
                            "MEASURE": 3
                        },
                        {
                            "countryIso": "BO",
                            "MEASURE": 3
                        },
                        {
                            "countryIso": "MO",
                            "MEASURE": 3
                        },
                        {
                            "countryIso": "SV",
                            "MEASURE": 3
                        },
                        {
                            "countryIso": "GT",
                            "MEASURE": 3
                        },
                        {
                            "countryIso": "ZW",
                            "MEASURE": 3
                        },
                        {
                            "countryIso": "QA",
                            "MEASURE": 2
                        },
                        {
                            "countryIso": "AL",
                            "MEASURE": 2
                        },
                        {
                            "countryIso": "LT",
                            "MEASURE": 2
                        },
                        {
                            "countryIso": "GH",
                            "MEASURE": 2
                        },
                        {
                            "countryIso": "MM",
                            "MEASURE": 2
                        },
                        {
                            "countryIso": "SI",
                            "MEASURE": 2
                        },
                        {
                            "countryIso": "MD",
                            "MEASURE": 2
                        },
                        {
                            "countryIso": "MH",
                            "MEASURE": 2
                        },
                        {
                            "countryIso": "NG",
                            "MEASURE": 2
                        },
                        {
                            "countryIso": "JM",
                            "MEASURE": 1
                        },
                        {
                            "countryIso": "MR",
                            "MEASURE": 1
                        },
                        {
                            "countryIso": "MV",
                            "MEASURE": 1
                        },
                        {
                            "countryIso": "KG",
                            "MEASURE": 1
                        },
                        {
                            "countryIso": "TJ",
                            "MEASURE": 1
                        },
                        {
                            "countryIso": "ME",
                            "MEASURE": 1
                        },
                        {
                            "countryIso": "NP",
                            "MEASURE": 1
                        },
                        {
                            "countryIso": "BH",
                            "MEASURE": 1
                        },
                        {
                            "countryIso": "ZM",
                            "MEASURE": 1
                        },
                        {
                            "countryIso": "PA",
                            "MEASURE": 1
                        }
                    ],
                    "metadata": {
                        "data_scanned": 329148
                    }
                },
                "data_source_id": 1,
                "runtime": 1.36830854415894,
                "retrieved_at": "2021-10-04T06:45:31.755Z"
            }
        }
    ]
}
```
