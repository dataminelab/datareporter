from .base import AttributeParser

_TYPE_MAP = {
    "STRING": "STRING",
    "INTEGER": "NUMBER",
    "FLOAT": "NUMBER",
    "BOOLEAN": "BOOLEAN",
    "DATETIME": "TIME",
}

class JsonParser(AttributeParser):
    engine = "json"

    def _parse_attributes(self, attributes: list) -> list:
        result = []
        for attr in attributes:
            name = attr["name"] if isinstance(attr, dict) else attr.name
            json_type = (attr["type"] if isinstance(attr, dict) else attr.type).upper()
            ply_type = _TYPE_MAP.get(json_type, "STRING")
            result.append({
                "name": name,
                "type": ply_type,
                "nativeType": json_type,
                "isTimeColumn": ply_type == "TIME",
            })
        return result
