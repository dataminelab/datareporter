POSTGRES_0_SPLIT_JOBS_TIMESHIFT = [
    {
        "query_result": {
            "id": 103,
            "query_hash": "f79e628ec0bfa40a228ad3d948177f18",
            "query": "SELECT SUM(\"active\") AS \"active\", SUM(\"active\") AS \"_previous__active\", (SUM(\"active\")-SUM(\"active\")) AS \"_delta__active\" FROM \"customer\" AS t WHERE (TIMESTAMP '2021-06-30 14:47:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-01 14:47:00') OR (TIMESTAMP '2021-03-30 14:47:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-04-01 14:47:00') GROUP BY ''=''",
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
            "runtime": 0.00501132011413574,
            "retrieved_at": "2021-07-01T14:46:01.326Z"
        }
    }
]

POSTGRES_0_SPLIT_SHAPE_TIMESHIFT = {
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
        }
    ],
    "data": [
        {
            "MillisecondsInInterval": 86400000,
            "active": 4,
            "_previous__active": 4,
            "_delta__active": 4
        }
    ]
}

POSTGRES_0_SPLIT_RESULT_TIMESHIFT = {
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
        }
    ],
    "data": [
        {
            "MillisecondsInInterval": 86400000,
            "active": 584,
            "_previous__active": 584,
            "_delta__active": 0
        }
    ]
}
