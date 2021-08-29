from redash.serializers import Serializer


def _serialize_table(schema):
    d = {
        "name": schema['name'],
    }
    return d


class TableSerializer(Serializer):
    def __init__(self, schemas, **kwargs):
        self.schemas = schemas
        self.options = kwargs

    def serialize(self):
        result = [
            _serialize_table(query) for query in self.schemas
        ]

        return result
