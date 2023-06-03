import json

from flask import request

from redash.gcloud.pubsub import get_message_from_subscribed_data
from redash.handlers import routes
import redash.tasks as tasks
from redash.handlers.base import json_response

dispatch = {
    "default": {
        "check_alerts_for_query": tasks.check_alerts_for_query,
        "record_event": tasks.record_event,
        "subscribe": tasks.subscribe,
    },
    "queries": {
        "test_connection": tasks.test_connection,
    },
    "email": {
        "send_email": lambda data: tasks.send_mail(data["to"], data["subject"], data["html"], data["text"]),
    },
    "schemas": {
        "refresh_schema": tasks.refresh_schemas,
        "get_schema": lambda data: tasks.get_schema(data["data_source_id"], data["refresh"]),
        "get_databricks_databases":
            lambda data: tasks.get_databricks_databases(data["data_source_id"], data["redis_key"]),
        "get_databricks_tables":
            lambda data: tasks.get_databricks_tables(data["data_source_id"], data["database_name"]),
        "get_databricks_table_columns":
            lambda data: tasks.get_databricks_table_columns(
                data["data_source_id"], data["database_name"], data["table_name"]
            ),
        "get_database_tables_with_columns":
            lambda data: tasks.get_database_tables_with_columns(
                data["data_source_id"], data["database_name"], data["redis_key"]
            ),
    }
}


@routes.route("/api/subscribe/default", methods=["POST"])
def pubsub_subscribe():
    message = get_message_from_subscribed_data(request.data)
    payload = json.loads(message)

    t = payload.get("type")
    fn = payload.get("fn")
    data = payload.get("data")

    if t and fn and t in dispatch and fn in dispatch[t]:
        dispatch[t][fn](data)

    return json_response(dict(success=True))
