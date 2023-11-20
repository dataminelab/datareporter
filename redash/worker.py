import ctypes
import threading
from datetime import timedelta
from functools import partial
from flask import request
import logging

from flask import Blueprint
from itertools import chain

from rq import get_current_job, VERSION
from rq.decorators import job as rq_job

import base64

from rq.exceptions import DequeueTimeout
from rq.logutils import setup_loghandlers
from rq.timeouts import JobTimeoutException, BaseDeathPenalty
from rq.worker import WorkerStatus, green, blue

logger = logging.getLogger(__name__)
from redash import (
    settings,
    rq_redis_connection,
)
from redash.tasks.worker import Queue as RedashQueue, Worker

default_operational_queues = ["periodic", "emails", "default"]
default_query_queues = ["scheduled_queries", "queries", "schemas"]
default_queues = default_operational_queues + default_query_queues


class StatsdRecordingJobDecorator(rq_job):  # noqa
    """
    RQ Job Decorator mixin that uses our Queue class to ensure metrics are accurately incremented in Statsd
    """

    queue_class = RedashQueue


job = partial(StatsdRecordingJobDecorator, connection=rq_redis_connection)


class CurrentJobFilter(logging.Filter):
    def filter(self, record):
        current_job = get_current_job()

        record.job_id = current_job.id if current_job else ""
        record.job_func_name = current_job.func_name if current_job else ""

        return True


def get_job_logger(name):
    logger = logging.getLogger("rq.job." + name)

    handler = logging.StreamHandler()
    handler.formatter = logging.Formatter(settings.RQ_WORKER_JOB_LOG_FORMAT)
    handler.addFilter(CurrentJobFilter())

    logger.addHandler(handler)
    logger.propagate = False

    return logger


class FirstJobExecutor(Worker):

    def __init__(self, queue):
        queues = chain(queue.split(","))
        super().__init__(queues=queues, default_worker_ttl=1)

    def execute(self) -> None:
        self.consume_first_available_job()

    def consume_first_available_job(self) -> None:
        try:
            self.register_birth()
            self.log.info("Worker %s: started, version %s", self.key, VERSION)
            self.set_state(WorkerStatus.STARTED)
            qnames = self.queue_names()
            self.log.info('*** Listening on %s...', green(', '.join(qnames)))
            if self.should_run_maintenance_tasks:
                self.clean_registries()
            # wait up to 1 second for next job
            timeout = 1

            result = self.dequeue(timeout)
            if result is None:
                return None

            next_job, queue = result
            self.execute_job(next_job, queue)
            self.heartbeat()
        finally:
            if not self.is_horse:
                self.register_death()

    """
    Dequeue next task without waiting if there is nothing to do
    """
    def dequeue(self, timeout: int):
        result = None
        qnames = ','.join(self.queue_names())

        self.set_state(WorkerStatus.IDLE)
        self.procline('Listening on ' + qnames)
        self.log.debug('*** Listening on %s...', green(qnames))

        self.heartbeat()

        try:
            result = self.queue_class.dequeue_any(self.queues, timeout,
                                                  connection=self.connection,
                                                  job_class=self.job_class)
            if result is not None:

                next_job, queue = result
                if self.log_job_description:
                    self.log.info(
                        '%s: %s (%s)', green(queue.name),
                        blue(next_job.description), next_job.id)
                else:
                    self.log.info('%s: %s', green(queue.name), next_job.id)

        except DequeueTimeout:
            pass

        self.heartbeat()
        return result


def queue_from(envelope) -> str:
    message_data = envelope['message']['data']
    return base64.b64decode(message_data).decode("utf-8").strip()


worker = Blueprint(
    "redash", __name__
)


@worker.route('/execute', methods=['POST'])
def process():
    queue = queue_from(request.json)
    job_consumer = FirstJobExecutor(queue)
    job_consumer.execute()
    return "", 204


@worker.route('/health')
def health():
    return {"status": "Up"}


def init_app(app):
    setup_loghandlers()
    app.register_blueprint(worker)
