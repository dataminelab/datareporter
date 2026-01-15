POSTGRES_0_SPLIT_JOBS = [
    {
        "query_result": {
            "id": 99,
            "query_hash": "ab6cd89a28e6d1620557ed8c1370c1ef",
            "query": 'SELECT SUM("active") AS "__VALUE__" FROM "customer" AS t WHERE (TIMESTAMP \'2021-06-30 13:31:00\'<="last_update" AND "last_update"<TIMESTAMP \'2021-07-01 13:31:00\') GROUP BY \'\'=\'\'',
            "data": {
                "columns": [{"name": "__VALUE__", "friendly_name": "__VALUE__", "type": "integer"}],
                "rows": [{"__VALUE__": 584}],
            },
            "data_source_id": 1,
            "runtime": 0.00545287132263184,
            "retrieved_at": "2021-07-01T13:30:06.753Z",
        }
    }
]

POSTGRES_0_SPLIT_SHAPE = {
    "attributes": [
        {"name": "customer", "type": "DATASET"},
        {"name": "MillisecondsInInterval", "type": "NUMBER"},
        {"name": "active", "type": "NUMBER"},
    ],
    "data": [{"MillisecondsInInterval": 86400000, "active": 4}],
}

POSTGRES_0_SPLIT_RESULT = {
    "attributes": [
        {"name": "customer", "type": "DATASET"},
        {"name": "MillisecondsInInterval", "type": "NUMBER"},
        {"name": "active", "type": "NUMBER"},
    ],
    "data": [{"MillisecondsInInterval": 86400000, "active": 584}],
}

JSON_DATASET = [
    {"name": "A Very â€œBriefâ€ Introduction", "timestamp": "00:00:00"},
    {"name": "Now thatâ€™s something to think about", "timestamp": "00:01:23"},
    {"name": "Skill issue", "timestamp": "00:04:20"},
]

