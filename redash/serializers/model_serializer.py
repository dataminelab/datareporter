from redash.models.models import Model
from redash.serializers import Serializer


def _serialize_query(model: Model):
    d = {
        "id": model.id,
        "name": model.name,
        "user_id": model.user_id,
        "data_source_id": model.data_source_id,
        "created_at": model.created_at,
        "updated_at": model.updated_at,
    }

    return d


class ModelSerializer(Serializer):
    def __init__(self, object_or_list, **kwargs):
        self.object_or_list = object_or_list
        self.options = kwargs

    def serialize(self):
        if isinstance(self.object_or_list, Model):
            result = _serialize_query(self.object_or_list)
        else:
            result = [
                _serialize_query(query) for query in self.object_or_list
            ]

        return result
