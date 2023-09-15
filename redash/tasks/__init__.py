from .general import (
    record_event,
    version_check,
    send_mail,
    subscribe,
    sync_user_details,
    purge_failed_jobs,
    test_connection,
    get_schema,
)
from .queries import (
    enqueue_query,
    execute_query,
    refresh_queries,
    refresh_schemas,
    cleanup_query_results,
    empty_schedules,
    remove_ghost_locks,
)
from .databricks import (
    get_databricks_databases,
    get_databricks_tables,
    get_database_tables_with_columns,
    get_databricks_table_columns,
)
from .alerts import check_alerts_for_query
from .failure_report import send_aggregated_errors
from .worker import Worker, Queue, Job
from .schedule import rq_scheduler, schedule_periodic_jobs, periodic_job_definitions

from redash import rq_redis_connection
from rq.connections import push_connection, pop_connection


def init_app(app):
    app.before_request(lambda: push_connection(rq_redis_connection))
    app.teardown_request(lambda _: pop_connection())

