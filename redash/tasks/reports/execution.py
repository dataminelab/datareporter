import signal
import time

import redis
from rq import get_current_job
from rq.exceptions import NoSuchJobError
from rq.job import JobStatus

from redash import models, redis_connection, settings
from redash.query_runner import InterruptException
from redash.tasks.failure_report import track_failure
from redash.tasks.worker import Job, Queue
from redash.utils import gen_query_hash
from redash.worker import get_job_logger

logger = get_job_logger(__name__)


def _job_lock_id(report_hash, data_source_id):
    return "report_hash_job:%s:%s" % (data_source_id, report_hash)


def _unlock(report_hash, data_source_id):
    redis_connection.delete(_job_lock_id(report_hash, data_source_id))


def enqueue_report(report, user_id, is_api_key=False, scheduled_report=None, metadata=None):  # noqa: C901
    if metadata is None:
        metadata = {}

    if report.data_source is None:
        logger.error("[Manager][report=%s] Failed adding job for report: data source is missing.", report.id)
        return None

    report_hash = gen_query_hash(report.hash)
    logger.info("Inserting report job for %s with metadata=%s", report_hash, metadata)
    try_count = 0
    job = None

    while try_count < 5:
        try_count += 1

        pipe = redis_connection.pipeline()
        try:
            pipe.watch(_job_lock_id(report_hash, report.data_source.id))
            job_id = pipe.get(_job_lock_id(report_hash, report.data_source.id))
            if job_id:
                logger.info("[%s] Found existing report job: %s", report_hash, job_id)
                job_complete = None
                job_cancelled = None
                message = None
                try:
                    job = Job.fetch(job_id)
                    job_exists = True
                    status = job.get_status()
                    job_complete = status in [JobStatus.FINISHED, JobStatus.FAILED]
                    job_cancelled = job.is_cancelled

                    if job_complete:
                        message = "job found is complete (%s)" % status
                    elif job_cancelled:
                        message = "job found has been cancelled"
                except NoSuchJobError:
                    message = "job found has expired"
                    job_exists = False

                lock_is_irrelevant = job_complete or job_cancelled or not job_exists

                if lock_is_irrelevant:
                    logger.info("[%s] %s, removing lock", report_hash, message)
                    redis_connection.delete(_job_lock_id(report_hash, report.data_source.id))
                    job = None

            if not job:
                pipe.multi()

                if scheduled_report:
                    queue_name = report.data_source.scheduled_queue_name
                    scheduled_report_id = scheduled_report.id
                else:
                    queue_name = report.data_source.queue_name
                    scheduled_report_id = None

                time_limit = settings.dynamic_settings.query_time_limit(
                    scheduled_report, user_id, report.data_source.org_id
                )
                metadata["Queue"] = queue_name

                queue = Queue(queue_name)
                enqueue_kwargs = {
                    "user_id": user_id,
                    "scheduled_report_id": scheduled_report_id,
                    "is_api_key": is_api_key,
                    "job_timeout": time_limit,
                    "failure_ttl": settings.JOB_DEFAULT_FAILURE_TTL,
                    "meta": {
                        "data_source_id": report.data_source.id,
                        "org_id": report.user.org_id,
                        "scheduled": scheduled_report_id is not None,
                        "report_id": metadata.get("report_id"),
                        "user_id": user_id,
                    },
                }

                if not scheduled_report:
                    enqueue_kwargs["result_ttl"] = settings.JOB_EXPIRY_TIME

                job = queue.enqueue(execute_report, report.id, metadata, **enqueue_kwargs)

                logger.info("[%s] Created new report job: %s", report_hash, job.id)
                pipe.set(
                    _job_lock_id(report_hash, report.data_source.id),
                    job.id,
                    settings.JOB_EXPIRY_TIME,
                )
                pipe.execute()
            break

        except redis.WatchError:
            continue
        finally:
            pipe.reset()

    if not job:
        logger.error("[Manager][%s] Failed adding job for report.", report_hash)

    return job


