## Api documentation

Generates expression from hash and DataCube.

```http
POST /api/v1/plywood/expression
```

`Body`

| Key        | Type     | Description                                                            |
| :--------- | :------- | :--------------------------------------------------------------------- |
| `hash`     | `string` | **Required**. Turnillo hash without version.(All are version 4 hashes) |
| `dataCube` | `object` | **Required**. Full DataCubeJS object.                                  |

Example:

```json
{
  "hash": "N4IgbglgzgrghgGwgLzgFwgewHYgFwhpwBGCApiADTjTxKoY4DKZaG2A5lPqAMaYIEcAA5QyAJUwB3bngBmiMQF9qGALZlkOCgQCiaXgHoAqgBUAwlRByICNGQBOsgNqg0AT2E7CEDVYdkcvggQlBoAPowwgAm6BSqvmQACo5Y0S6g0TAO6Fi4BEkAjAAiVmFkwvgAtIWqnt5C9mEgSgC6Km71wWEOEJz+gcGhEdhwftRwvIz5IH1WYIgwZC4gksSOaFYAsrbkDlYAEjDYm63U2Jib8opkbdRQwkhoGYRdBD19HFbRidhQecFJhgwGRiJgBGVMA4rqAAkECECICCrB4vN1UstvhAAlMAQRosteGRsD9+tQvL1MNFgi1qEg1BArgBWDqvNHvNC9MkgH4aP546zYsLhUbjEBQKEwkBwwG45F1dnijHcag/HHTYIEqBEkmfKwUtI0lQhXyM/Ass5K3qYvCuaWBRzEomy4HxaxQtToHhs7wEhQwOzzRbeWk+4IaOCwAItS3CPrYMjRYq/f44Fyx+OJpiSl1IihKIA===",
  "dataCube": {
    "name": "customer",
    "title": "Customer",
    "timeAttribute": "last_update",
    "clusterName": "native",
    "source": "customer",
    "defaultSortMeasure": "active",
    "defaultSelectedMeasures": ["active"],
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
    ],
    "dimensions": [
      {
        "name": "activebool",
        "title": "Activebool",
        "formula": "$activebool",
        "kind": "boolean"
      },
      {
        "name": "create_date",
        "title": "Create Date",
        "formula": "$create_date"
      },
      {
        "name": "email",
        "title": "Email",
        "formula": "$email"
      },
      {
        "name": "first_name",
        "title": "First Name",
        "formula": "$first_name"
      },
      {
        "name": "last_name",
        "title": "Last Name",
        "formula": "$last_name"
      },
      {
        "name": "last_update",
        "title": "Last Update",
        "formula": "$last_update",
        "kind": "time"
      }
    ],
    "measures": [
      {
        "name": "active",
        "title": "Active",
        "formula": "$main.sum($active)"
      },
      {
        "name": "address_id",
        "title": "Address",
        "formula": "$main.sum($address_id)"
      },
      {
        "name": "customer_id",
        "title": "Customer",
        "formula": "$main.sum($customer_id)"
      },
      {
        "name": "store_id",
        "title": "Store",
        "formula": "$main.sum($store_id)"
      }
    ]
  }
}
```

Other responses than 200 and 400 should be considered as fail.

Response `400`:
If one of the arguments is not passed.

Response example

```json
{
  "message": "hash not defined",
  "field": "hash"
}
```

Response `200`:

WIll return only expression object

```json
{
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
            "op": "and",
            "operand": {
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
                      "start": "2021-06-25T09:20:00.000Z",
                      "end": "2021-06-26T09:20:00.000Z"
                    }
                  ]
                },
                "type": "SET"
              }
            },
            "expression": {
              "op": "overlap",
              "operand": {
                "op": "ref",
                "name": "last_name"
              },
              "expression": {
                "op": "literal",
                "value": {
                  "setType": "STRING",
                  "elements": ["Robert", "Miller", "Hunt"]
                },
                "type": "SET"
              }
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
    "op": "apply",
    "operand": {
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
            "name": "activebool",
            "expression": {
              "op": "ref",
              "name": "activebool"
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
      "value": 5
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
      "value": 5
    },
    "name": "SPLIT"
  },
  "name": "SPLIT"
}
```
