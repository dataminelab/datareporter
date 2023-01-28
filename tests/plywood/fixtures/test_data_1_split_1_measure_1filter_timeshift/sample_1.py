POSTGRES_1_SPLIT_JOBS_TIMESHIFT = [
    {
        "query_result": {
            "id": 106,
            "query_hash": "9205bdad8ad4fe1b3b03b0eace878201",
            "query": "SELECT SUM(\"active\") AS \"active\", SUM(\"active\") AS \"_previous__active\", (SUM(\"active\")-SUM(\"active\")) AS \"_delta__active\" FROM \"customer\" AS t WHERE (TIMESTAMP '2021-07-01 06:25:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-02 06:25:00') OR (TIMESTAMP '2021-04-01 06:25:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-04-02 06:25:00') GROUP BY ''=''",
            "data": {
                "columns": [
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    },
                    {
                        "name": "_previous__active",
                        "friendly_name": "_previous__active",
                        "type": "integer"
                    },
                    {
                        "name": "_delta__active",
                        "friendly_name": "_delta__active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "active": 584,
                        "_previous__active": 584,
                        "_delta__active": 0
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.0044407844543457,
            "retrieved_at": "2021-07-02T06:24:20.484Z"
        }
    },
    {
        "query_result": {
            "id": 107,
            "query_hash": "28eaaf090a8bc378a514feff9781497b",
            "query": "SELECT \"first_name\" AS \"first_name\", SUM(\"active\") AS \"active\", SUM(\"active\") AS \"_previous__active\", (SUM(\"active\")-SUM(\"active\")) AS \"_delta__active\" FROM \"customer\" AS t WHERE (TIMESTAMP '2021-07-01 06:25:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-02 06:25:00') OR (TIMESTAMP '2021-04-01 06:25:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-04-02 06:25:00') GROUP BY 1 ORDER BY \"active\" DESC LIMIT 50",
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
                    },
                    {
                        "name": "_previous__active",
                        "friendly_name": "_previous__active",
                        "type": "integer"
                    },
                    {
                        "name": "_delta__active",
                        "friendly_name": "_delta__active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "first_name": "Tracy",
                        "active": 2,
                        "_previous__active": 2,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Leslie",
                        "active": 2,
                        "_previous__active": 2,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Jamie",
                        "active": 2,
                        "_previous__active": 2,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Marion",
                        "active": 2,
                        "_previous__active": 2,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Jessie",
                        "active": 2,
                        "_previous__active": 2,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Kelly",
                        "active": 2,
                        "_previous__active": 2,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Terry",
                        "active": 2,
                        "_previous__active": 2,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Willie",
                        "active": 2,
                        "_previous__active": 2,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Jennifer",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Greg",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Nicholas",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Lois",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Nathaniel",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Lynn",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Tommy",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Ricky",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Wesley",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Frank",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Andre",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Fernando",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Enrique",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "April",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Lorraine",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Ross",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Donna",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Vivian",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Norman",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Clinton",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Keith",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Ricardo",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Glenda",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Milton",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Marjorie",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Bryan",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Rhonda",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Loretta",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Kyle",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Andy",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Willard",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Mark",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Cheryl",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Carlos",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Brett",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Heather",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Lewis",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Jimmy",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Gene",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Jerry",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Charlotte",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Randy",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.0105466842651367,
            "retrieved_at": "2021-07-02T06:24:20.553Z"
        }
    }
]

POSTGRES_1_SPLIT_SHAPE_TIMESHIFT = {
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
            "name": "_previous__active",
            "type": "NUMBER"
        },
        {
            "name": "_delta__active",
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
            "_previous__active": 4,
            "_delta__active": 4,
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
                        "name": "_delta__active",
                        "type": "NUMBER"
                    },
                    {
                        "name": "_previous__active",
                        "type": "NUMBER"
                    },
                    {
                        "name": "active",
                        "type": "NUMBER"
                    }
                ],
                "data": [
                    {
                        "first_name": "some_first_name",
                        "active": 4,
                        "_previous__active": 4,
                        "_delta__active": 4
                    }
                ]
            }
        }
    ]
}

POSTGRES_1_SPLIT_RESULT_TIMESHIFT = {
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
            "name": "_previous__active",
            "type": "NUMBER"
        },
        {
            "name": "_delta__active",
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
            "_previous__active": 584,
            "_delta__active": 0,
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
                        "name": "_delta__active",
                        "type": "NUMBER"
                    },
                    {
                        "name": "_previous__active",
                        "type": "NUMBER"
                    },
                    {
                        "name": "active",
                        "type": "NUMBER"
                    }
                ],
                "data": [
                    {
                        "first_name": "Tracy",
                        "active": 2,
                        "_previous__active": 2,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Leslie",
                        "active": 2,
                        "_previous__active": 2,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Jamie",
                        "active": 2,
                        "_previous__active": 2,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Marion",
                        "active": 2,
                        "_previous__active": 2,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Jessie",
                        "active": 2,
                        "_previous__active": 2,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Kelly",
                        "active": 2,
                        "_previous__active": 2,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Terry",
                        "active": 2,
                        "_previous__active": 2,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Willie",
                        "active": 2,
                        "_previous__active": 2,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Jennifer",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Greg",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Nicholas",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Lois",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Nathaniel",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Lynn",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Tommy",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Ricky",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Wesley",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Frank",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Andre",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Fernando",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Enrique",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "April",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Lorraine",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Ross",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Donna",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Vivian",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Norman",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Clinton",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Keith",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Ricardo",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Glenda",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Milton",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Marjorie",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Bryan",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Rhonda",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Loretta",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Kyle",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Andy",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Willard",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Mark",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Cheryl",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Carlos",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Brett",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Heather",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Lewis",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Jimmy",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Gene",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Jerry",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Charlotte",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    },
                    {
                        "first_name": "Randy",
                        "active": 1,
                        "_previous__active": 1,
                        "_delta__active": 0
                    }
                ]
            }
        }
    ]
}