def signal_handler(*args):
    raise InterruptException


class ReportExecutionError(Exception):
    pass


def is_api_key(text: str) -> bool:
    if text is None:
        return False
    if len(text) >= 32:
        return True
    return False


def _resolve_user(user_id, _is_api_key, report_id):
    if user_id is not None:
        if _is_api_key:
            api_key = user_id
            if is_api_key(api_key):
                _api_key = models.ApiKey.get_by_api_key_safe(api_key)
                if _api_key:
                    return models.ApiUser(_api_key, _api_key.org, [])

            if report_id is not None:
                report = models.Report.get_by_id(report_id)
            else:
                report = models.Report.by_api_key(api_key)

            return models.ApiUser(api_key, report.user.org, report.groups)
        else:
            return models.User.get_by_id(user_id)
    else:
        return None


class ReportExecutor:
    def __init__(self, report_id, user_id, is_api_key, metadata, is_scheduled_report):
        self.job = get_current_job()
        self.report_id = report_id
        self.metadata = metadata
        self.user = _resolve_user(user_id, is_api_key, report_id)
        self.report_model = models.Report.query.get(self.report_id)

        if self.report_model is None:
            raise ReportExecutionError("Report not found")

        self.model = self.report_model.model
        self.org = self.report_model.user.org
        models.db.session.close()
        self.report_hash = gen_query_hash(self.report_model.hash)
        self.is_scheduled_report = is_scheduled_report
        if self.is_scheduled_report:
            models.scheduled_reports_executions.update(self.report_model.id)

    def run(self):
        signal.signal(signal.SIGINT, signal_handler)
        started_at = time.time()
        from redash.plywood.hash_manager import hash_to_result

        logger.debug("Executing report: %s", self.report_id)
        self._log_progress("executing_report")

        try:
            result = hash_to_result(
                self.report_model.hash,
                self.model,
                self.org,
                bypass_cache=True,
            )
            serialized = result.serialized() if hasattr(result, "serialized") else result
            error = None
        except Exception as e:
            serialized = None
            error = str(e)
            logger.warning("Unexpected error while running report:", exc_info=1)

        run_time = time.time() - started_at

        logger.info(
            "job=execute_report report_hash=%s report_id=%s ds_id=%s runtime=%.2f error=[%s]",
            self.report_hash,
            self.report_id,
            self.report_model.data_source_id,
            run_time,
            error,
        )

        _unlock(self.report_hash, self.report_model.data_source_id)

        if error is not None:
            result = ReportExecutionError(error)
            if self.is_scheduled_report:
                self.report_model = models.db.session.merge(self.report_model, load=False)
                track_failure(self.report_model, error)
            raise result

        if self.report_model.schedule_failures > 0:
            self.report_model = models.db.session.merge(self.report_model, load=False)
            self.report_model.schedule_failures = 0
            self.report_model.skip_updated_at = True
            models.db.session.add(self.report_model)

        self._log_progress("finished")
        models.db.session.commit()
        return {
            "report_id": self.report_id,
            "status": serialized.get("status") if isinstance(serialized, dict) else None,
        }

    def _log_progress(self, state):
        logger.info(
            "job=execute_report state=%s report_hash=%s ds_id=%s "
            "job_id=%s queue=%s report_id=%s username=%s",  # fmt: skip
            state,
            self.report_hash,
            self.report_model.data_source_id,
            self.job.id,
            self.metadata.get("Queue", "unknown"),
            self.metadata.get("report_id", "unknown"),
            self.metadata.get("Username", "unknown"),
        )


def execute_report(
    report_id,
    metadata,
    user_id=None,
    scheduled_report_id=None,
    is_api_key=False,
):
    try:
        return ReportExecutor(
            report_id,
            user_id,
            is_api_key,
            metadata,
            scheduled_report_id is not None,
        ).run()
    except ReportExecutionError as e:
        models.db.session.rollback()
        return e
