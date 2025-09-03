from flask_login import current_user, login_required

from redash.authentication import current_org
from redash.handlers import routes
from redash.handlers.base import json_response, org_scoped_rule
from redash.models import Alert, Dashboard, DataSource, Query, Report, User
from redash.models.models import Model


@routes.route(org_scoped_rule("/api/organization/status"), methods=["GET"])
@login_required
def organization_status(org_slug=None):
    counters = {
        "users": User.all(current_org).count(),
        "alerts": Alert.all(group_ids=current_user.group_ids).count(),
        "data_sources": DataSource.all(current_org, group_ids=current_user.group_ids).count(),
        "models": Model.get_by_user(current_user).count(),
        "queries": Query.all_queries(current_user.group_ids, current_user.id, include_drafts=True).count(),
        "reports": Report.get_by_user(current_user).count(),
        "dashboards": Dashboard.query.filter(
            Dashboard.org == current_org, Dashboard.user_id == current_user.id
        ).count(),
    }

    return json_response(dict(object_counters=counters))
