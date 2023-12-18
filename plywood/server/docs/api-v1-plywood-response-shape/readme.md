## Api documentation

Returns shape of PlywoodValue from DataCube and Expression with dummy values.

```http
POST /api/v1/plywood/response-shape
```

`Body`

| Key          | Type     | Description                                                      |
| :----------- | :------- | :--------------------------------------------------------------- |
| `dataCube`   | `string` | **Required**. Name of DataCube should be the same as source name |
| `context`    | `object` | **Required**. Context literally DataCubeJs value                 |
| `expression` | `object` | **Required**. Expression to evaluate shape for                   |

Example:

```json
{
  "dataCube": "customer",
  "context": {
    "engine": "postgres",
    "source": "customer",
    "attributes": [
      {
        "name": "active",
        "type": "NUMBER",
        "nativeType": "INTEGER"
      },
      {
        "name": "activebool",
        "type": "BOOLEAN",
        "nativeType": "BOOLEAN"
      },
      {
        "name": "address_id",
        "type": "NUMBER",
        "nativeType": "INTEGER"
      },
      {
        "name": "customer_id",
        "type": "NUMBER",
        "nativeType": "INTEGER"
      },
      {
        "name": "email",
        "type": "STRING",
        "nativeType": "CHARACTER VARYING"
      },
      {
        "name": "first_name",
        "type": "STRING",
        "nativeType": "CHARACTER VARYING"
      },
      {
        "name": "last_name",
        "type": "STRING",
        "nativeType": "CHARACTER VARYING"
      },
      {
        "name": "last_update",
        "type": "TIME",
        "nativeType": "TIMESTAMP WITHOUT TIME ZONE"
      },
      {
        "name": "store_id",
        "type": "NUMBER",
        "nativeType": "INTEGER"
      }
    ]
  },
  "expression": {
    "op": "apply",
    "operand": {
      "op": "apply",
      "operand": {
        "op": "apply",
        "operand": {
          "op": "apply",
          "operand": {
            "op": "literal",
            "value": {
              "attributes": [],
              "data": [{}]
            },
            "type": "DATASET"
          },
          "expression": {
            "op": "filter",
            "operand": {
              "op": "ref",
              "name": "customer"
            },
            "expression": {
              "op": "overlap",
              "operand": {
                "op": "ref",
                "name": "last_update"
              },
              "expression": {
                "op": "literal",
                "value": {
                  "setType": "TIME_RANGE",
                  "elements": [
                    {
                      "start": "2021-06-24T06:58:00.000Z",
                      "end": "2021-06-25T06:58:00.000Z"
                    }
                  ]
                },
                "type": "SET"
              }
            }
          },
          "name": "customer"
        },
        "expression": {
          "op": "literal",
          "value": 86400000
        },
        "name": "MillisecondsInInterval"
      },
      "expression": {
        "op": "sum",
        "operand": {
          "op": "ref",
          "name": "customer"
        },
        "expression": {
          "op": "ref",
          "name": "active"
        }
      },
      "name": "active"
    },
    "expression": {
      "op": "limit",
      "operand": {
        "op": "sort",
        "operand": {
          "op": "apply",
          "operand": {
            "op": "split",
            "operand": {
              "op": "ref",
              "name": "customer"
            },
            "name": "first_name",
            "expression": {
              "op": "ref",
              "name": "first_name"
            },
            "dataName": "customer"
          },
          "expression": {
            "op": "sum",
            "operand": {
              "op": "ref",
              "name": "customer"
            },
            "expression": {
              "op": "ref",
              "name": "active"
            }
          },
          "name": "active"
        },
        "expression": {
          "op": "ref",
          "name": "active"
        },
        "direction": "descending"
      },
      "value": 50
    },
    "name": "SPLIT"
  }
}
```


Responses other than 200 should be considered as fail.

Response `200`:


`shape` contains PlywoodValue of correct shape but with dummy values.

```json
{
    "shape": {
        "attributes": [
            {
                "name": "customer",
                "type": "DATASET"
            },
            {
                "name": "MillisecondsInInterval",
                "type": "NUMBER"
            },
            {
                "name": "active",
                "type": "NUMBER"
            },
            {
                "name": "SPLIT",
                "type": "DATASET"
            }
        ],
        "data": [
            {
                "MillisecondsInInterval": 86400000,
                "active": 4,
                "SPLIT": {
                    "keys": [
                        "first_name"
                    ],
                    "attributes": [
                        {
                            "name": "first_name",
                            "type": "STRING"
                        },
                        {
                            "name": "active",
                            "type": "NUMBER"
                        }
                    ],
                    "data": [
                        {
                            "first_name": "some_first_name",
                            "active": 4
                        }
                    ]
                }
            }
        ]
    }
}
```
