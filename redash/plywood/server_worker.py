import logging
from typing import List
from redash.settings import SERVER_WORKER_URL
import requests

logger = logging.getLogger(__name__)

REDASH_PLYWOOD_DB = {
    'pg': 'postgres',
    'bigquery': 'bigquery',
    'mysql': 'mysql'
}


class ServerWorkerApi(object):
    WORKER_URL = "{}".format(SERVER_WORKER_URL)

    @classmethod
    def health(cls):
        return cls.execute(cls.WORKER_URL + "/health")

    @classmethod
    def execute(cls, url: str, body: any = None):
        try:
            logger.info(f"Sending request url: {url} body: {body}")
            response = requests.post(url=url, json=body)
            response.raise_for_status()
            return response.json()
        except Exception as err:
            logger.error(f"Error occurred during sending request to Server's Worker\n\t{err}")
            raise err
