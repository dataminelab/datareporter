import json
from flask import request, make_response, url_for
from flask_restful import abort
from funcy import project
from sqlalchemy.orm.exc import NoResultFound
from redash.security import csp_allows_embeding
from redash.serializers.report_serializer import ReportSerializer
from redash import models
from redash.handlers.base import (
    BaseResource,
    require_fields,
    get_object_or_404,
    paginate
)

from redash.handlers.queries import order_results
from redash.models.models import Model, Report
from redash.permissions import (
    require_permission,
    require_admin_or_owner,
    require_object_modify_permission,
    require_object_delete_permission, require_object_view_permission
)
from redash.plywood.hash_manager import hash_report, hash_to_result, filter_expression_to_result
from redash.plywood.objects.expression import ExpressionNotSupported
from redash.serializers.report_serializer import ReportSerializer
from redash.services.expression import ExpressionBase64Parser
from redash.settings import REDASH_DEBUG
from redash.plywood.hash_manager import get_data_cube
HASH = "hash"
DATA_CUBE = "dataCube"
EXPRESSION = "expression"
CONTEXT = "context"
NAME = "name"
MODEL_ID = "model_id"
COLOR_1 = 'color_1'
COLOR_2 = 'color_2'
TAGS = 'tags'


class ReportFilter(BaseResource):
    @require_permission("view_report")
    def post(self, model_id: int):
        req = request.get_json(True)
        require_fields(req, (EXPRESSION,))
        model = get_object_or_404(Model.get_by_id, model_id)
        filtered_result = filter_expression_to_result(req[EXPRESSION], model, self.current_org)
        data_cube = get_data_cube(model)
        if filtered_result.data:
            filtered_result.meta = data_cube.get_meta(filtered_result.queries)
        return filtered_result.serialized()

class ReportGeneratePublicResource(BaseResource):
    def post(self, model_id):
        if not isinstance(self.current_user, models.ApiUser):
            abort(405)

        req = request.get_json(True)
        require_fields(req, (HASH,))
        hash_string = req[HASH]
        model = get_object_or_404(Model.get_by_id, model_id)
        try:
            result = hash_to_result(hash_string=hash_string, model=model, organisation=self.current_org, bypass_cache=False)
            return result.serialized()
        except ExpressionNotSupported as err:
            abort(400, message=err.message)

class ReportGenerateResource(BaseResource):
    def post(self, model_id):
        if not self.current_user.is_authenticated and not isinstance(self.current_user, models.ApiUser):
            abort(405)

        req = request.get_json(True)

        require_fields(req, (HASH,))
        hash_string = req[HASH]
        bypass_cache = req.get("bypass_cache", False)
        model = get_object_or_404(Model.get_by_id, model_id)
        try:
            result = hash_to_result(hash_string=hash_string, model=model, organisation=self.current_org, bypass_cache=bypass_cache)
            return result.serialized()
        except ExpressionNotSupported as err:
            if REDASH_DEBUG:
                abort(400, message=err.message)
            else:
                abort(400, message="An error occurred while generating the report. Please contact support.")


# /api/reports/archive
class ReportsArchiveResource(BaseResource):
    def get(self):
        search_term = request.args.get("q")
        archives = Report.get_my_archived_reports(search_term, self.current_user.id)
        page = request.args.get("page", 1, type=int)
        page_size = request.args.get("page_size", 25, type=int)
        response = paginate(archives, page, page_size, ReportSerializer)
        self.record_event(
            {
                "action": "load_archives",
                "object_type": "report",
                "params": {
                    "q": search_term,
                    "tags": request.args.getlist("tags"),
                    "page": page,
                },
            }
        )

        return response

    def delete(self):
        """ 
            Archives the report. 
        """
        report_id = request.args.get("id")
        if not report_id:
            abort(400, message="Missing report id")
        report_id = int(report_id)

        report = get_object_or_404(Report.get_by_id, report_id)

        require_object_delete_permission(report, self.current_user)

        report.archive()
        models.db.session.commit()

        self.record_event({
            "action": "archive",
            "object_id": report.id,
            "object_type": "report",
        })

        return make_response("", 204)

