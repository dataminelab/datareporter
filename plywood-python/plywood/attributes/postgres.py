from .base import AttributeParser

_TYPE_MAP = {
    "CHARACTER VARYING": "STRING", "VARCHAR": "STRING", "TEXT": "STRING", "CHAR": "STRING",
    "CHARACTER": "STRING", "NAME": "STRING", "CITEXT": "STRING",
    "INTEGER": "NUMBER", "BIGINT": "NUMBER", "SMALLINT": "NUMBER",
    "NUMERIC": "NUMBER", "REAL": "NUMBER", "DOUBLE PRECISION": "NUMBER",
    "FLOAT": "NUMBER", "DECIMAL": "NUMBER", "INT": "NUMBER", "SERIAL": "NUMBER",
    "TIMESTAMP WITHOUT TIME ZONE": "TIME", "TIMESTAMP WITH TIME ZONE": "TIME",
    "TIMESTAMP": "TIME", "DATE": "TIME",
    "BOOLEAN": "BOOLEAN", "BOOL": "BOOLEAN",
    "ARRAY": "SET/STRING",
}

class PostgresParser(AttributeParser):
    engine = "postgres"

    def _parse_attributes(self, attributes: list) -> list:
        result = []
        for attr in attributes:
            name = attr["name"] if isinstance(attr, dict) else attr.name
            sql_type = (attr["type"] if isinstance(attr, dict) else attr.type).upper()

            if sql_type in ("NUMERIC", "SMALLINT"):
                sql_type = "INTEGER"

            ply_type = _TYPE_MAP.get(sql_type, "STRING")
            result.append({"name": name, "type": ply_type, "nativeType": sql_type})
        return result
