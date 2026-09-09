import logging
import time

from redash import models, redis_connection, settings
from redash.utils import json_dumps, sentry
from redash.worker import get_job_logger

from .execution import enqueue_report

logger = get_job_logger(__name__)


def empty_report_schedules():
    logger.info("Deleting schedules of past scheduled reports...")

    reports = models.Report.past_scheduled_reports()
    for report in reports:
        report.schedule = None
    models.db.session.commit()

    logger.info("Deleted %d report schedules.", len(reports))


def _should_refresh_report(report):
    if settings.FEATURE_DISABLE_REFRESH_QUERIES:
        logger.info("Disabled refresh reports.")
        return False
    elif report.user.org.is_disabled:
        logger.debug("Skipping refresh of report %s because org is disabled.", report.id)
        return False
    elif report.data_source is None:
        logger.debug("Skipping refresh of report %s because the datasource is none.", report.id)
        return False
    elif report.data_source.paused:
        logger.debug(
            "Skipping refresh of report %s because datasource - %s is paused (%s).",
            report.id,
            report.data_source.name,
            report.data_source.pause_reason,
        )
        return False
    else:
        return True


class RefreshReportsError(Exception):
    pass


def refresh_reports():
    started_at = time.time()
    logger.info("Refreshing reports...")
    enqueued = []
    for report in models.Report.outdated_reports():
        if not _should_refresh_report(report):
            continue

        try:
            job = enqueue_report(
                report,
                report.user_id,
                scheduled_report=report,
                metadata={"report_id": report.id, "Username": report.user.get_actual_user()},
            )
            if job:
                enqueued.append(report)
            else:
                logger.info("Skipping report %s: enqueue_report returned no job.", report.id)
        except Exception as e:
            message = "Could not enqueue report %d due to %s" % (report.id, repr(e))
            logging.info(message)
            error = RefreshReportsError(message).with_traceback(e.__traceback__)
            sentry.capture_exception(error)

    status = {
        "started_report_refresh_at": started_at,
        "outdated_reports_count": len(enqueued),
        "last_report_refresh_at": time.time(),
        "report_ids": json_dumps([report.id for report in enqueued]),
    }

    redis_connection.hset("redash:status", mapping=status)
    logger.info("Done refreshing reports: %s", status)
