from datetime import datetime
import requests
from flask_mail import Message
from rq import Connection
from rq.registry import FailedJobRegistry
from rq.job import Job
import mailchimp_marketing as MailchimpMarketing
from mailchimp_marketing.api_client import ApiClientError
from redash import mail, models, settings, rq_redis_connection
from redash.models import users
from redash.worker import job, get_job_logger, default_operational_queues
from redash.tasks.worker import Queue
from redash.query_runner import NotSupported

logger = get_job_logger(__name__)


@job("default")
def record_event(raw_event):
    event = models.Event.record(raw_event)
    models.db.session.commit()

    for hook in settings.EVENT_REPORTING_WEBHOOKS:
        logger.debug("Forwarding event to: %s", hook)
        try:
            data = {
                "schema": "iglu:io.redash.webhooks/event/jsonschema/1-0-0",
                "data": event.to_dict(),
            }
            response = requests.post(hook, json=data)
            if response.status_code != 200:
                logger.error("Failed posting to %s: %s", hook, response.content)
        except Exception:
            logger.exception("Failed posting to %s", hook)


def version_check():
    raise Exception("Version check is disabled")

@job("default")
def add_member_mailchimp(email, name, org_name):
    list_id = settings.MAILCHIMP_LIST_ID
    logger.info("Subscribing to: mailchimp newsteller service with %s", email)
    try:
        client = MailchimpMarketing.Client()
        client.set_config({
            "api_key": settings.MAILCHIMP_API_KEY,
            "server": settings.MAILCHIMP_SERVER
        })
        client.lists.add_list_member(list_id, {"email_address": email, "merge_fields": {"FNAME": name, "ONAME": org_name}, "status": "subscribed"})
    except ApiClientError as error:
        if error.status_code == 400:
            logger.info("%s is already subscribed to the mailchimp", email)
        else:
            raise Exception(f"Error: {error.text}") from error

@job("emails")
def send_mail(to, subject, html, text):
    try:
        message = Message(recipients=to, subject=subject, html=html, body=text)

        mail.send(message)
    except Exception:
        logger.exception("Failed sending message: %s", message.subject)


@job("queries", timeout=30, ttl=90)
def test_connection(data_source_id):
    try:
        data_source = models.DataSource.get_by_id(data_source_id)
        data_source.query_runner.test_connection()
    except Exception as e:
        return e
    else:
        return True


@job("schemas", queue_class=Queue, at_front=True, timeout=settings.SCHEMAS_REFRESH_TIMEOUT, ttl=90)
def get_schema(data_source_id, refresh):
    try:
        data_source = models.DataSource.get_by_id(data_source_id)
        return data_source.get_schema(refresh)
    except NotSupported:
        return {
            "error": {
                "code": 1,
                "message": "Data source type does not support retrieving schema",
            }
        }
    except Exception as e:
        return {"error": {"code": 2, "message": "Error retrieving schema", "details": str(e)}}


def sync_user_details():
    users.sync_last_active_at()


def purge_failed_jobs() -> None:
    with Connection(rq_redis_connection):
        queues = [q for q in Queue.all() if q.name not in default_operational_queues]
        for queue in queues:
            failed_job_ids = FailedJobRegistry(queue=queue).get_job_ids()
            failed_jobs = Job.fetch_many(failed_job_ids, rq_redis_connection)
            stale_jobs = []
            for failed_job in failed_jobs:
                # the job may not actually exist anymore in Redis
                if not failed_job:
                    continue
                # the job could have an empty ended_at value in case
                # of a worker dying before it can save the ended_at value,
                # in which case we also consider them stale
                if not failed_job.ended_at:
                    stale_jobs.append(failed_job)
                elif (datetime.utcnow() - failed_job.ended_at).total_seconds() > settings.JOB_DEFAULT_FAILURE_TTL:
                    stale_jobs.append(failed_job)

            for stale_job in stale_jobs:
                stale_job.delete()

            if stale_jobs:
                logger.info(
                    "Purged %d old failed jobs from the %s queue.",
                    len(stale_jobs),
                    queue.name,
                )
