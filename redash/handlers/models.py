from flask import request, make_response
from funcy import project

from redash import models
from redash.handlers.base import BaseResource, require_fields, get_object_or_404, paginate
from redash.handlers.queries import order_results
from redash.models.models import Model, ModelConfig
from redash.permissions import require_permission, require_admin_or_owner, require_object_modify_permission
from redash.serializers.model_serializer import ModelSerializer
from redash.services.model_config_generator import ModelConfigGenerator
from redash.services.model_config_validator import ModelConfigValidator


class ModelsListResource(BaseResource):

    @require_permission("create_model")
    def post(self):

        req = request.get_json(True)

        require_fields(req, ("name", "data_source_id", "table"))

        name, data_source_id, table = req["name"], req["data_source_id"], req["table"]

        content = req.get('content', None)

        data_source = get_object_or_404(
            models.DataSource.get_by_id_and_org, data_source_id, self.current_org
        )

        model = Model(
            name=name,
            data_source_id=data_source.id,
            user_id=self.current_user.id,
            user=self.current_user,
            table=table
        )

        if content is None:
            content = ModelConfigGenerator.yaml(model=model, refresh=True)
        else:
            validator = ModelConfigValidator(content=content)
            validator.validate()

        model_config = ModelConfig(user=self.current_user, model=model, content=content)

        models.db.session.add(model)
        models.db.session.add(model_config)
        models.db.session.commit()

        self.record_event({
            "action": "create",
            "object_id": model.id,
            "object_type": "model",
        })

        return ModelSerializer(model).serialize()

    @require_permission("view_model")
    def get(self):

        data_source = request.args.get('data_source', None)

        if data_source:
            found_models = Model.get_by_data_source(int(data_source))
        else:
            found_models = Model.get_by_user(self.current_user)

        ordered_results = order_results(found_models)

        page = request.args.get("page", 1, type=int)
        page_size = request.args.get("page_size", 25, type=int)

        response = paginate(
            ordered_results,
            page=page,
            page_size=page_size,
            serializer=ModelSerializer,
        )

        self.record_event({
            "action": "list",
            "object_type": "model"
        })

        return response


class ModelsResource(BaseResource):

    @require_permission("view_model")
    def get(self, model_id):
        model = get_object_or_404(Model.get_by_id, model_id)

        self.record_event({
            "action": "view",
            "object_id": model.id,
            "object_type": "model"
        })

        return ModelSerializer(model).serialize()

    @require_permission("edit_model")
    def post(self, model_id):
        model_properties = request.get_json(force=True)
        model = get_object_or_404(Model.get_by_id, model_id)
        require_object_modify_permission(model, self.current_user)

        updates = project(
            model_properties, ("name", "data_source_id", "table"),
        )

        self.update_model(model, updates)
        models.db.session.commit()

        content = ModelConfigGenerator.yaml(model=model, refresh=True)

        if model.config:
            self.update_model(model.config, {"content": content})
            models.db.session.commit()

        self.record_event({
            "action": "edit",
            "object_id": model.id,
            "object_type": "model"
        })

        return ModelSerializer(model).serialize()

    def delete(self, model_id):
        model = get_object_or_404(Model.get_by_id, model_id)

        require_admin_or_owner(model.user_id)

        if model.config is not None:
            models.db.session.delete(model.config)
        models.db.session.delete(model)
        models.db.session.commit()

        self.record_event({
            "action": "delete",
            "object_id": model_id,
            "object_type": "model",
        })

        return make_response("", 204)
