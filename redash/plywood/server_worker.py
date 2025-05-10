import logging
import requests
from redash.settings import SERVER_WORKER_URL

logger = logging.getLogger(__name__)

REDASH_PLYWOOD_DB = {
    'pg': 'postgres',
    'bigquery': 'bigquery',
    'mysql': 'mysql'
}


class ServerWorkerApi(object):

    @classmethod
    def health(cls):
        return cls.execute(SERVER_WORKER_URL + "/health")

    @classmethod
    def execute(cls, url: str, body: any = None):
        try:
            logger.info("Sending request url: %s body: %s", url, body)
            response = requests.post(url=url, json=body)
            response.raise_for_status()
            return response.json()
        except Exception as err:
            logger.error("Error occurred during sending request to Server's Worker\n\t%s", err)
            raise err