# /api/reports
class ReportsListResource(BaseResource):
    @require_permission("create_report")
    def post(self):
        req = request.get_json(True)
        require_fields(req, (NAME, MODEL_ID, EXPRESSION, COLOR_1, COLOR_2))

        formatting = request.args.get("format", "base64")
        name, model_id, expression = req[NAME], req[MODEL_ID], req[EXPRESSION]
        color_1, color_2 = req.get(COLOR_1, 'color'), req.get(COLOR_2, 'color')

        model = get_object_or_404(
            Model.get_by_id_and_user, model_id, self.current_user
        )

        expression_obj = ExpressionBase64Parser.parse_base64_to_dict(expression)

        report = Report(
            name=name,
            model_id=model.id,
            user=self.current_user,
            expression=expression_obj,
            color_1=color_1,
            color_2=color_2,
        )

        models.db.session.add(report)
        models.db.session.commit()

        self.record_event({
            "action": "create",
            "object_id": report.id,
            "object_type": "report",
        })

        return ReportSerializer(report, formatting=formatting).serialize()

    @require_permission("view_report")
    def get(self):
        _type = request.args.get("type", "all", type=str)
        search_query = request.args.get("q", "", type=str)
        reports = []
        if _type == "my":
            reports = Report.get_by_user(
                self.current_user
            ).filter(
                Report.is_archived.is_(False)
            )
        elif _type == "all":
            reports = Report.get_by_group_ids(self.current_user)
        if search_query:
            reports = reports.filter(Report.name.ilike(f"%{search_query}%"))

        formatting = request.args.get("format", "base64")
        ordered_results = order_results(reports)

        page = request.args.get("page", 1, type=int)
        page_size = request.args.get("page_size", 25, type=int)

        response = paginate(
            ordered_results,
            page=page,
            page_size=page_size,
            serializer=ReportSerializer,
            formatting=formatting
        )

        self.record_event({
            "action": "list",
            "object_type": "report"
        })
        return response

    def delete(self, report_id):
        """ 
            Archives given report. 
        """
        report = get_object_or_404(Report.get_by_id, report_id)

        require_object_delete_permission(report, self.current_user)
        report.archive()

        self.record_event({
            "action": "archive",
            "object_id": report.id,
            "object_type": "report",
        })

        return make_response("", 204)

# /api/reports/<int:report_id>
class ReportResource(BaseResource):
    ''' A resource for a single report creation, editing and deleting '''

    @require_permission("view_report")
    def get(self, report_id: int):
        report: Report = get_object_or_404(Report.get_by_id, report_id)
        require_object_view_permission(report, self.current_user)

        self.record_event({
            "action": "view",
            "object_id": report.id,
            "object_type": "report"
        })
        report_user_email = report.user.email if report.user else None
        current_user = self.current_user.email
        if report_user_email != current_user:
            self.record_event({
                "action": "view",
                "object_id": report.id,
                "object_type": "report",
                "message": "Report viewed by another user"
            })
            can_edit = False
        else:
            can_edit = True
        return hash_report(report, can_edit=can_edit)

    @require_permission("edit_report")
    def post(self, report_id: int):
        report_properties = request.get_json(force=True)
        updates = project(report_properties, (NAME, MODEL_ID, EXPRESSION, COLOR_1, COLOR_2, TAGS))
        report = get_object_or_404(Report.get_by_id, report_id)
        require_object_modify_permission(report, self.current_user)
        
        counter = 0
        for key, value in updates.items():
            if key == "expression" and isinstance(value, dict):
                counter+=1
            elif value == report.__getattribute__(key):
                counter+=1
        if counter == len(updates):
            return make_response(json.dumps({"message": "No changes made"}), 204)

        if MODEL_ID in updates:
            try:
                model = Model.get_by_id(updates[MODEL_ID])
                if not any(id in model.user.group_ids for id in self.current_user.group_ids):
                    abort(403)
            except NoResultFound:
                abort(400, message=f"The Model with id {MODEL_ID} does not exists")

        if EXPRESSION in updates:
            # decodes base64 that turnillo uses to plain json
            updates[EXPRESSION] = ExpressionBase64Parser.parse_base64_to_dict(updates[EXPRESSION])

        self.update_model(report, updates)

        models.db.session.commit()

        self.record_event({
            "action": "edit",
            "object_id": report.id,
            "object_type": "report"
        })
        
        formatting = request.args.get("format", "base64")
        return ReportSerializer(report, formatting=formatting).serialize()

    @require_permission("edit_report")
    def delete(self, report_id):
        report = get_object_or_404(Report.get_by_id, report_id)

        require_object_delete_permission(report, self.current_user)
        report.remove()

        self.record_event({
            "action": "delete",
            "object_id": report.id,
            "object_type": "report",
        })

        return make_response("", 204)

