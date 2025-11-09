import logging
from typing import Any

import requests

from redash.settings import SERVER_WORKER_URL

logger = logging.getLogger(__name__)

class ServerWorkerApi:
    @classmethod
    def health(cls):
        return cls.execute(SERVER_WORKER_URL + "/health")

    @classmethod
    def execute(cls, url: str, body: Any = None):
        try:
            logger.info("Sending request url: %s body: %s", url, body)
            response = requests.post(url=url, json=body)
            response.raise_for_status()
            return response.json()
        except Exception as err:
            logger.error("Error occurred during sending request to Server's Worker\n\t%s", err)
            raise err
