## Api for generating reports

- Generates PlyValueJs object from hash and model

POST http://{host}/api/reports/generate/:modelID


`Limitations`
Current API works only with 1 split, 1 measure, and does not support time shift.
It's not yet handled so it will just throw.


`Body`

| Key          | Type     | Description                                                      |
| :----------- | :------- | :--------------------------------------------------------------- |
| `hash`   | `string` | **Required**. Turnillo hash. Version 4 |

Example
```json
{
     "hash": "N4IgbglgzgrghgGwgLzgFwgewHYgFwhpwBGCApiADTjTxKoY4DKZaG2A5lPqAMaYIEcAA5QyAJUwB3bngBmiMQF9qGALZlkOCgQCiaXgHoAqgBUAwlRByICNGQBOsgNqg0AT2E7CEDVYdkcvggQlBoAPowwgAm6BSqvmQACo5Y0S6g0TAO6Fi4BEkAjAAiVmFkwvgAtIWqnt5C9mEgSgC6bdRQwkhoGYT1wWEOEJxW0YnYUHnBNk4R2HB+nZgOaDwgAUEEcLwYYPH9XoOpZNzU4wG70wTRp7xk2OOj1F7DmNHBLdRIahBreABWAAMHRAYmGp3wrg2gUcD3uwR2ewOchWanQ6w8RxugTgMDsVjAiBg3i+h28GjgsACLVaLxG2DI0WKEymOBcdJAwgZTKYK3+ICREH2LSAA==="

}
```


`Responses`. The API is in beta all responses with code not equal `200` should be
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


Once polling returns status 200 the data will be cached for 60 seconds.

After 60 seconds it will create jobs again and should be polled again.




Example of initial call.
```json
{
    "data": null,
    "status": 1,
    "query": [
        {
            "job": {
                "id": "21b75d58-9fd3-443e-a719-e036a7030ee7",
                "updated_at": 0,
                "status": 1,
                "error": "",
                "result": null,
                "query_result_id": null
            }
        },
        {
            "job": {
                "id": "07978484-ab14-44f3-b03a-2446d36ef258",
                "updated_at": 0,
                "status": 1,
                "error": "",
                "result": null,
                "query_result_id": null
            }
        }
    ]
}
```

Example of next call. (Within max age time).