class ReportTagsResource(BaseResource):
    def get(self):
        """
        Returns all query tags including those for drafts.
        """
        tags = Report.all_tags(self.current_user, include_drafts=True)
        return {"tags": [{"name": name, "count": count} for name, count in tags]}

class ReportFavoriteListResource(BaseResource):
    def get(self):
        search_term = request.args.get("q")

        if search_term:
            base_query = Report.search(
                self.current_org,
                self.current_user.group_ids,
                self.current_user.id,
                search_term,
            )
            favorites = Report.favorites(
                self.current_user, base_query=base_query
            )
        else:
            favorites = Report.favorites(self.current_user)

        # favorites = filter_by_tags(favorites, Report.tags)

        # order results according to passed order parameter,
        # special-casing search queries where the database
        # provides an order by search rank
        favorites = order_results(favorites, fallback=not bool(search_term))

        page = request.args.get("page", 1, type=int)
        page_size = request.args.get("page_size", 25, type=int)
        response = paginate(favorites, page, page_size, ReportSerializer)
        self.record_event(
            {
                "action": "load_favorites",
                "object_type": "report",
                "params": {
                    "q": search_term,
                    "tags": request.args.getlist("tags"),
                    "page": page,
                },
            }
        )

        return response

class PublicReportResource(BaseResource):
    decorators = BaseResource.decorators + [csp_allows_embeding]

    def get(self, token):
        """
        Retrieve a public dashboard.

        :param token: An API key for a public dashboard.
        """
        if not isinstance(self.current_user, models.ApiUser):
            api_key = get_object_or_404(models.ApiKey.get_by_api_key, token)
            report = api_key.object
        else:
            report_id = request.args.get("report_id", None)
            if not report_id or report_id == "null":
                report_id = self.current_user.object
            report = get_object_or_404(Report.get_by_id, report_id)
        return hash_report(report, can_edit=False)


class ReportShareResource(BaseResource):
    def post(self, report_id):
        """
        Allow anonymous access to a report.

        :param report_id: The numeric ID of the report to share.
        :>json string public_url: The URL for anonymous access to the report.
        :>json api_key: The API key to use when accessing it.
        """
        report: Report = get_object_or_404(Report.get_by_id, report_id)
        require_admin_or_owner(report.user_id)
        api_key = models.ApiKey.create_for_object(report, self.current_user)
        models.db.session.flush()
        models.db.session.commit()

        public_url = url_for(
            "redash.public_report",
            token=api_key.api_key,
            org_slug=self.current_org.slug,
            _external=True
        )

        self.record_event(
            {
                "action": "activate_api_key",
                "object_id": report.id,
                "object_type": "report",
            }
        )

        return {"public_url": public_url, "api_key": api_key.api_key}

    def delete(self, report_id):
        # XXX TODO IT'S A COPY OF DASHBOARD SHARE
        """
        Disable anonymous access to a report.

        :param report_id: The numeric ID of the report to unshare.
        """
        report: Report = get_object_or_404(Report.get_by_id, report_id)
        require_admin_or_owner(report.user_id)
        api_key = models.ApiKey.get_by_object(report)

        if api_key:
            api_key.active = False
            models.db.session.add(api_key)
            models.db.session.commit()

        self.record_event(
            {
                "action": "deactivate_api_key",
                "object_id": report.id,
                "object_type": "report",
            }
        )
