import base64
import hmac
import json
import logging
import re
import subprocess
import threading

from flask import abort, request

from redash.handlers import routes
from redash.settings import WEBHOOK_AUTH_TOKEN

logger = logging.getLogger(__name__)

locks = {}

# Only these RQ queue names are allowed to be triggered via webhook.
ALLOWED_QUEUES = frozenset(
    ["default", "periodic", "emails", "scheduled_queries", "queries", "schemas"]
)

# Queue names must be alphanumeric with underscores only.
_QUEUE_NAME_RE = re.compile(r"^[a-z][a-z0-9_]{0,63}$")


def _verify_auth_token() -> None:
    """Verify the request carries a valid Bearer token.

    The token is compared in constant-time to prevent timing attacks.
    If WEBHOOK_AUTH_TOKEN is not configured, the endpoint is disabled
    entirely to prevent accidental exposure.
    """
    if not WEBHOOK_AUTH_TOKEN:
        logger.warning("Webhook called but WEBHOOK_AUTH_TOKEN is not configured — rejecting")
        abort(403)

    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        abort(401)

    provided_token = auth_header[len("Bearer "):]
    if not hmac.compare_digest(provided_token, WEBHOOK_AUTH_TOKEN):
        logger.warning("Webhook called with invalid auth token")
        abort(403)


def _validate_queue_name(queue: str) -> str:
    """Validate and return a safe queue name, or abort with 400."""
    if not _QUEUE_NAME_RE.match(queue):
        logger.warning("Webhook received invalid queue name format")
        abort(400)

    if queue not in ALLOWED_QUEUES:
        logger.warning("Webhook received disallowed queue name: %s", queue)
        abort(400)

    return queue


class WorkerProcess:
    def __init__(self, queue: str):
        self.queue = queue
        if self.queue in locks:
            self.lock = locks[self.queue]
        else:
            self.lock = locks[self.queue] = threading.Semaphore()

    def execute(self) -> None:
        if self.lock.acquire(blocking=False):
            try:
                self.run_worker()
            finally:
                self.lock.release()
        else:
            logger.info("Other worker for queue %s is already running — skipping", self.queue)

    def run_worker(self) -> None:
        command = ["/app/manage.py", "rq", "worker", "--burst", self.queue]
        logger.info("Running worker for queue: %s", self.queue)
        result = subprocess.run(command, capture_output=True)
        logger.info(
            "Worker for queue %s exited with code %d", self.queue, result.returncode
        )
        if result.returncode != 0:
            logger.warning(
                "Worker stderr for queue %s: %s",
                self.queue,
                result.stderr[:500] if result.stderr else "(empty)",
            )


@routes.route("/api/subscribe/default", methods=["POST"])
def pubsub_subscribe():
    _verify_auth_token()

    queue = get_message_from_subscribed_data(request.data)
    queue = _validate_queue_name(queue)

    worker = WorkerProcess(queue)
    worker.execute()
    return ("", 204)


def get_message_from_subscribed_data(request_data: bytes) -> str:
    envelope = request_data.decode("utf-8")
    data = json.loads(envelope)
    logger.info("Received webhook message (id=%s)", data.get("message", {}).get("messageId", "unknown"))
    message_data = data['message']['data']
    return base64.b64decode(message_data).decode("utf-8").strip()
