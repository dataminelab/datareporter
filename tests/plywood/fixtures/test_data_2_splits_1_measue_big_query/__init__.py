POSTGRES_2_SLIT_JOBS_BIG_QUERY = [
    {
        "query_result": {
            "id": 3711,
            "query_hash": "a1ae777b5f581e6e67834d7fcf65789c",
            "query": "SELECT SUM(`added`) AS `__VALUE__` FROM public.`wikiticker` AS t WHERE (TIMESTAMP('2001-07-14T07:27:00.000Z')<=`sometimeLater` AND `sometimeLater`<TIMESTAMP('2021-07-14T07:27:00.000Z'))",
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
                        "__VALUE__": 9385573
                    }
                ],
                "metadata": {
                    "data_scanned": 627904
                }
            },
            "data_source_id": 2,
            "runtime": 1.80945158004761,
            "retrieved_at": "2021-07-14T07:26:14.486Z"
        }
    },
    {
        "query_result": {
            "id": 3712,
            "query_hash": "46b058da0614373e6d2be3ffb1ccac19",
            "query": "SELECT `countryIsoCode` AS `countryIsoCode`, SUM(`added`) AS `added` FROM public.`wikiticker` AS t WHERE (TIMESTAMP('2001-07-14T07:27:00.000Z')<=`sometimeLater` AND `sometimeLater`<TIMESTAMP('2021-07-14T07:27:00.000Z')) GROUP BY 1 ORDER BY `added` DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "countryIsoCode",
                        "friendly_name": "countryIsoCode",
                        "type": "string"
                    },
                    {
                        "name": "added",
                        "friendly_name": "added",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "countryIsoCode": None,
                        "added": 8761516
                    },
                    {
                        "countryIsoCode": "CO",
                        "added": 60398
                    },
                    {
                        "countryIsoCode": "RU",
                        "added": 50561
                    },
                    {
                        "countryIsoCode": "US",
                        "added": 44433
                    },
                    {
                        "countryIsoCode": "IT",
                        "added": 41073
                    }
                ],
                "metadata": {
                    "data_scanned": 643100
                }
            },
            "data_source_id": 2,
            "runtime": 1.50795960426331,
            "retrieved_at": "2021-07-14T07:26:16.073Z"
        }
    },
    {
        "query_result": {
            "id": 3714,
            "query_hash": "a7bb97e5dc26d55f0c02aededc35575f",
            "query": "SELECT `isMinor` AS `isMinor`, SUM(`added`) AS `added` FROM public.`wikiticker` AS t WHERE ((TIMESTAMP('2001-07-14T07:27:00.000Z')<=`sometimeLater` AND `sometimeLater`<TIMESTAMP('2021-07-14T07:27:00.000Z')) AND (`countryIsoCode` IS NULL)) GROUP BY 1 ORDER BY `added` DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "isMinor",
                        "friendly_name": "isMinor",
                        "type": "boolean"
                    },
                    {
                        "name": "added",
                        "friendly_name": "added",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "isMinor": False,
                        "added": 7525182
                    },
                    {
                        "isMinor": True,
                        "added": 1236334
                    }
                ],
                "metadata": {
                    "data_scanned": 682344
                }
            },
            "data_source_id": 2,
            "runtime": 1.55520248413086,
            "retrieved_at": "2021-07-14T07:26:22.170Z"
        }
    },
    {
        "query_result": {
            "id": 3715,
            "query_hash": "8022929e0c803fd8ba74bf55fe748068",
            "query": "SELECT `isMinor` AS `isMinor`, SUM(`added`) AS `added` FROM public.`wikiticker` AS t WHERE ((TIMESTAMP('2001-07-14T07:27:00.000Z')<=`sometimeLater` AND `sometimeLater`<TIMESTAMP('2021-07-14T07:27:00.000Z')) AND (`countryIsoCode`='CO')) GROUP BY 1 ORDER BY `added` DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "isMinor",
                        "friendly_name": "isMinor",
                        "type": "boolean"
                    },
                    {
                        "name": "added",
                        "friendly_name": "added",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "isMinor": False,
                        "added": 60398
                    }
                ],
                "metadata": {
                    "data_scanned": 682344
                }
            },
            "data_source_id": 2,
            "runtime": 1.69870972633362,
            "retrieved_at": "2021-07-14T07:26:23.943Z"
        }
    },
    {
        "query_result": {
            "id": 3716,
            "query_hash": "f49df4742f8de8ba628b19134568e6d9",
            "query": "SELECT `isMinor` AS `isMinor`, SUM(`added`) AS `added` FROM public.`wikiticker` AS t WHERE ((TIMESTAMP('2001-07-14T07:27:00.000Z')<=`sometimeLater` AND `sometimeLater`<TIMESTAMP('2021-07-14T07:27:00.000Z')) AND (`countryIsoCode`='RU')) GROUP BY 1 ORDER BY `added` DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "isMinor",
                        "friendly_name": "isMinor",
                        "type": "boolean"
                    },
                    {
                        "name": "added",
                        "friendly_name": "added",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "isMinor": False,
                        "added": 50561
                    }
                ],
                "metadata": {
                    "data_scanned": 682344
                }
            },
            "data_source_id": 2,
            "runtime": 1.96063756942749,
            "retrieved_at": "2021-07-14T07:26:26.390Z"
        }
    },
    {
        "query_result": {
            "id": 3717,
            "query_hash": "d41cb4976c6b16caf3af181573a308f6",
            "query": "SELECT `isMinor` AS `isMinor`, SUM(`added`) AS `added` FROM public.`wikiticker` AS t WHERE ((TIMESTAMP('2001-07-14T07:27:00.000Z')<=`sometimeLater` AND `sometimeLater`<TIMESTAMP('2021-07-14T07:27:00.000Z')) AND (`countryIsoCode`='US')) GROUP BY 1 ORDER BY `added` DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "isMinor",
                        "friendly_name": "isMinor",
                        "type": "boolean"
                    },
                    {
                        "name": "added",
                        "friendly_name": "added",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "isMinor": False,
                        "added": 44433
                    }
                ],
                "metadata": {
                    "data_scanned": 682344
                }
            },
            "data_source_id": 2,
            "runtime": 1.47359418869019,
            "retrieved_at": "2021-07-14T07:26:27.933Z"
        }
    },
    {
        "query_result": {
            "id": 3718,
            "query_hash": "f05f57d3ca40a1d174b260691b8f9405",
            "query": "SELECT `isMinor` AS `isMinor`, SUM(`added`) AS `added` FROM public.`wikiticker` AS t WHERE ((TIMESTAMP('2001-07-14T07:27:00.000Z')<=`sometimeLater` AND `sometimeLater`<TIMESTAMP('2021-07-14T07:27:00.000Z')) AND (`countryIsoCode`='IT')) GROUP BY 1 ORDER BY `added` DESC LIMIT 5",
            "data": {
                "columns": [
                    {
                        "name": "isMinor",
                        "friendly_name": "isMinor",
                        "type": "boolean"
                    },
                    {
                        "name": "added",
                        "friendly_name": "added",
                        "type": "integer"
                    }
                ],
                "rows": [
                    {
                        "isMinor": False,
                        "added": 41073
                    }
                ],
                "metadata": {
                    "data_scanned": 682344
                }
            },
            "data_source_id": 2,
            "runtime": 1.65673446655273,
            "retrieved_at": "2021-07-14T07:26:29.664Z"
        }
    }
]

