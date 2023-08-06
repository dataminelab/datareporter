import base64
import json
import logging
import subprocess
import threading

from flask import request

from redash.handlers import routes

logger = logging.getLogger(__name__)

locks = {}


class WorkerProcess:
    def __int__(self, queue: str):
        self._queue = queue

    def execute(self):
        command = f"/app/manage.py rq worker --burst {self._queue}"
        queue_lock = locks[self._queue]
        if queue_lock is None:
            queue_lock = locks[self._queue] = threading.Semaphore()
        if queue_lock.acquire(blocking=False):
            logger.info(f"running - {command}")
            result = subprocess.run(command, shell=True, capture_output=True)
            queue_lock.release()
            logger.warning(
                f"worker execution result : {result.returncode}\nstdout:\n {result.stdout}\nstderr:\n {result.stderr}")
        else:
            logger.info("other worker is already running - skipping execution")


@routes.route("/api/subscribe/default", methods=["POST"])
def pubsub_subscribe():
    queue = get_message_from_subscribed_data(request.data)
    worker = WorkerProcess(queue)
    worker.execute()
    return ("", 204)


def get_message_from_subscribed_data(request_data):
    envelope = request_data.decode("utf-8")
    data = json.loads(envelope)
    message_data = data['message']['data']
    return base64.b64decode(message_data).decode("utf-8").strip()
