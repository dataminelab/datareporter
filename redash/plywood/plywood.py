import itertools
import logging
from typing import List
from redash.settings import PLYWOOD_SERVER_URL
import requests

logger = logging.getLogger(__name__)

REDASH_PLYWOOD_DB = {
    'pg': 'postgres',
    'bigquery': 'bigquery',
    'mysql': 'mysql',
    'druid': 'druid',
}


class PlywoodApi(object):
    PLYWOOD_URL = "{}/api/v1/plywood".format(PLYWOOD_SERVER_URL)

    @classmethod
    def convert_to_sql(cls, body):
        data = cls.execute(cls.PLYWOOD_URL, body)
        queries = data['queries']
        return list(itertools.chain.from_iterable(queries))

    @classmethod
    def get_supported_engines(cls) -> List[str]:
        url = cls.PLYWOOD_URL + '/attributes/engines'
        return cls.execute(url)['supportedEngines']

    @staticmethod
    def redash_db_name_to_plywood(redash_db_name: str):
        redash = redash_db_name.lower()
        return REDASH_PLYWOOD_DB.get(redash, redash)

    @classmethod
    def convert_hash_to_expression(cls, hash: str, data_cube: dict) -> str:
        url = cls.PLYWOOD_URL + '/expression'
        body = dict(hash=hash, dataCube=data_cube)
        return cls.execute(url, body)

    @classmethod
    def execute(cls, url: str, body: any = None):
        try:
            logger.info(f"Sending request url: {url} body: {body}")
            response = requests.post(url=url, json=body)
            response.raise_for_status()
            return response.json()
        except Exception as err:
            logger.error(f"Error occurred during sending request to Plywood Server\n\t{err}")
            raise err

    @classmethod
    def convert_attributes(cls, redash_db_type: str, attributes: list) -> List[dict]:
        url = cls.PLYWOOD_URL + '/attributes'
        engine = cls.redash_db_name_to_plywood(redash_db_type)

        body = dict(engine=engine, attributes=attributes)
        attributes = cls.execute(url, body)['attributes']
        return attributes

    @classmethod
    def get_shape(cls, body: dict) -> str:
        url = cls.PLYWOOD_URL + '/response-shape'
        return cls.execute(url, body)