```json
{
    "data": {
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
                "active": 584,
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
                            "first_name": "Marion",
                            "active": 2
                        },
                        {
                            "first_name": "Leslie",
                            "active": 2
                        },
                        {
                            "first_name": "Terry",
                            "active": 2
                        },
                        {
                            "first_name": "Tracy",
                            "active": 2
                        },
                        {
                            "first_name": "Jamie",
                            "active": 2
                        },
                        {
                            "first_name": "Willie",
                            "active": 2
                        },
                        {
                            "first_name": "Kelly",
                            "active": 2
                        },
                        {
                            "first_name": "Jessie",
                            "active": 2
                        },
                        {
                            "first_name": "Jennifer",
                            "active": 1
                        },
                        {
                            "first_name": "Greg",
                            "active": 1
                        },
                        {
                            "first_name": "Nicholas",
                            "active": 1
                        },
                        {
                            "first_name": "Lois",
                            "active": 1
                        },
                        {
                            "first_name": "Nathaniel",
                            "active": 1
                        },
                        {
                            "first_name": "Lynn",
                            "active": 1
                        },
                        {
                            "first_name": "Tommy",
                            "active": 1
                        },
                        {
                            "first_name": "Ricky",
                            "active": 1
                        },
                        {
                            "first_name": "Wesley",
                            "active": 1
                        },
                        {
                            "first_name": "Frank",
                            "active": 1
                        },
                        {
                            "first_name": "Andre",
                            "active": 1
                        },
                        {
                            "first_name": "Fernando",
                            "active": 1
                        },
                        {
                            "first_name": "Enrique",
                            "active": 1
                        },
                        {
                            "first_name": "April",
                            "active": 1
                        },
                        {
                            "first_name": "Lorraine",
                            "active": 1
                        },
                        {
                            "first_name": "Ross",
                            "active": 1
                        },
                        {
                            "first_name": "Donna",
                            "active": 1
                        },
                        {
                            "first_name": "Vivian",
                            "active": 1
                        },
                        {
                            "first_name": "Norman",
                            "active": 1
                        },
                        {
                            "first_name": "Clinton",
                            "active": 1
                        },
                        {
                            "first_name": "Keith",
                            "active": 1
                        },
                        {
                            "first_name": "Ricardo",
                            "active": 1
                        },
                        {
                            "first_name": "Glenda",
                            "active": 1
                        },
                        {
                            "first_name": "Milton",
                            "active": 1
                        },
                        {
                            "first_name": "Marjorie",
                            "active": 1
                        },
                        {
                            "first_name": "Bryan",
                            "active": 1
                        },
                        {
                            "first_name": "Rhonda",
                            "active": 1
                        },
                        {
                            "first_name": "Loretta",
                            "active": 1
                        },
                        {
                            "first_name": "Kyle",
                            "active": 1
                        },
                        {
                            "first_name": "Andy",
                            "active": 1
                        },
                        {
                            "first_name": "Willard",
                            "active": 1
                        },
                        {
                            "first_name": "Mark",
                            "active": 1
                        },
                        {
                            "first_name": "Harold",
                            "active": 1
                        },
                        {
                            "first_name": "Jordan",
                            "active": 1
                        },
                        {
                            "first_name": "Charlotte",
                            "active": 1
                        },
                        {
                            "first_name": "Vernon",
                            "active": 1
                        },
                        {
                            "first_name": "Cheryl",
                            "active": 1
                        },
                        {
                            "first_name": "Stacy",
                            "active": 1
                        },
                        {
                            "first_name": "Ronald",
                            "active": 1
                        },
                        {
                            "first_name": "Rosa",
                            "active": 1
                        },
                        {
                            "first_name": "Randy",
                            "active": 1
                        },
                        {
                            "first_name": "Hugh",
                            "active": 1
                        }
                    ]
                }
            }
        ]
    },
    "status": 200,
    "query": [
        {
            "query_result": {
                "id": 78,
                "query_hash": "3bbd2e69f437cfa717eed9eea34539a4",
                "query": "SELECT SUM(\"active\") AS \"__VALUE__\" FROM \"customer\" AS t WHERE (TIMESTAMP '2021-06-25 10:56:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-06-26 10:56:00') GROUP BY ''=''",
                "data": {
                    "columns": [
                        {
                            "name": "__VALUE__",
                            "friendly_name": "__VALUE__",
                            "type": "integer"
                        }
                    ],
                    "rows": [
                        {
                            "__VALUE__": 584
                        }
                    ]
                },
                "data_source_id": 1,
                "runtime": 0.00704073905944824,
                "retrieved_at": "2021-06-26T10:55:14.034Z"
            }
        },
        {
            "query_result": {
                "id": 79,
                "query_hash": "ba50f5cdf1966518c970bc202fd9e6d3",
                "query": "SELECT \"first_name\" AS \"first_name\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE (TIMESTAMP '2021-06-25 10:56:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-06-26 10:56:00') GROUP BY 1 ORDER BY \"active\" DESC LIMIT 50",
                "data": {
                    "columns": [
                        {
                            "name": "first_name",
                            "friendly_name": "first_name",
                            "type": null
                        },
                        {
                            "name": "active",
                            "friendly_name": "active",
                            "type": "integer"
                        }
                    ],
                    "rows": [
                        {
                            "first_name": "Marion",
                            "active": 2
                        },
                        {
                            "first_name": "Leslie",
                            "active": 2
                        },
                        {
                            "first_name": "Terry",
                            "active": 2
                        },
                        {
                            "first_name": "Tracy",
                            "active": 2
                        },
                        {
                            "first_name": "Jamie",
                            "active": 2
                        },
                        {
                            "first_name": "Willie",
                            "active": 2
                        },
                        {
                            "first_name": "Kelly",
                            "active": 2
                        },
                        {
                            "first_name": "Jessie",
                            "active": 2
                        },
                        {
                            "first_name": "Jennifer",
                            "active": 1
                        },
                        {
                            "first_name": "Greg",
                            "active": 1
                        },
                        {
                            "first_name": "Nicholas",
                            "active": 1
                        },
                        {
                            "first_name": "Lois",
                            "active": 1
                        },
                        {
                            "first_name": "Nathaniel",
                            "active": 1
                        },
                        {
                            "first_name": "Lynn",
                            "active": 1
                        },
                        {
                            "first_name": "Tommy",
                            "active": 1
                        },
                        {
                            "first_name": "Ricky",
                            "active": 1
                        },
                        {
                            "first_name": "Wesley",
                            "active": 1
                        },
                        {
                            "first_name": "Frank",
                            "active": 1
                        },
                        {
                            "first_name": "Andre",
                            "active": 1
                        },
                        {
                            "first_name": "Fernando",
                            "active": 1
                        },
                        {
                            "first_name": "Enrique",
                            "active": 1
                        },
                        {
                            "first_name": "April",
                            "active": 1
                        },
                        {
                            "first_name": "Lorraine",
                            "active": 1
                        },
                        {
                            "first_name": "Ross",
                            "active": 1
                        },
                        {
                            "first_name": "Donna",
                            "active": 1
                        },
                        {
                            "first_name": "Vivian",
                            "active": 1
                        },
                        {
                            "first_name": "Norman",
                            "active": 1
                        },
                        {
                            "first_name": "Clinton",
                            "active": 1
                        },
                        {
                            "first_name": "Keith",
                            "active": 1
                        },
                        {
                            "first_name": "Ricardo",
                            "active": 1
                        },
                        {
                            "first_name": "Glenda",
                            "active": 1
                        },
                        {
                            "first_name": "Milton",
                            "active": 1
                        },
                        {
                            "first_name": "Marjorie",
                            "active": 1
                        },
                        {
                            "first_name": "Bryan",
                            "active": 1
                        },
                        {
                            "first_name": "Rhonda",
                            "active": 1
                        },
                        {
                            "first_name": "Loretta",
                            "active": 1
                        },
                        {
                            "first_name": "Kyle",
                            "active": 1
                        },
                        {
                            "first_name": "Andy",
                            "active": 1
                        },
                        {
                            "first_name": "Willard",
                            "active": 1
                        },
                        {
                            "first_name": "Mark",
                            "active": 1
                        },
                        {
                            "first_name": "Harold",
                            "active": 1
                        },
                        {
                            "first_name": "Jordan",
                            "active": 1
                        },
                        {
                            "first_name": "Charlotte",
                            "active": 1
                        },
                        {
                            "first_name": "Vernon",
                            "active": 1
                        },
                        {
                            "first_name": "Cheryl",
                            "active": 1
                        },
                        {
                            "first_name": "Stacy",
                            "active": 1
                        },
                        {
                            "first_name": "Ronald",
                            "active": 1
                        },
                        {
                            "first_name": "Rosa",
                            "active": 1
                        },
                        {
                            "first_name": "Randy",
                            "active": 1
                        },
                        {
                            "first_name": "Hugh",
                            "active": 1
                        }
                    ]
                },
                "data_source_id": 1,
                "runtime": 0.00741147994995117,
                "retrieved_at": "2021-06-26T10:55:14.105Z"
            }
        }
    ],
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


