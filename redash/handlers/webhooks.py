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
    queue = None
    lock = None

    def __init__(self, queue: str):
        self.queue = queue
        if self.queue in locks:
            self.lock = locks[self.queue]
        else:
            self.lock = locks[self.queue] = threading.Semaphore()

    def execute(self) -> None:
        if self.lock.acquire(blocking=False):
            self.run_worker()
            self.lock.release()
        else:
            logger.info("other worker is already running - skipping execution")

    def run_worker(self) -> None:
        command = f"/app/manage.py rq worker --burst {self.queue}"
        logger.info(f"running - {command}")
        result = subprocess.run(command, shell=True, capture_output=True)
        logger.warning(
            f"worker execution result : {result.returncode}\nstdout:\n {result.stdout}\nstderr:\n {result.stderr}")


@routes.route("/api/subscribe/default", methods=["POST"])
def pubsub_subscribe():
    queue = get_message_from_subscribed_data(request.data)
    worker = WorkerProcess(queue)
    worker.execute()
    return ("", 204)


def get_message_from_subscribed_data(request_data: bytes) -> str:
    envelope = request_data.decode("utf-8")
    data = json.loads(envelope)
    logger.info(f"Received message {envelope}")
    message_data = data['message']['data']
    return base64.b64decode(message_data).decode("utf-8").strip()
