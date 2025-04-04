from sqlalchemy.exc import IntegrityError

from redash import models
from redash.models import Report
from redash.handlers.base import BaseResource, get_object_or_404
from redash.permissions import require_access, view_only


class QueryFavoriteResource(BaseResource):
    def post(self, query_id):
        query = get_object_or_404(
            models.Query.get_by_id_and_org, query_id, self.current_org
        )
        require_access(query, self.current_user, view_only)

        fav = models.Favorite(
            org_id=self.current_org.id, object=query, user=self.current_user
        )
        models.db.session.add(fav)

        try:
            models.db.session.commit()
        except IntegrityError as err:
            if "unique_favorite" in str(err):
                models.db.session.rollback()
            else:
                raise err

        self.record_event(
            {"action": "favorite", "object_id": query.id, "object_type": "query"}
        )

    def delete(self, query_id):
        query = get_object_or_404(
            models.Query.get_by_id_and_org, query_id, self.current_org
        )
        require_access(query, self.current_user, view_only)

        models.Favorite.query.filter(
            models.Favorite.object_id == query_id,
            models.Favorite.object_type == "Query",
            models.Favorite.user == self.current_user,
        ).delete()
        models.db.session.commit()

        self.record_event(
            {"action": "favorite", "object_id": query.id, "object_type": "query"}
        )


class DashboardFavoriteResource(BaseResource):
    def post(self, object_id):
        dashboard = get_object_or_404(
            models.Dashboard.get_by_id_and_org, object_id, self.current_org
        )
        fav = models.Favorite(
            org_id=self.current_org.id, object=dashboard, user=self.current_user
        )
        models.db.session.add(fav)

        try:
            models.db.session.commit()
        except IntegrityError as err:
            if "unique_favorite" in str(err):
                models.db.session.rollback()
            else:
                raise err

        self.record_event(
            {
                "action": "favorite",
                "object_id": dashboard.id,
                "object_type": "dashboard",
            }
        )

    def delete(self, object_id):
        dashboard = get_object_or_404(
            models.Dashboard.get_by_id_and_org, object_id, self.current_org
        )
        models.Favorite.query.filter(
            models.Favorite.object == dashboard,
            models.Favorite.user == self.current_user,
        ).delete()
        models.db.session.commit()
        self.record_event(
            {
                "action": "unfavorite",
                "object_id": dashboard.id,
                "object_type": "dashboard",
            }
        )

class ReportFavoriteResource(BaseResource):
    def post(self, report_id: int):
        report = Report.get_by_id(report_id)
        fav = models.Favorite(
            org_id=self.current_org.id,
            object=report,
            user=self.current_user
        )
        models.db.session.add(fav)

        try:
            models.db.session.commit()
        except IntegrityError as err:
            if "unique_favorite" in str(err):
                models.db.session.rollback()
            else:
                raise err

        self.record_event(
            {"action": "favorite", "object_id": report.id, "object_type": "report"}
        )

    def delete(self, report_id: int):
        report = Report.get_by_id(report_id)
        models.Favorite.query.filter(
            models.Favorite.object == report,
            models.Favorite.user == self.current_user,
        ).delete()
        models.db.session.commit()
        self.record_event(
            {"action": "unfavorite", "object_id": report.id, "object_type": "report"}
        )