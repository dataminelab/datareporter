import os
os.environ["PLYWOOD_SERVER_URL"] = "http://localhost:3000"
from redash.plywood.plywood import PlywoodApi
from redash.settings import PLYWOOD_SERVER_URL

body = {
    "engine": "postgres",
    "attributes": [
        {
            "name": "api_key",
            "type": "CHARACTER VARYING"
        }
    ]
}

res = PlywoodApi.convert_attributes(body)
print(res)
