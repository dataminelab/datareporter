import itertools

import requests
import logging

from redash.settings import PLYWOOD_SERVER_URL

logger = logging.getLogger(__name__)


class PlywoodApi(object):
    PLYWOOD_URL = "{}/api/v1/plywood".format(PLYWOOD_SERVER_URL)

    @classmethod
    def convert_to_sql(cls, body):
        try:
            response = requests.post(url=cls.PLYWOOD_URL, json=body)
            queries = response.json()['queries']
            return list(itertools.chain.from_iterable(queries))
        except Exception as e:
            logger.error("Error occurred during sending request to Plywood Server", e)
            raise e
