import itertools
import logging
from typing import List

import requests

from redash.settings import PLYWOOD_SERVER_URL

logger = logging.getLogger(__name__)

REDASH_PLYWOOD_DB = {
    'pg': 'postgres',
    'bigquery': 'bigquery',
    'mysql': 'mysql'
}


class PlywoodApi(object):
    PLYWOOD_URL = "{}/api/v1/plywood".format(PLYWOOD_SERVER_URL)

    @classmethod
    def convert_to_sql(cls, body):
        try:
            response = requests.post(url=cls.PLYWOOD_URL, json=body)
            data = response.json()
            print("DATA", data)
            queries = data['queries']

            return list(itertools.chain.from_iterable(queries))
        except Exception as e:
            logger.error("Error occurred during sending request to Plywood Server", e)
            raise e

    @classmethod
    def get_supported_engines(cls) -> List[str]:
        url = cls.PLYWOOD_URL + '/attributes/engines'

        try:
            response = requests.get(url=url)
            return response.json()['supportedEngines']
        except Exception as e:
            logger.error("Error occurred during sending request to Plywood Server", e)
            raise e

    @staticmethod
    def redash_db_name_to_plywood(redash_db_name: str):
        redash = redash_db_name.lower()
        return REDASH_PLYWOOD_DB.get(redash, redash)

    @classmethod
    def convert_hash_to_expression(cls, hash: str, data_cube: dict) -> str:
        url = cls.PLYWOOD_URL + '/expression'

        body = dict(hash=hash, dataCube=data_cube)
        try:
            response = requests.post(url=url, json=body)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error("Error occurred during sending request to Plywood Server", e)
            raise e

    @classmethod
    def convert_attributes(cls, redash_db_type: str, attributes: list) -> List[dict]:
        url = cls.PLYWOOD_URL + '/attributes'
        engine = cls.redash_db_name_to_plywood(redash_db_type)

        body = dict(engine=engine, attributes=attributes)
        try:
            response = requests.post(url=url, json=body)
            attributes = response.json()['attributes']
            return attributes
        except Exception as e:
            logger.error("Error occurred during sending request to Plywood Server", e)
            raise e

    @classmethod
    def get_shape(cls, body: dict) -> str:
        url = cls.PLYWOOD_URL + '/response-shape'

        try:
            response = requests.post(url=url, json=body)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error("Error occurred during sending request to Plywood Server", e)
            raise e