TEST_DATA_2_SPLIT_SHAPE_BIG_QUERY = {
    "attributes": [
        {
            "name": "public.wikiticker",
            "type": "DATASET"
        },
        {
            "name": "MillisecondsInInterval",
            "type": "NUMBER"
        },
        {
            "name": "added",
            "type": "NUMBER"
        },
        {
            "name": "SPLIT",
            "type": "DATASET"
        }
    ],
    "data": [
        {
            "MillisecondsInInterval": 630720000000,
            "added": 4,
            "SPLIT": {
                "keys": [
                    "countryIsoCode"
                ],
                "attributes": [
                    {
                        "name": "countryIsoCode",
                        "type": "STRING"
                    },
                    {
                        "name": "added",
                        "type": "NUMBER"
                    },
                    {
                        "name": "public.wikiticker",
                        "type": "DATASET"
                    },
                    {
                        "name": "SPLIT",
                        "type": "DATASET"
                    }
                ],
                "data": [
                    {
                        "countryIsoCode": "some_countryIsoCode",
                        "added": 4,
                        "SPLIT": {
                            "keys": [
                                "isMinor"
                            ],
                            "attributes": [
                                {
                                    "name": "isMinor",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "added",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "isMinor": True,
                                    "added": 4
                                }
                            ]
                        }
                    }
                ]
            }
        }
    ]
}

