from flask_login import current_user, login_required
from redash import models
from redash.models.models import Model
from redash.models import Report
from redash.handlers import routes
from redash.handlers.base import json_response, org_scoped_rule
from redash.authentication import current_org


@routes.route(org_scoped_rule("/api/organization/status"), methods=["GET"])
@login_required
def organization_status(org_slug=None):
    counters = {
        "users": models.User.all(current_org).count(),
        "alerts": models.Alert.all(group_ids=current_user.group_ids).count(),
        "data_sources": models.DataSource.all(
            current_org, group_ids=current_user.group_ids
        ).count(),
        "models": Model.get_by_user(current_user).count(),
        "queries": models.Query.all_queries(
            current_user.group_ids, current_user.id, include_drafts=True
        ).count(),
        "reports": Report.get_by_user(current_user).count(),
        "dashboards": models.Dashboard.query.filter(
            models.Dashboard.org == current_org, models.Dashboard.is_archived is False
        ).count(),
    }

    return json_response(dict(object_counters=counters))
