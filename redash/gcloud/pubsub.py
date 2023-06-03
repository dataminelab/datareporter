import base64
import json

from google.cloud import pubsub_v1

from redash.settings import GOOGLE_PRODUCT_ID, GOOGLE_PUBSUB_WORKER_TOPIC_ID


def send_message_to_topic(message: str):
    if not GOOGLE_PRODUCT_ID or not GOOGLE_PUBSUB_WORKER_TOPIC_ID:
        return None
    publisher = pubsub_v1.PublisherClient()
    # The `topic_path` method creates a fully qualified identifier
    # in the form `projects/{project_id}/topics/{topic_id}`
    topic_path = publisher.topic_path(GOOGLE_PRODUCT_ID, GOOGLE_PUBSUB_WORKER_TOPIC_ID)

    # Data must be a bytestring
    data = message.encode("utf-8")
    # When you publish a message, the client returns a future.
    future = publisher.publish(topic_path, data)

    return future.result()


def get_message_from_subscribed_data(request_data):
    envelope = request_data.decode("utf-8")
    data = json.loads(envelope)
    message_data = data['message']['data']
    return base64.b64decode(message_data)
