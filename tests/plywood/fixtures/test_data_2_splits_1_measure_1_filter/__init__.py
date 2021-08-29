POSTGRES_2_SLIT_JOBS = [
    {
        "query_result": {
            "id": 3402,
            "query_hash": "faea2e73fa10936ce586059a9bbcbd19",
            "query": "SELECT SUM(\"active\") AS \"__VALUE__\" FROM \"customer\" AS t WHERE (TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') GROUP BY ''=''",
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
            "runtime": 0.00552678108215332,
            "retrieved_at": "2021-07-08T14:40:04.589Z"
        }
    },
    {
        "query_result": {
            "id": 3403,
            "query_hash": "b3e60b3a412ac8ecefefa47fed11ee96",
            "query": "SELECT \"first_name\" AS \"first_name\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE (TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') GROUP BY 1 ORDER BY \"active\" DESC LIMIT 50",
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
                        "first_name": "Herbert",
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
                        "first_name": "Frank",
                        "active": 1
                    },
                    {
                        "first_name": "Wesley",
                        "active": 1
                    },
                    {
                        "first_name": "Ricky",
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
                        "first_name": "Helen",
                        "active": 1
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.0057985782623291,
            "retrieved_at": "2021-07-08T14:40:04.653Z"
        }
    },
    {
        "query_result": {
            "id": 3405,
            "query_hash": "b4106c2eb88407b86c5ee7f29752c0ab",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Tracy')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 2
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.00582122802734375,
            "retrieved_at": "2021-07-08T14:40:08.598Z"
        }
    },
    {
        "query_result": {
            "id": 3406,
            "query_hash": "a0cb37ec42457a590d5381d0aed2dbe7",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Leslie')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 2
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.00663185119628906,
            "retrieved_at": "2021-07-08T14:40:08.681Z"
        }
    },
    {
        "query_result": {
            "id": 3407,
            "query_hash": "fcb9c19c7102658f1c8995580f274d5e",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Jamie')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 2
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.00673246383666992,
            "retrieved_at": "2021-07-08T14:40:08.757Z"
        }
    },
    {
        "query_result": {
            "id": 3408,
            "query_hash": "d546a487d616a89e3b62aaa8dc3ee138",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Marion')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 2
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.0097649097442627,
            "retrieved_at": "2021-07-08T14:40:08.885Z"
        }
    },
    {
        "query_result": {
            "id": 3409,
            "query_hash": "de6adc9ca47f46ee6af6c6655cecbcd1",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Jessie')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 2
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.00567340850830078,
            "retrieved_at": "2021-07-08T14:40:08.976Z"
        }
    },
    {
        "query_result": {
            "id": 3410,
            "query_hash": "7f86ba5d9a37a78c75af30fffcd03803",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Kelly')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 2
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.00667047500610352,
            "retrieved_at": "2021-07-08T14:40:09.050Z"
        }
    },
    {
        "query_result": {
            "id": 3411,
            "query_hash": "6ea2468b4fa53ccc8f78ab27e0b3e29a",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Terry')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 2
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.00605249404907227,
            "retrieved_at": "2021-07-08T14:40:09.121Z"
        }
    },
    {
        "query_result": {
            "id": 3412,
            "query_hash": "d64c9091e0761474b3aeab275d8ad8fb",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Willie')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 2
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.00643038749694824,
            "retrieved_at": "2021-07-08T14:40:09.205Z"
        }
    },
    {
        "query_result": {
            "id": 3413,
            "query_hash": "0574ee9c3e56cae453c196f8db3294e6",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Herbert')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 1
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.00587320327758789,
            "retrieved_at": "2021-07-08T14:40:11.593Z"
        }
    },
    {
        "query_result": {
            "id": 3414,
            "query_hash": "d355d98b006e19c7d407a46a832836f1",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Greg')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 1
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.00557661056518555,
            "retrieved_at": "2021-07-08T14:40:11.661Z"
        }
    },
    {
        "query_result": {
            "id": 3415,
            "query_hash": "efb297cfbe87bf31f94cc0704ec08960",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Nicholas')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 1
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.00542974472045898,
            "retrieved_at": "2021-07-08T14:40:11.729Z"
        }
    },
    {
        "query_result": {
            "id": 3416,
            "query_hash": "3c71727fe540c979db4171601e759c16",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Lois')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 1
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.00564718246459961,
            "retrieved_at": "2021-07-08T14:40:11.794Z"
        }
    },
    {
        "query_result": {
            "id": 3417,
            "query_hash": "b4c48076f039725cb22d520cd8475244",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Nathaniel')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 1
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.00566673278808594,
            "retrieved_at": "2021-07-08T14:40:11.858Z"
        }
    },
    {
        "query_result": {
            "id": 3418,
            "query_hash": "1d948db5e92cb6070a9dafc66a0869d7",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Lynn')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 1
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.00554704666137695,
            "retrieved_at": "2021-07-08T14:40:11.924Z"
        }
    },
    {
        "query_result": {
            "id": 3419,
            "query_hash": "7167f7c39389796839a307d25256e23f",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Tommy')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 1
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.00525498390197754,
            "retrieved_at": "2021-07-08T14:40:11.991Z"
        }
    },
    {
        "query_result": {
            "id": 3420,
            "query_hash": "808de1b4cd711f58c6562d87de8c2ffe",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Frank')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 1
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.0056149959564209,
            "retrieved_at": "2021-07-08T14:40:12.055Z"
        }
    },
    {
        "query_result": {
            "id": 3421,
            "query_hash": "60d39bb35275e9e669858777d21e13ce",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Wesley')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 1
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.00525879859924316,
            "retrieved_at": "2021-07-08T14:40:12.120Z"
        }
    },
    {
        "query_result": {
            "id": 3422,
            "query_hash": "ec1cf774b6c6684b02d3038c7044e876",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Ricky')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 1
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.00546836853027344,
            "retrieved_at": "2021-07-08T14:40:12.191Z"
        }
    },
    {
        "query_result": {
            "id": 3423,
            "query_hash": "705542e24d37aef3f61392a36dcc1994",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Andre')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 1
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.00557160377502441,
            "retrieved_at": "2021-07-08T14:40:12.258Z"
        }
    },
    {
        "query_result": {
            "id": 3424,
            "query_hash": "53c07d948e7dfeea3f7dce9ff0a85809",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Fernando')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 1
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.00522017478942871,
            "retrieved_at": "2021-07-08T14:40:12.324Z"
        }
    },
    {
        "query_result": {
            "id": 3425,
            "query_hash": "1232709a3a6bb2c2eae7af3b45b7ecc7",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Enrique')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 1
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.00572609901428223,
            "retrieved_at": "2021-07-08T14:40:12.391Z"
        }
    },
    {
        "query_result": {
            "id": 3426,
            "query_hash": "9c97b40cefc655d8b5a6246b129bde62",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'April')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 1
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.0070035457611084,
            "retrieved_at": "2021-07-08T14:40:12.458Z"
        }
    },
    {
        "query_result": {
            "id": 3427,
            "query_hash": "338360a3e5872bc5dd4933f08e3d1458",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Lorraine')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 1
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.00542712211608887,
            "retrieved_at": "2021-07-08T14:40:12.524Z"
        }
    },
    {
        "query_result": {
            "id": 3428,
            "query_hash": "b26ef419f8c8309eba17a35590600413",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Ross')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 1
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.00888299942016602,
            "retrieved_at": "2021-07-08T14:40:12.592Z"
        }
    },
    {
        "query_result": {
            "id": 3429,
            "query_hash": "5d5e0c790443788097fd424217396dd8",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Donna')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 1
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.0056309700012207,
            "retrieved_at": "2021-07-08T14:40:12.657Z"
        }
    },
    {
        "query_result": {
            "id": 3430,
            "query_hash": "010e26b4509094705b939d8febbf428b",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Vivian')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 1
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.00538372993469238,
            "retrieved_at": "2021-07-08T14:40:12.723Z"
        }
    },
    {
        "query_result": {
            "id": 3431,
            "query_hash": "e0e39c75dbe0f29c4ee12caf1a03b03d",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Norman')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 1
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.00541067123413086,
            "retrieved_at": "2021-07-08T14:40:12.787Z"
        }
    },
    {
        "query_result": {
            "id": 3432,
            "query_hash": "d00f3dbe63f25d5227d2bc0fd23bf7ec",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Clinton')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 1
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.00545096397399902,
            "retrieved_at": "2021-07-08T14:40:12.853Z"
        }
    },
    {
        "query_result": {
            "id": 3433,
            "query_hash": "351f3c8ec53bc847d8e8c666826012e9",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Keith')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 1
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.00526189804077148,
            "retrieved_at": "2021-07-08T14:40:12.917Z"
        }
    },
    {
        "query_result": {
            "id": 3434,
            "query_hash": "edde9758f7b3e4112be2585f99af6e39",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Ricardo')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 1
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.00558209419250488,
            "retrieved_at": "2021-07-08T14:40:12.982Z"
        }
    },
    {
        "query_result": {
            "id": 3435,
            "query_hash": "77ff8487af0c8dafdb7be44df1825c0c",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Glenda')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 1
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.00879883766174316,
            "retrieved_at": "2021-07-08T14:40:13.076Z"
        }
    },
    {
        "query_result": {
            "id": 3436,
            "query_hash": "d1a207e503e41d6c985d05e7fa910b63",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Milton')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 1
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.00595188140869141,
            "retrieved_at": "2021-07-08T14:40:13.151Z"
        }
    },
    {
        "query_result": {
            "id": 3437,
            "query_hash": "821b2c0d9f3ef47da9e9e981fd4b7bfe",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Marjorie')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 1
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.00643825531005859,
            "retrieved_at": "2021-07-08T14:40:13.219Z"
        }
    },
    {
        "query_result": {
            "id": 3438,
            "query_hash": "7d8f4918ec8d78f50af8604754b79f9b",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Bryan')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 1
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.00550937652587891,
            "retrieved_at": "2021-07-08T14:40:13.290Z"
        }
    },
    {
        "query_result": {
            "id": 3439,
            "query_hash": "45d3b79fd29f8c6fe98122c8425b66f9",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Rhonda')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 1
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.0056917667388916,
            "retrieved_at": "2021-07-08T14:40:13.386Z"
        }
    },
    {
        "query_result": {
            "id": 3440,
            "query_hash": "f3c5a0c956fedcb4dba4b8bc155ad73d",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Loretta')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 1
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.00563430786132812,
            "retrieved_at": "2021-07-08T14:40:13.460Z"
        }
    },
    {
        "query_result": {
            "id": 3441,
            "query_hash": "bfe9fa3bf0903770898622d56d11d512",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Kyle')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 1
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.00655460357666016,
            "retrieved_at": "2021-07-08T14:40:13.532Z"
        }
    },
    {
        "query_result": {
            "id": 3442,
            "query_hash": "5b9cb61294f25ba625497c28d7fa5b9b",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Andy')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 1
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.00626349449157715,
            "retrieved_at": "2021-07-08T14:40:13.618Z"
        }
    },
    {
        "query_result": {
            "id": 3443,
            "query_hash": "ad780bbb512a0ec1c65d15fd1fa1dab1",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Willard')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 1
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.0059363842010498,
            "retrieved_at": "2021-07-08T14:40:13.694Z"
        }
    },
    {
        "query_result": {
            "id": 3444,
            "query_hash": "8f60f2145b38044966f54f3b75046965",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Mark')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 1
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.00597405433654785,
            "retrieved_at": "2021-07-08T14:40:13.767Z"
        }
    },
    {
        "query_result": {
            "id": 3445,
            "query_hash": "a185f9de568bbb031d286c1cfc4f27e2",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Cheryl')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 1
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.00615215301513672,
            "retrieved_at": "2021-07-08T14:40:13.837Z"
        }
    },
    {
        "query_result": {
            "id": 3446,
            "query_hash": "cb51cd7b03eec54236796a50b5b1095c",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Carlos')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 1
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.00590896606445312,
            "retrieved_at": "2021-07-08T14:40:13.913Z"
        }
    },
    {
        "query_result": {
            "id": 3447,
            "query_hash": "9d217704585dec6f2a3e7b5736cba50d",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Brett')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 1
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.00548148155212402,
            "retrieved_at": "2021-07-08T14:40:13.984Z"
        }
    },
    {
        "query_result": {
            "id": 3448,
            "query_hash": "a4ed0850941e068784207bbebeae3338",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Heather')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 1
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.00535798072814941,
            "retrieved_at": "2021-07-08T14:40:14.050Z"
        }
    },
    {
        "query_result": {
            "id": 3449,
            "query_hash": "ed8de40cb06499b3c25a0459a2e983fb",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Lewis')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 1
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.00538754463195801,
            "retrieved_at": "2021-07-08T14:40:14.116Z"
        }
    },
    {
        "query_result": {
            "id": 3450,
            "query_hash": "e1964a08639869b875f39afaae3012b1",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Jimmy')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 1
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.00608181953430176,
            "retrieved_at": "2021-07-08T14:40:14.195Z"
        }
    },
    {
        "query_result": {
            "id": 3451,
            "query_hash": "e4c6c329bf07f7b146174fa9af4a950a",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Gene')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 1
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.00639629364013672,
            "retrieved_at": "2021-07-08T14:40:14.275Z"
        }
    },
    {
        "query_result": {
            "id": 3452,
            "query_hash": "dcc6d18d9e3c52752f37bf9ae3c8692b",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Jerry')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 1
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.00700807571411133,
            "retrieved_at": "2021-07-08T14:40:14.356Z"
        }
    },
    {
        "query_result": {
            "id": 3453,
            "query_hash": "b3f1c4fd66fcaf8be80fb71642ddc230",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Charlotte')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 1
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.00652503967285156,
            "retrieved_at": "2021-07-08T14:40:14.433Z"
        }
    },
    {
        "query_result": {
            "id": 3454,
            "query_hash": "16ec4ee0c13e8eaf9bb7d1ebb988399b",
            "query": "SELECT \"activebool\" AS \"activebool\", SUM(\"active\") AS \"active\" FROM \"customer\" AS t WHERE ((TIMESTAMP '2021-07-05 14:41:00'<=\"last_update\" AND \"last_update\"<TIMESTAMP '2021-07-08 14:41:00') AND (\"first_name\" IS NOT DISTINCT FROM 'Helen')) GROUP BY 1 ORDER BY \"active\" DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "activebool",
                        "friendly_name": "activebool",
                        "type": "boolean"
                    },
                    {
                        "name": "active",
                        "friendly_name": "active",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "activebool": True,
                        "active": 1
                    }
                ]
            },
            "data_source_id": 1,
            "runtime": 0.00597667694091797,
            "retrieved_at": "2021-07-08T14:40:14.507Z"
        }
    }
]