POSTGRES_2_SPLIT_RESULT_BIG_QUERY = {
    "attributes": [
        {
            "name": "public.wikiticker",
            "type": "DATASET"
        },
        {
            "name": "MillisecondsInInterval",
            "type": "NUMBER"
        },
        {
            "name": "added",
            "type": "NUMBER"
        },
        {
            "name": "SPLIT",
            "type": "DATASET"
        }
    ],
    "data": [
        {
            "MillisecondsInInterval": 630720000000,
            "added": 9385573,
            "SPLIT": {
                "keys": [
                    "countryIsoCode"
                ],
                "attributes": [
                    {
                        "name": "countryIsoCode",
                        "type": "STRING"
                    },
                    {
                        "name": "added",
                        "type": "NUMBER"
                    },
                    {
                        "name": "public.wikiticker",
                        "type": "DATASET"
                    },
                    {
                        "name": "SPLIT",
                        "type": "DATASET"
                    }
                ],
                "data": [
                    {
                        "countryIsoCode": None,
                        "added": 8761516,
                        "SPLIT": {
                            "keys": [
                                "isMinor"
                            ],
                            "attributes": [
                                {
                                    "name": "isMinor",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "added",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "isMinor": False,
                                    "added": 7525182
                                },
                                {
                                    "isMinor": True,
                                    "added": 1236334
                                }
                            ]
                        }
                    },
                    {
                        "countryIsoCode": "CO",
                        "added": 60398,
                        "SPLIT": {
                            "keys": [
                                "isMinor"
                            ],
                            "attributes": [
                                {
                                    "name": "isMinor",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "added",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "isMinor": False,
                                    "added": 60398
                                }
                            ]
                        }
                    },
                    {
                        "countryIsoCode": "RU",
                        "added": 50561,
                        "SPLIT": {
                            "keys": [
                                "isMinor"
                            ],
                            "attributes": [
                                {
                                    "name": "isMinor",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "added",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "isMinor": False,
                                    "added": 50561
                                }
                            ]
                        }
                    },
                    {
                        "countryIsoCode": "US",
                        "added": 44433,
                        "SPLIT": {
                            "keys": [
                                "isMinor"
                            ],
                            "attributes": [
                                {
                                    "name": "isMinor",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "added",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "isMinor": False,
                                    "added": 44433
                                }
                            ]
                        }
                    },
                    {
                        "countryIsoCode": "IT",
                        "added": 41073,
                        "SPLIT": {
                            "keys": [
                                "isMinor"
                            ],
                            "attributes": [
                                {
                                    "name": "isMinor",
                                    "type": "BOOLEAN"
                                },
                                {
                                    "name": "added",
                                    "type": "NUMBER"
                                }
                            ],
                            "data": [
                                {
                                    "isMinor": False,
                                    "added": 41073
                                }
                            ]
                        }
                    }
                ]
            }
        }
    ]
}
