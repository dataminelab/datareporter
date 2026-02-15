from .base import AttributeParser

_TYPE_MAP = {
    "VARCHAR": "STRING", "CHAR": "STRING",
    "BIGINT": "NUMBER", "DOUBLE": "NUMBER", "FLOAT": "NUMBER", "LONG": "NUMBER",
    "TIMESTAMP": "TIME",
    "COMPLEX<HYPERUNIQUE>": "NUMBER", "COMPLEX<THETASKETCH>": "NUMBER",
    "COMPLEX<HLLSKETCH>": "NUMBER", "COMPLEX<QUANTILESDOUBLESSK>": "NUMBER",
}

class DruidParser(AttributeParser):
    engine = "druid"

    def _parse_attributes(self, attributes: list) -> list:
        result = []
        for attr in attributes:
            name = attr["name"] if isinstance(attr, dict) else attr.name
            sql_type = (attr["type"] if isinstance(attr, dict) else attr.type).upper()
            ply_type = _TYPE_MAP.get(sql_type, "STRING")
            result.append({"name": name, "type": ply_type, "nativeType": sql_type})
        return result
