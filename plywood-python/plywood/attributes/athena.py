from .base import AttributeParser

_TYPE_MAP = {
    "VARCHAR": "STRING", "CHAR": "STRING", "STRING": "STRING",
    "INTEGER": "NUMBER", "BIGINT": "NUMBER", "SMALLINT": "NUMBER", "TINYINT": "NUMBER",
    "DOUBLE": "NUMBER", "FLOAT": "NUMBER", "DECIMAL": "NUMBER", "REAL": "NUMBER",
    "TIMESTAMP": "TIME", "DATE": "TIME",
    "BOOLEAN": "BOOLEAN",
}

class AthenaParser(AttributeParser):
    engine = "athena"

    def _parse_attributes(self, attributes: list) -> list:
        result = []
        for attr in attributes:
            name = attr["name"] if isinstance(attr, dict) else attr.name
            sql_type = (attr["type"] if isinstance(attr, dict) else attr.type).upper()
            ply_type = _TYPE_MAP.get(sql_type, "STRING")
            result.append({"name": name, "type": ply_type, "nativeType": sql_type})
        return result
