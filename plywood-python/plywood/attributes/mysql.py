from .base import AttributeParser

def _map_mysql_type(sql_type: str) -> str:
    t = sql_type.upper()
    # Remove size specifications like VARCHAR(255)
    base = t.split("(")[0].strip()

    string_types = {"VARCHAR", "TEXT", "CHAR", "TINYTEXT", "MEDIUMTEXT", "LONGTEXT", "ENUM", "SET"}
    number_types = {"INT", "BIGINT", "SMALLINT", "TINYINT", "MEDIUMINT", "FLOAT", "DOUBLE", "DECIMAL", "NUMERIC"}
    time_types = {"DATETIME", "TIMESTAMP", "DATE"}

    if base in string_types:
        return "STRING"
    if base in number_types:
        return "NUMBER"
    if base in time_types:
        return "TIME"
    if base == "BOOLEAN" or base == "BOOL":
        return "BOOLEAN"
    return "STRING"

class MySQLParser(AttributeParser):
    engine = "mysql"

    def _parse_attributes(self, attributes: list) -> list:
        result = []
        for attr in attributes:
            name = attr["name"] if isinstance(attr, dict) else attr.name
            sql_type = attr["type"] if isinstance(attr, dict) else attr.type
            ply_type = _map_mysql_type(sql_type)
            result.append({"name": name, "type": ply_type, "nativeType": sql_type.upper()})
        return result
