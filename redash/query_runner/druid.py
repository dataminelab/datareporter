try:
    from pydruid.db import connect

    enabled = True
except ImportError:
    enabled = False
import json
from psycopg2.extensions import register_adapter, AsIs
from redash.query_runner import (
    TYPE_BOOLEAN,
    TYPE_INTEGER,
    TYPE_STRING,
    BaseQueryRunner,
    register,
)
import logging
logger = logging.getLogger(__name__)
TYPES_MAP = {1: TYPE_STRING, 2: TYPE_INTEGER, 3: TYPE_BOOLEAN}


class Druid(BaseQueryRunner):
    noop_query = "SELECT 1"

    @classmethod
    def configuration_schema(cls):
        return {
            "type": "object",
            "properties": {
                "host": {"type": "string", "default": "localhost"},
                "port": {"type": "number", "default": 8082},
                "scheme": {"type": "string", "default": "http"},
                "user": {"type": "string"},
                "password": {"type": "string"},
            },
            "order": ["scheme", "host", "port", "user", "password"],
            "required": ["host"],
            "secret": ["password"],
        }

    @classmethod
    def enabled(cls):
        return enabled

    def run_query(self, query, user):
        connection = connect(
            host=self.configuration["host"],
            port=self.configuration["port"],
            path="/druid/v2/sql/",
            scheme=(self.configuration.get("scheme") or "http"),
            user=(self.configuration.get("user") or None),
            password=(self.configuration.get("password") or None),
            context={'enableWindowing': True},
        )

        cursor = connection.cursor()

        try:
            cursor.execute(query)
            columns = self.fetch_columns([(i[0], TYPES_MAP.get(i[1], None)) for i in cursor.description])
            rows = [dict(zip((column["name"] for column in columns), row)) for row in cursor]

            data = {"columns": columns, "rows": rows}
            error = None
        finally:
            connection.close()

        return data, error

    def get_schema(self, get_stats=False):
        query = """
        SELECT TABLE_SCHEMA,
               TABLE_NAME,
               COLUMN_NAME,
               DATA_TYPE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA <> 'INFORMATION_SCHEMA'
        """

        results, error = self.run_query(query, None)

        if error is not None:
            self._handle_run_query_error(error)

        schema = {}

        for row in results["rows"]:
            table_name = "{}.{}".format(row["TABLE_SCHEMA"], row["TABLE_NAME"])

            if table_name not in schema:
                schema[table_name] = {"name": table_name, "columns": []}

            schema[table_name]["columns"].append({
                'name': row["COLUMN_NAME"],
                'type':row["DATA_TYPE"]
            })

        return list(schema.values())

def adapt_dict(dict_var):
    return AsIs("'" + json.dumps(dict_var) + "'")


register(Druid)
register_adapter(dict, adapt_dict)