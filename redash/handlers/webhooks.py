import subprocess
import json
import base64
import logging
from flask import request

from redash.handlers import routes
from redash.handlers.base import json_response

logger = logging.getLogger(__name__)


@routes.route("/api/subscribe/default", methods=["POST"])
def pubsub_subscribe():
    queue = get_message_from_subscribed_data(request.data)
    command = f"/app/manage.py rq worker --burst {queue}"

    logger.info(f"running - {command}")
    result = subprocess.run(command, shell=True)
    logger.warning(f"worker execution result : {result.returncode}\nstdout:\n {result.stdout}\nstderr:\n {result.stderr}")

    return ("", 204)


def get_message_from_subscribed_data(request_data):
    envelope = request_data.decode("utf-8")
    data = json.loads(envelope)
    message_data = data['message']['data']
    return base64.b64decode(message_data).decode("utf-8").strip()
