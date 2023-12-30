import yaml
from flask import request
from typing import List

from redash import models
from redash.handlers.base import BaseResource, get_object_or_404, require_fields
from redash.models.models import Model, ModelConfig
from redash.permissions import require_permission, require_admin_or_owner
from redash.plywood.objects.data_cube import lower_kind, DataCube
from redash.serializers.model_serializer import ModelConfigSerializer
from redash.services.model_config_validator import ModelConfigValidator

UPDATE_ACTION = "update"
CREATE_ACTION = "create"


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

        action = UPDATE_ACTION
        config = model.config
        if config is None:
            action = CREATE_ACTION
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
        model: Model = get_object_or_404(Model.get_by_id, model_id)
        models: list(Model) = Model.query.filter(Model.data_source_id==model.data_source_id).all()
        data_cubes: List[DataCube.data_cube] = []
        table_names: list(str) = []
        for model in models:
            cube = DataCube(model).data_cube
            if cube['name'] not in table_names:
                table_names.append(cube['name'])
                data_cubes.append(cube)
        return {
            "appSettings": {
                "dataCubes": data_cubes,
                "clusters": [],
                "customization": {}
            },
            "timekeeper": {}
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
