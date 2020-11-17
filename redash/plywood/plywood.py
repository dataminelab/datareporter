import requests


class PlywoodApi(object):
    PLYWOOD_URL = "http://0.0.0.0:3000/api/v1/plywood"

    @classmethod
    def convert_to_sql(cls, body=None):
        if body is None:
            body = {}
        return requests.post(url=cls.PLYWOOD_URL, data=body)
