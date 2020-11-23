import requests
import logging

from redash.settings import PLYWOOD_SERVER_URL

logger = logging.getLogger(__name__)


class PlywoodApi(object):
    PLYWOOD_URL = "{}/api/v1/plywood".format(PLYWOOD_SERVER_URL)

    @classmethod
    def convert_to_sql(cls, body):
        try:
            return requests.post(url=cls.PLYWOOD_URL, data=body)
        except Exception as e:
            logger.error("Error occurred during sending request to Plywood Server", e)
            raise e
