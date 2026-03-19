from rq.connections import pop_connection, push_connection

from redash import rq_redis_connection

from .alerts import check_alerts_for_query
from .databricks import (
    get_database_tables_with_columns,
    get_databricks_databases,
    get_databricks_table_columns,
    get_databricks_tables,
)
from .failure_report import send_aggregated_errors
from .general import (
    get_schema,
    record_event,
    send_mail,
    sync_user_details,
    test_connection,
)
from .queries import (
    cleanup_query_results,
    empty_schedules,
    enqueue_query,
    execute_query,
    refresh_queries,
    refresh_schemas,
    remove_ghost_locks,
)
from .reports import empty_report_schedules, enqueue_report, execute_report, refresh_reports
from .schedule import periodic_job_definitions, rq_scheduler, schedule_periodic_jobs
from .worker import Job, Queue, Worker


def init_app(app):
    app.before_request(lambda: push_connection(rq_redis_connection))
    app.teardown_request(lambda _: pop_connection())
