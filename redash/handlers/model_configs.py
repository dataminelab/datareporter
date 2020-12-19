from enum import Enum

import yaml
from flask import request

from redash import models
from redash.handlers.base import BaseResource, get_object_or_404, require_fields
from redash.models.models import Model, ModelConfig
from redash.permissions import require_permission, require_admin_or_owner
from redash.serializers.model_serializer import ModelConfigSerializer
from redash.services.model_config_validator import ModelConfigValidator


class EventAction(Enum):
    UPDATE = "update"
    CREATE = "create"


class ModelsConfigResource(BaseResource):
    @require_permission("edit_model_config")
    def post(self, model_id):
        req = request.get_json(True)
        require_fields(req, ('content',))
        content = req['content']

        validator = ModelConfigValidator(content=content)
        validator.validate()

        model = get_object_or_404(Model.get_by_id, model_id)
        require_admin_or_owner(model.user_id)

        action = EventAction.UPDATE
        config = model.config
        if config is None:
            action = EventAction.CREATE
            config = ModelConfig(user=self.current_user, model=model, content=content)
        else:
            config.content = content

        models.db.session.add(config)
        models.db.session.commit()

        self.record_event({
            "action": action,
            "object_id": config.id,
            "object_type": "model_config"
        })

        return ModelConfigSerializer(model.config).serialize()

    @require_permission("view_model")
    def get(self, model_id):
        model = get_object_or_404(Model.get_by_id, model_id)
        config = yaml.load(model.config.content)

        return {
            "appSettings": {
                config
            }
        }


class ModelsConfigGetResource(BaseResource):
    @require_permission("view_model_config")
    def get(self, config_id):
        config = get_object_or_404(ModelConfig.get_by_id, config_id)
        require_admin_or_owner(config.user_id)

        self.record_event({
            "action": "view",
            "object_id": config.id,
            "object_type": "model_config"
        })

        return ModelConfigSerializer(config).serialize()
