import subprocess

from flask import request

from redash.gcloud.pubsub import get_message_from_subscribed_data
from redash.handlers import routes
from redash.handlers.base import json_response


@routes.route("/api/subscribe/default", methods=["POST"])
def pubsub_subscribe():
    queue = get_message_from_subscribed_data(request.data)
    command = f"/app/manage.py rq {queue} --burst"

    result = subprocess.run(command, shell=True)

    return json_response(dict(success=result.returncode == 0))
