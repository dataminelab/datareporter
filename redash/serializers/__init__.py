"""
This will eventually replace all the `to_dict` methods of the different model
classes we have. This will ensure cleaner code and better
separation of concerns.
"""

from flask_login import current_user
from funcy import project
from rq.job import JobStatus
from rq.timeouts import JobTimeoutException

from redash import models
from redash.models.parameterized_query import ParameterizedQuery
from redash.permissions import has_access, view_only
from redash.plywood.objects.data_cube import DataCube
from redash.serializers.query_result import (
    serialize_query_result,
    serialize_query_result_to_dsv,
    serialize_query_result_to_xlsx,
)
from redash.utils import json_loads
from redash.services.expression import ExpressionBase64Parser
from flask import url_for


def is_admin(user):
    if "admin" in user.permissions or "super_admin" in user.permissions or "edit_report" in user.permissions:
        return True
    return False


def get_data_cube(model):
    data_cube = DataCube(model=model)
    return data_cube


def hash_report(report, can_edit=False):
    # carry this into serializers folder and name it into serialize_report
    data_cube = get_data_cube(report.model)
    is_favorite = report.is_favorite_v2(report.user, report)
    api_key = models.ApiKey.get_by_object(report)
    public_url = None
    if api_key:
        public_url = url_for(
            "redash.public_report",
            token=api_key.api_key,
            _external=True,
        )
        api_key = api_key.api_key
    result = {
        "color_1": report.color_1,
        "color_2": report.color_2,
        "hash": report.hash,
        "name": report.name,
        "model_id": report.model_id,
        "can_edit": can_edit,
        "source_name": data_cube.source_name,
        "data_source_id": report.model.data_source.id,
        "report": "",
        "schedule": None,
        "tags": report.tags,
        "user": {
            "id": report.user.id,
            "name": report.user.name,
            "profile_image_url": report.user.profile_image_url,
            "permissions": report.user.permissions,
            "isAdmin": is_admin(report.user),
        },
        "is_favorite": is_favorite,
        "is_archived": report.is_archived,
        "isJustLanded": True,
        "appSettings": {
            "dataCubes": [data_cube.data_cube],
            "customization": {},
            "clusters": [],
        },
        "id": report.id,
        "api_key": api_key,
        "public_url": public_url,
    }
    with_last_modified_by = True
    if with_last_modified_by:
        result["last_modified_by"] = report.last_modified_by.to_dict() if report.last_modified_by is not None else None
    else:
        result["last_modified_by_id"] = report.last_modified_by_id

    return result

def public_widget(widget):
    res = {
        "id": widget.id,
        "width": widget.width,
        "options": widget.options,
        "text": widget.text,
        "updated_at": widget.updated_at,
        "created_at": widget.created_at,
    }

    v = widget.visualization
    if v and v.id:
        res["visualization"] = {
            "type": v.type,
            "name": v.name,
            "description": v.description,
            "options": v.options,
            "updated_at": v.updated_at,
            "created_at": v.created_at,
            "query": {
                "id": v.query_rel.id,
                "name": v.query_rel.name,
                "description": v.query_rel.description,
                "options": v.query_rel.options,
            },
        }

    return res


def public_dashboard(dashboard):
    dashboard_dict = project(
        serialize_dashboard(dashboard, with_favorite_state=False, with_widgets=True, is_public=True),
        ("name", "layout", "dashboard_filters_enabled", "updated_at", "created_at", "options", "widgets"),
    )

    widget_list = (
        models.Widget.query.filter(models.Widget.dashboard_id == dashboard.id)
        .outerjoin(models.Visualization)
        .outerjoin(models.Query)
    )

    dashboard_dict["widgets"] = [public_widget(w) for w in widget_list]
    return dashboard_dict


class Serializer:
    pass


class QuerySerializer(Serializer):
    def __init__(self, object_or_list, **kwargs):
        self.object_or_list = object_or_list
        self.options = kwargs

    def serialize(self):
        if isinstance(self.object_or_list, models.Query):
            result = serialize_query(self.object_or_list, **self.options)
            if self.options.get("with_favorite_state", True) and not current_user.is_api_user():
                result["is_favorite"] = models.Favorite.is_favorite(current_user.id, self.object_or_list)
        else:
            result = [serialize_query(query, **self.options) for query in self.object_or_list]
            if self.options.get("with_favorite_state", True):
                favorite_ids = models.Favorite.are_favorites(current_user.id, self.object_or_list)
                for query in result:
                    query["is_favorite"] = query["id"] in favorite_ids

        return result


def serialize_query(
    query,
    with_stats=False,
    with_visualizations=False,
    with_user=True,
    with_last_modified_by=True,
):
    d = {
        "id": query.id,
        "latest_query_data_id": query.latest_query_data_id,
        "name": query.name,
        "description": query.description,
        "query": query.query_text,
        "query_hash": query.query_hash,
        "schedule": query.schedule,
        "api_key": query.api_key,
        "is_archived": query.is_archived,
        "is_draft": query.is_draft,
        "updated_at": query.updated_at,
        "created_at": query.created_at,
        "data_source_id": query.data_source_id,
        "options": query.options,
        "version": query.version,
        "tags": query.tags or [],
        "is_safe": query.parameterized.is_safe,
    }

    if with_user:
        d["user"] = query.user.to_dict()
    else:
        d["user_id"] = query.user_id

    if with_last_modified_by:
        d["last_modified_by"] = query.last_modified_by.to_dict() if query.last_modified_by is not None else None
    else:
        d["last_modified_by_id"] = query.last_modified_by_id

    if with_stats:
        if query.latest_query_data is not None:
            d["retrieved_at"] = query.retrieved_at
            d["runtime"] = query.runtime
        else:
            d["retrieved_at"] = None
            d["runtime"] = None

    if with_visualizations:
        d["visualizations"] = [serialize_visualization(vis, with_query=False) for vis in query.visualizations]

    return d


