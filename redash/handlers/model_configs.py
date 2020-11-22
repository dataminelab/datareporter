import io

import yaml
from flask import request
from flask_restful import abort

from redash import models

from redash.handlers.base import BaseResource, get_object_or_404, require_fields
from redash.models.models import Model, ModelConfig
from redash.permissions import require_permission, require_admin_or_owner
from redash.serializers.model_serializer import ModelConfigSerializer


def _validate_yml(content: str):
    with io.StringIO(content) as f:
        try:
            yaml.load(f)
        except yaml.MarkedYAMLError as e:
            pm = e.problem_mark
            abort(
                400,
                message="Your config has an issue on line {} at position {}".format(pm.line, pm.column),
            )


class ModelsConfigResource(BaseResource):
    @require_permission("edit_model_config")
    def post(self, model_id):
        req = request.get_json(True)
        require_fields(req, ('content',))
        content = req['content']

        _validate_yml(content)

        model = get_object_or_404(Model.get_by_id, model_id)
        require_admin_or_owner(model.user_id)

        action = "update"
        config = model.config
        if config is None:
            action = "create"
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
