POSTGRES_0_SPLIT_JOBS = [
    {
        "query_result": {
            "id": 99,
            "query_hash": "ab6cd89a28e6d1620557ed8c1370c1ef",
            "query": "SELECT SUM(\"active\") AS \"__VALUE__\" FROM \"customer\" AS t WHERE (TIMESTAMP '2021-06-30 13:31:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-01 13:31:00') GROUP BY ''=''",
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
            "runtime": 0.00545287132263184,
            "retrieved_at": "2021-07-01T13:30:06.753Z"
        }
    }
]

POSTGRES_0_SPLIT_SHAPE = {
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
        }
    ],
    "data": [
        {
            "MillisecondsInInterval": 86400000,
            "active": 4
        }
    ]
}

POSTGRES_0_SPLIT_RESULT = {
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
        }
    ],
    "data": [
        {
            "MillisecondsInInterval": 86400000,
            "active": 584
        }
    ]
}
