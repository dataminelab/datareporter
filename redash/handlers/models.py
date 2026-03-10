from flask import make_response, request
from flask_restful import abort
from funcy import project

from redash import models
from redash.handlers.base import (
    BaseResource,
    get_object_or_404,
    paginate,
    require_fields,
)
from redash.handlers.queries import order_results
from redash.models.model_config import ModelConfig
from redash.models.models import Model
from redash.permissions import (
    require_admin_or_owner,
    require_object_modify_permission,
    require_permission,
)
from redash.serializers.model_serializer import ModelSerializer
from redash.services.model_config_generator import ModelConfigGenerator
from redash.services.model_config_validator import ModelConfigValidator


class ModelsListResource(BaseResource):
    @require_permission("create_model")
    def post(self):
        req = request.get_json(True)

        require_fields(req, ("name", "data_source_id"))

        name, data_source_id = req["name"], req["data_source_id"]
        table = req.get("table")
        query_id = req.get("query_id")

        if not table and not query_id:
            abort(400, message="Either 'table' or 'query_id' must be provided.")

        if table and query_id:
            abort(400, message="Provide either 'table' or 'query_id', not both.")

        content = req.get("content", None)

        data_source = get_object_or_404(models.DataSource.get_by_id_and_org, data_source_id, self.current_org)

        # Validate query exists and uses the same data source
        if query_id:
            query_obj = models.Query.query.get(query_id)
            if not query_obj:
                abort(404, message="Query not found.")
            if query_obj.data_source_id != data_source.id:
                abort(400, message="Query must use the same data source as the model.")

        model = Model(
            name=name,
            data_source_id=data_source.id,
            user_id=self.current_user.id,
            user=self.current_user,
            table=table,
            query_id=query_id,
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

        self.record_event(
            {
                "action": "create",
                "object_id": model.id,
                "object_type": "model",
            }
        )

        return ModelSerializer(model).serialize()

    @require_permission("view_model")
    def get(self):
        data_source = request.args.get("data_source", None)

        if data_source:
            found_models = Model.get_by_data_source(int(data_source))
        elif self.current_user.has_permission("admin"):
            found_models = Model.get_by_group_ids(self.current_user)
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

        self.record_event({"action": "list", "object_type": "model"})

        return response


class ModelQueriesResource(BaseResource):
    """
    GET /api/models/queries?data_source_id=<id> — List queries available for model creation.

    Returns non-archived, non-draft queries for the given data source,
    filtered by the current user's group permissions. Used by the UI
    to populate the query picker when creating a query-based model.
    """

    @require_permission("create_model")
    def get(self):
        data_source_id = request.args.get("data_source_id", type=int)
        if not data_source_id:
            abort(400, message="'data_source_id' query parameter is required.")

        data_source = get_object_or_404(models.DataSource.get_by_id_and_org, data_source_id, self.current_org)

        queries = (
            models.Query.query.filter(
                models.Query.data_source_id == data_source.id,
                models.Query.is_archived == False,  # noqa: E712
                models.Query.is_draft == False,  # noqa: E712
            )
            .order_by(models.Query.name)
            .all()
        )

        return {
            "results": [
                {
                    "id": q.id,
                    "name": q.name,
                    "description": q.description,
                    "created_at": str(q.created_at),
                }
                for q in queries
            ],
            "count": len(queries),
        }


class ModelsResource(BaseResource):
    @require_permission("view_model")
    def get(self, model_id):
        model = get_object_or_404(Model.get_by_id, model_id)

        self.record_event({"action": "view", "object_id": model.id, "object_type": "model"})

        return ModelSerializer(model).serialize()

    @require_permission("edit_model")
    def post(self, model_id):
        model_properties = request.get_json(force=True)
        model = get_object_or_404(Model.get_by_id, model_id)
        require_object_modify_permission(model, self.current_user)

        updates = project(
            model_properties,
            ("name", "data_source_id", "table", "query_id"),
        )

        # Validate query_id if being updated
        if "query_id" in updates and updates["query_id"]:
            query_obj = models.Query.query.get(updates["query_id"])
            if not query_obj:
                abort(404, message="Query not found.")
            ds_id = updates.get("data_source_id", model.data_source_id)
            if query_obj.data_source_id != ds_id:
                abort(400, message="Query must use the same data source as the model.")

        self.update_model(model, updates)
        models.db.session.commit()

        content = ModelConfigGenerator.yaml(model=model, refresh=True)

        if model.config:
            self.update_model(model.config, {"content": content})
            models.db.session.commit()

        result = ModelSerializer(model).serialize()

        # Warn about downstream reports affected by this change
        if "query_id" in updates and model.reports:
            result["_warnings"] = [
                "{} report(s) use this model and may be affected by the query change.".format(len(model.reports))
            ]

        self.record_event({"action": "edit", "object_id": model.id, "object_type": "model"})

        return result

    def delete(self, model_id):
        model = get_object_or_404(Model.get_by_id, model_id)

        require_admin_or_owner(model.user_id)

        if model.config is not None:
            models.db.session.delete(model.config)
        for report in model.reports:
            models.db.session.delete(report)
        models.db.session.delete(model)
        models.db.session.commit()

        self.record_event(
            {
                "action": "delete",
                "object_id": model_id,
                "object_type": "model",
            }
        )

        return make_response("", 204)