JSON_URL_1 = "https://data.police.uk/api/crimes-at-location?date=2024-01&lat=52.629729&lng=-1.131592"
JSON_RESPONSE_1 = [
    {
        "category": "other-theft",
        "location_type": "Force",
        "location": {
            "latitude": "52.629831",
            "street": {"id": 1738423, "name": "On or near Marquis Street"},
            "longitude": "-1.132503",
        },
        "context": "",
        "outcome_status": {"category": "Unable to prosecute suspect", "date": "2024-02"},
        "persistent_id": "bb06e351c7056b9d74fcf5d519cc45e0318f72e1a39bdf45f9551a2743396d58",
        "id": 116206187,
        "location_subtype": "",
        "month": "2024-01",
    },
    {
        "category": "violent-crime",
        "location_type": "Force",
        "location": {
            "latitude": "52.629831",
            "street": {"id": 1738423, "name": "On or near Marquis Street"},
            "longitude": "-1.132503",
        },
        "context": "",
        "outcome_status": {"category": "Unable to prosecute suspect", "date": "2024-02"},
        "persistent_id": "4f8e06f87cb05c4a19f690aa1531cd94a4736fd7f5ad99328c00a3cde3d68c85",
        "id": 116206306,
        "location_subtype": "",
        "month": "2024-01",
    },
]
JSON_1_REPONSE_SHAPE = {
    "appSettings": {
        "dataCubes": [
            {
                "name": "default",
                "title": "Default",
                "timeAttribute": "month",
                "clusterName": "native",
                "defaultSortMeasure": "id",
                "defaultSelectedMeasures": ["id"],
                "attributes": [
                    {"name": "category", "type": "STRING", "nativeType": "STRING"},
                    {"name": "context", "type": "STRING", "nativeType": "STRING"},
                    {"name": "id", "type": "NUMBER", "nativeType": "INTEGER"},
                    {"name": "location.latitude", "type": "STRING", "nativeType": "STRING"},
                    {"name": "location.longitude", "type": "STRING", "nativeType": "STRING"},
                    {"name": "location.street", "type": "STRING", "nativeType": "STRING"},
                    {"name": "location_subtype", "type": "STRING", "nativeType": "STRING"},
                    {"name": "location_type", "type": "STRING", "nativeType": "STRING"},
                    {"name": "month", "type": "TIME", "nativeType": "TIME"},
                    {"name": "outcome_status.category", "type": "STRING", "nativeType": "STRING"},
                    {"name": "outcome_status.date", "type": "STRING", "nativeType": "STRING"},
                    {"name": "persistent_id", "type": "STRING", "nativeType": "STRING"},
                ],
                "dimensions": [
                    {"name": "category", "title": "Category", "formula": "$category"},
                    {"name": "context", "title": "Context", "formula": "$context"},
                    {"name": "location.latitude", "title": "Location.Latitude", "formula": "${location.latitude}"},
                    {"name": "location.longitude", "title": "Location.Longitude", "formula": "${location.longitude}"},
                    {"name": "location.street", "title": "Location.Street", "formula": "${location.street}"},
                    {"name": "location_subtype", "title": "Location Subtype", "formula": "$location_subtype"},
                    {"name": "location_type", "title": "Location Type", "formula": "$location_type"},
                    {
                        "name": "outcome_status.category",
                        "title": "Outcome Status.Category",
                        "formula": "${outcome_status.category}",
                    },
                    {
                        "name": "outcome_status.date",
                        "title": "Outcome Status.Date",
                        "formula": "${outcome_status.date}",
                    },
                    {"name": "persistent_id", "title": "Persistent", "formula": "$persistent_id"},
                ],
                "measures": [{"name": "id", "title": "Id", "formula": "$main.sum($id)"}],
            }
        ],
        "clusters": [],
        "customization": {},
    },
    "timekeeper": {},
}
JSON_2_SPLIT_PLYWOOD_RESPONSE = {
    "data": {
        "attributes": [
            {"name": "default", "type": "DATASET"},
            {"name": "MillisecondsInInterval", "type": "NUMBER"},
            {"name": "id", "type": "NUMBER"},
            {"name": "SPLIT", "type": "DATASET"},
        ],
        "data": [
            {
                "SPLIT": {
                    "keys": ["location_type"],
                    "attributes": [
                        {"name": "location_type", "type": "STRING"},
                        {"name": "id", "type": "NUMBER"},
                        {"name": "SPLIT", "type": "DATASET"},
                    ],
                    "data": [
                        {
                            "SPLIT": {
                                "keys": ["category"],
                                "attributes": [
                                    {"name": "category", "type": "STRING"},
                                    {"name": "id", "type": "NUMBER"},
                                ],
                                "data": [{"category": "other-theft", "id": 1}, {"category": "violent-crime", "id": 1}],
                            },
                            "location_type": "Force",
                            "id": 2,
                        }
                    ],
                },
                "MillisecondsInInterval": 630720000000,
                "id": 2,
            }
        ],
    },
    "status": 200,
    "queries": [
        {
            "query_result": {
                "data": {
                    "columns": [{"name": "__VALUE__", "friendly_name": "__VALUE__", "type": "integer"}],
                    "rows": [{"__VALUE__": 2}],
                },
                "data_source_id": 3,
                "id": None,
                "query": "",
                "query_hash": "N4IgbglgzgrghgGwgLzgFwgewHYgFwhpwBGCApiADTjTxKoY4DKZaG2A5lPqAMaYIEcAA5QyAJUwB3bngBmiMQF9qGALZlkOCgQCiaXgHoAqgBUAwlRByICNGQBOsgNqg0AT2E7CEDVYdkcvggajhoABZW6mQACo5YACYuoAkwDuhYuAQxAEwADACaVlD2wvgAtACMqp7eQvYlIEoAui3UUMJIaMmEtcElDhCcVgm+ZNhQmcEImLwZOAD6Hl7FmA5oPCABQQQQCVF9BGKDZNzUowG8jFkgCae846PD1F6DmPsETdRIahAbeABWPIqNyHEADIYcEZjCZTAhzewcNbuVbrTbbYJ7A4rI7xU7Qy7XYJ3KAPbBPKEveLvYJfEA/P74IFtcF4nrbRzjB6Y/bUORrNToTbLbx3BQwOxWMCIGDeOki4IaOCwAJNZovIbYMgJAAiMMmOBc6pAwk12qYa3+ICxSiAA===",
                "retrieved_at": None,
                "runtime": 0,
            }
        },
        {
            "query_result": {
                "data": {
                    "columns": [
                        {"name": "location_type", "friendly_name": "location_type", "type": "string"},
                        {"name": "id", "friendly_name": "id", "type": "integer"},
                    ],
                    "rows": [{"location_type": "Force", "id": 2}],
                },
                "data_source_id": 3,
                "id": None,
                "query": "",
                "query_hash": "N4IgbglgzgrghgGwgLzgFwgewHYgFwhpwBGCApiADTjTxKoY4DKZaG2A5lPqAMaYIEcAA5QyAJUwB3bngBmiMQF9qGALZlkOCgQCiaXgHoAqgBUAwlRByICNGQBOsgNqg0AT2E7CEDVYdkcvggajhoABZW6mQACo5YACYuoAkwDuhYuAQxAEwADACaVlD2wvgAtACMqp7eQvYlIEoAui3UUMJIaMmEtcElDhCcVgm+ZNhQmcEImLwZOAD6Hl7FmA5oPCABQQQQCVF9BGKDZNzUowG8jFkgCae846PD1F6DmPsETdRIahAbeABWPIqNyHEADIYcEZjCZTAhzewcNbuVbrTbbYJ7A4rI7xU7Qy7XYJ3KAPbBPKEveLvYJfEA/P74IFtcF4nrbRzjB6Y/bUORrNToTbLbx3BQwOxWMCIGDeOki4IaOCwAJNZovIbYMgJAAiMMmOBc6pAwk12qYa3+ICxSiAA===",
                "retrieved_at": None,
                "runtime": 0,
            }
        },
        {
            "query_result": {
                "data": {
                    "columns": [
                        {"name": "category", "friendly_name": "category", "type": "string"},
                        {"name": "id", "friendly_name": "id", "type": "integer"},
                    ],
                    "rows": [{"category": "other-theft", "id": 1}, {"category": "violent-crime", "id": 1}],
                },
                "data_source_id": 3,
                "id": None,
                "query": "WHERE location_type = 'Force'",
                "query_hash": "N4IgbglgzgrghgGwgLzgFwgewHYgFwhpwBGCApiADTjTxKoY4DKZaG2A5lPqAMaYIEcAA5QyAJUwB3bngBmiMQF9qGALZlkOCgQCiaXgHoAqgBUAwlRByICNGQBOsgNqg0AT2E7CEDVYdkcvggajhoABZW6mQACo5YACYuoAkwDuhYuAQxAEwADACaVlD2wvgAtACMqp7eQvYlIEoAui3UUMJIaMmEtcElDhCcVgm+ZNhQmcEImLwZOAD6Hl7FmA5oPCABQQQQCVF9BGKDZNzUowG8jFkgCae846PD1F6DmPsETdRIahAbeABWPIqNyHEADIYcEZjCZTAhzewcNbuVbrTbbYJ7A4rI7xU7Qy7XYJ3KAPbBPKEveLvYJfEA/P74IFtcF4nrbRzjB6Y/bUORrNToTbLbx3BQwOxWMCIGDeOki4IaOCwAJNZovIbYMgJAAiMMmOBc6pAwk12qYa3+ICxSiAA===",
                "retrieved_at": None,
                "runtime": 0,
            }
        },
    ],
    "failed": None,
    "meta": None,
    "shape": {
        "attributes": [
            {"name": "default", "type": "DATASET"},
            {"name": "MillisecondsInInterval", "type": "NUMBER"},
            {"name": "id", "type": "NUMBER"},
            {"name": "SPLIT", "type": "DATASET"},
        ],
        "data": [
            {
                "MillisecondsInInterval": 630720000000,
                "id": 4,
                "SPLIT": {
                    "keys": ["location_type"],
                    "attributes": [
                        {"name": "location_type", "type": "STRING"},
                        {"name": "id", "type": "NUMBER"},
                        {"name": "SPLIT", "type": "DATASET"},
                    ],
                    "data": [
                        {
                            "location_type": "some_location_type",
                            "id": 4,
                            "SPLIT": {
                                "op": "limit",
                                "operand": {
                                    "op": "sort",
                                    "operand": {
                                        "op": "apply",
                                        "operand": {"op": "literal", "value": None},
                                        "expression": {
                                            "op": "sum",
                                            "operand": {"op": "ref", "name": "default", "type": "DATASET"},
                                            "expression": {"op": "ref", "name": "id", "type": "NUMBER"},
                                        },
                                        "name": "id",
                                    },
                                    "expression": {"op": "ref", "name": "id", "type": "NUMBER"},
                                    "direction": "descending",
                                },
                                "value": 50,
                            },
                        }
                    ],
                },
            }
        ],
    },
    "progress": {"all": 3, "results": 3, "progress": 100},
    "expression_queries": [
        '{"source":"default","filter":{"raw":"$month:TIME.overlap([2005-12-18T01:59:00Z,2025-12-18T01:59:00Z])"}}',
        '{"source":"default","filter":{"raw":"$month:TIME.overlap([2005-12-18T01:59:00Z,2025-12-18T01:59:00Z])"},"split":[{"name":"location_type","expression":{"op":"ref","field":"location_type"}}],"applies":[{"name":"id","expression":{"raw":"$default:DATASET.sum($id:NUMBER)"}}],"sort":{"expression":"$id:NUMBER","direction":"descending"},"limit":50}',
    ],
}