def serialize_visualization(object, with_query=True):
    d = {
        "id": object.id,
        "type": object.type,
        "name": object.name,
        "description": object.description,
        "options": object.options,
        "updated_at": object.updated_at,
        "created_at": object.created_at,
    }

    if with_query:
        d["query"] = serialize_query(object.query_rel)

    return d


def serialize_widget(object: models.Widget, is_public=False):
    d = {
        "id": object.id,
        "width": object.width,
        "options": object.options,
        "dashboard_id": object.dashboard_id,
        "text": object.text,
        "updated_at": object.updated_at,
        "created_at": object.created_at,
        "report_id": object.get_report_id(),
        "report": object.get_report(),
        "is_public": is_public,
    }

    if d["report"]:
        d["options"]["widget_type"] = "report"
        d["report"] = hash_report(d["report"])
    else:
        d["options"]["widget_type"] = "query"

    if object.visualization and object.visualization.id:
        d["visualization"] = serialize_visualization(object.visualization)

    return d


def serialize_alert(alert, full=True):
    d = {
        "id": alert.id,
        "name": alert.name,
        "options": alert.options,
        "state": alert.state,
        "last_triggered_at": alert.last_triggered_at,
        "updated_at": alert.updated_at,
        "created_at": alert.created_at,
        "rearm": alert.rearm,
    }

    if full:
        d["query"] = serialize_query(alert.query_rel)
        d["user"] = alert.user.to_dict()
    else:
        d["query_id"] = alert.query_id
        d["user_id"] = alert.user_id

    return d


def serialize_dashboard(obj, with_widgets=False, user=None, with_favorite_state=True, public=False, is_public=False):
    layout = obj.layout

    widgets = []
    # if public, gotta use public_widget function for widgets
    if with_widgets:
        for w in obj.widgets:
            if w.visualization_id is None:
                widgets.append(serialize_widget(w, is_public))
            elif user and has_access(w.visualization.query_rel, user, view_only):
                widgets.append(serialize_widget(w, is_public))
            else:
                widget = project(
                    serialize_widget(w, is_public),
                    (
                        "id",
                        "width",
                        "dashboard_id",
                        "options",
                        "created_at",
                        "updated_at",
                    ),
                )
                widget["restricted"] = True
                widgets.append(widget)
    else:
        widgets = None

    d = {
        "id": obj.id,
        "slug": obj.name_as_slug,
        "name": obj.name,
        "user_id": obj.user_id,
        "user": {
            "id": obj.user.id,
            "name": obj.user.name,
            "email": obj.user.email,
            "profile_image_url": obj.user.profile_image_url,
            "permissions": obj.user.permissions,
            "created_at": obj.user.created_at,
            "updated_at": obj.user.updated_at,
            "is_disabled": obj.user.is_disabled,
        },
        "layout": layout,
        "dashboard_filters_enabled": obj.dashboard_filters_enabled,
        "widgets": widgets,
        "options": obj.options,
        "is_archived": obj.is_archived,
        "is_draft": obj.is_draft,
        "tags": obj.tags or [],
        "updated_at": obj.updated_at,
        "created_at": obj.created_at,
        "version": obj.version,
    }

    return d


class DashboardSerializer(Serializer):
    def __init__(self, object_or_list, **kwargs):
        self.object_or_list = object_or_list
        self.options = kwargs

    def serialize(self):
        if isinstance(self.object_or_list, models.Dashboard):
            result = serialize_dashboard(self.object_or_list, **self.options)
            if self.options.get("with_favorite_state", True) and not current_user.is_api_user():
                result["is_favorite"] = models.Favorite.is_favorite(current_user.id, self.object_or_list)
        else:
            result = [serialize_dashboard(obj, **self.options) for obj in self.object_or_list]
            if self.options.get("with_favorite_state", True):
                favorite_ids = models.Favorite.are_favorites(current_user.id, self.object_or_list)
                for obj in result:
                    obj["is_favorite"] = obj["id"] in favorite_ids

        return result


def serialize_job(job):
    # TODO: this is mapping to the old Job class statuses. Need to update the client side and remove this
    STATUSES = {
        JobStatus.QUEUED: 1,
        JobStatus.STARTED: 2,
        JobStatus.FINISHED: 3,
        JobStatus.FAILED: 4,
        JobStatus.CANCELED: 4,
    }

    job_status = job.get_status()
    if job.is_started:
        updated_at = job.started_at or 0
    else:
        updated_at = 0

    status = STATUSES[job_status]
    result = query_result_id = None

    if job.is_cancelled:
        error = "Query cancelled by user."
        status = 4
    elif isinstance(job.result, Exception):
        error = str(job.result)
        status = 4
    elif isinstance(job.result, dict) and "error" in job.result:
        error = job.result["error"]
        status = 4
    else:
        error = ""
        result = query_result_id = job.result

    return {
        "job": {
            "id": job.id,
            "updated_at": updated_at,
            "status": status,
            "error": error,
            "result": result,
            "query_result_id": query_result_id,
        }
    }
