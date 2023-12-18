from redash.models.models import Model, ModelConfig
from redash.serializers import Serializer


def _serialize_model(model: Model):
    d = {
        "id": model.id,
        "name": model.name,
        "user_id": model.user_id,
        "data_source_id": model.data_source_id,
        "data_source_name": model.data_source.name,
        "table": model.table,
        "model_config_id": model.config.id if model.config else None,
        "created_at": model.created_at,
        "updated_at": model.updated_at,
    }

    return d


def _serialize_model_config(model_config: ModelConfig):
    d = {
        "id": model_config.id,
        "content": model_config.content,
        "model_id": model_config.model_id,
        "user_id": model_config.user_id,
        "created_at": model_config.created_at,
        "updated_at": model_config.updated_at,
    }

    return d


class ModelSerializer(Serializer):
    def __init__(self, object_or_list, **kwargs):
        self.object_or_list = object_or_list
        self.options = kwargs

    def serialize(self):
        if isinstance(self.object_or_list, Model):
            result = _serialize_model(self.object_or_list)
        else:
            result = [
                _serialize_model(query) for query in self.object_or_list
            ]

        return result


class ModelConfigSerializer(Serializer):
    def __init__(self, object_or_list, **kwargs):
        self.object_or_list = object_or_list
        self.options = kwargs

    def serialize(self):
        if isinstance(self.object_or_list, ModelConfig):
            result = _serialize_model_config(self.object_or_list)
        else:
            result = [
                _serialize_model_config(query) for query in self.object_or_list
            ]

        return result
