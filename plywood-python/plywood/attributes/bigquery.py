from .base import AttributeParser

_TYPE_MAP = {
    "STRING": "STRING", "BYTES": "STRING",
    "INT64": "NUMBER", "FLOAT64": "NUMBER", "NUMERIC": "NUMBER", "BIGNUMERIC": "NUMBER",
    "INTEGER": "NUMBER", "FLOAT": "NUMBER",
    "BOOL": "BOOLEAN", "BOOLEAN": "BOOLEAN",
    "TIMESTAMP": "TIME", "DATE": "TIME", "DATETIME": "TIME", "TIME": "TIME",
    "ARRAY<STRING>": "SET/STRING",
}

class BigQueryParser(AttributeParser):
    engine = "bigquery"

    def _parse_attributes(self, attributes: list) -> list:
        result = []
        for attr in attributes:
            name = attr["name"] if isinstance(attr, dict) else attr.name
            sql_type = (attr["type"] if isinstance(attr, dict) else attr.type).upper()
            ply_type = _TYPE_MAP.get(sql_type, "STRING")
            result.append({"name": name, "type": ply_type, "nativeType": sql_type})
        return result
