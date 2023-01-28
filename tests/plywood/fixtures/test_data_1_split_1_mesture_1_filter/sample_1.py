POSTGRES_1_SLIT_JOBS = [
    {
        "query_result": {
            "id": 100,
            "query_hash": "b628d41b9c0f8cfed8693b546e4fd53f",
            "query": "SELECT SUM(\"active\") AS \"__VALUE__\" FROM \"customer\" AS t WHERE (TIMESTAMP '2021-06-30 14:43:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-01 14:43:00') GROUP BY ''=''",
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
            "runtime": 0.00499582290649414,
            "retrieved_at": "2021-07-01T14:42:04.903Z"
        }
    },
    {
        "query_result": {
            "id": 101,
            "query_hash": "f79f44df2734516cc8144ebcc7bc8b73",
            "query": "SELECT \"first_name\" AS \"first_name\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE (TIMESTAMP '2021-06-30 14:43:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-01 14:43:00') GROUP BY 1 ORDER BY \"active\" DESC LIMIT 50",
            "data": {
                "columns": [
                    {
                        "name": "first_name",
                        "friendly_name": "first_name",
                        "type": None
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "first_name": "Tracy",
                        "active": 2
                    },
                    {
                        "first_name": "Leslie",
                        "active": 2
                    },
                    {
                        "first_name": "Jamie",
                        "active": 2
                    },
                    {
                        "first_name": "Marion",
                        "active": 2
                    },
                    {
                        "first_name": "Jessie",
                        "active": 2
                    },
                    {
                        "first_name": "Kelly",
                        "active": 2
                    },
                    {
                        "first_name": "Terry",
                        "active": 2
                    },
                    {
                        "first_name": "Willie",
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
                        "first_name": "Cheryl",
                        "active": 1
                    },
                    {
                        "first_name": "Carlos",
                        "active": 1
                    },
                    {
                        "first_name": "Brett",
                        "active": 1
                    },
                    {
                        "first_name": "Heather",
                        "active": 1
                    },
                    {
                        "first_name": "Lewis",
                        "active": 1
                    },
                    {
                        "first_name": "Jimmy",
                        "active": 1
                    },
                    {
                        "first_name": "Gene",
                        "active": 1
                    },
                    {
                        "first_name": "Jerry",
                        "active": 1
                    },
                    {
                        "first_name": "Charlotte",
                        "active": 1
                    },
                    {
                        "first_name": "Randy",
                        "active": 1
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.00493335723876953,
            "retrieved_at": "2021-07-01T14:42:04.968Z"
        }
    }
]

TEST_DATA_1_SPLIT_SHAPE = {
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

POSTGRES_1_SPLIT_RESULT = {
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
                        "first_name": "Tracy",
                        "active": 2
                    },
                    {
                        "first_name": "Leslie",
                        "active": 2
                    },
                    {
                        "first_name": "Jamie",
                        "active": 2
                    },
                    {
                        "first_name": "Marion",
                        "active": 2
                    },
                    {
                        "first_name": "Jessie",
                        "active": 2
                    },
                    {
                        "first_name": "Kelly",
                        "active": 2
                    },
                    {
                        "first_name": "Terry",
                        "active": 2
                    },
                    {
                        "first_name": "Willie",
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
                        "first_name": "Cheryl",
                        "active": 1
                    },
                    {
                        "first_name": "Carlos",
                        "active": 1
                    },
                    {
                        "first_name": "Brett",
                        "active": 1
                    },
                    {
                        "first_name": "Heather",
                        "active": 1
                    },
                    {
                        "first_name": "Lewis",
                        "active": 1
                    },
                    {
                        "first_name": "Jimmy",
                        "active": 1
                    },
                    {
                        "first_name": "Gene",
                        "active": 1
                    },
                    {
                        "first_name": "Jerry",
                        "active": 1
                    },
                    {
                        "first_name": "Charlotte",
                        "active": 1
                    },
                    {
                        "first_name": "Randy",
                        "active": 1
                    }
                ]
            }
        }
    ]
}