TEST_DATA_2_SPLIT_SHAPE = {
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
            "MillisecondsInInterval": 259200000,
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
                    },
                    {
                        "name": "customer",
                        "type": "DATASET"
                    },
                    {
                        "name": "SPLIT",
                        "type": "DATASET"
                    }
                ],
                "data": [
                    {
                        "first_name": "some_first_name",
                        "active": 4,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 4
                                }
                            ]
                        }
                    }
                ]
            }
        }
    ]
}

POSTGRES_2_SPLIT_RESULT = {
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
            "MillisecondsInInterval": 259200000,
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
                    },
                    {
                        "name": "customer",
                        "type": "DATASET"
                    },
                    {
                        "name": "SPLIT",
                        "type": "DATASET"
                    }
                ],
                "data": [
                    {
                        "first_name": "Tracy",
                        "active": 2,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 2
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Leslie",
                        "active": 2,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 2
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Jamie",
                        "active": 2,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 2
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Marion",
                        "active": 2,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 2
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Jessie",
                        "active": 2,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 2
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Kelly",
                        "active": 2,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 2
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Terry",
                        "active": 2,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 2
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Willie",
                        "active": 2,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 2
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Herbert",
                        "active": 1,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 1
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Greg",
                        "active": 1,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 1
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Nicholas",
                        "active": 1,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 1
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Lois",
                        "active": 1,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 1
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Nathaniel",
                        "active": 1,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 1
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Lynn",
                        "active": 1,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 1
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Tommy",
                        "active": 1,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 1
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Frank",
                        "active": 1,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 1
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Wesley",
                        "active": 1,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 1
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Ricky",
                        "active": 1,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 1
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Andre",
                        "active": 1,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 1
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Fernando",
                        "active": 1,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 1
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Enrique",
                        "active": 1,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 1
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "April",
                        "active": 1,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 1
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Lorraine",
                        "active": 1,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 1
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Ross",
                        "active": 1,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 1
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Donna",
                        "active": 1,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 1
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Vivian",
                        "active": 1,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 1
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Norman",
                        "active": 1,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 1
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Clinton",
                        "active": 1,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 1
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Keith",
                        "active": 1,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 1
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Ricardo",
                        "active": 1,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 1
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Glenda",
                        "active": 1,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 1
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Milton",
                        "active": 1,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 1
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Marjorie",
                        "active": 1,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 1
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Bryan",
                        "active": 1,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 1
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Rhonda",
                        "active": 1,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 1
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Loretta",
                        "active": 1,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 1
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Kyle",
                        "active": 1,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 1
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Andy",
                        "active": 1,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 1
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Willard",
                        "active": 1,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 1
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Mark",
                        "active": 1,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 1
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Cheryl",
                        "active": 1,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 1
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Carlos",
                        "active": 1,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 1
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Brett",
                        "active": 1,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 1
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Heather",
                        "active": 1,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 1
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Lewis",
                        "active": 1,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 1
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Jimmy",
                        "active": 1,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 1
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Gene",
                        "active": 1,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 1
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Jerry",
                        "active": 1,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 1
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Charlotte",
                        "active": 1,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 1
                                }
                            ]
                        }
                    },
                    {
                        "first_name": "Helen",
                        "active": 1,
                        "SPLIT": {
                            "keys": [
                                "activebool"
                            ],
                            "attributes": [
                                {
                                    "name": "activebool",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "active",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "activebool": True,
                                    "active": 1
                                }
                            ]
                        }
                    }
                ]
            }
        }
    ]
}
