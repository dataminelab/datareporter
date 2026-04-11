import json
from datetime import datetime

from flask import make_response, request, url_for
from flask_restful import abort
from funcy import project
from sqlalchemy.orm.exc import NoResultFound

from redash import models
from redash.handlers.base import (
    BaseResource,
    get_object_or_404,
    paginate,
    require_fields,
)
from redash.handlers.queries import order_results
from redash.models import QueryResult, Report
from redash.models.models import Model
from redash.permissions import (
    require_admin_or_owner,
    require_object_delete_permission,
    require_object_modify_permission,
    require_object_view_permission,
    require_permission,
)
from redash.plywood.hash_manager import (
    filter_expression_to_result,
    get_data_cube,
    hash_report,
    hash_to_result,
)
from redash.plywood.objects.expression import ExpressionNotSupported
from redash.security import csp_allows_embeding
from redash.serializers.report_result import (
    serialize_query_result_to_xlsx_with_multiple_sheets,
    serialize_report_result_to_dsv,
)
from redash.serializers.report_serializer import ReportSerializer
from redash.services.expression import ExpressionBase64Parser
from redash.settings import parse_boolean
from redash.utils import json_dumps

HASH = "hash"
DATA_CUBE = "dataCube"
EXPRESSION = "expression"
CONTEXT = "context"
NAME = "name"
MODEL_ID = "model_id"
COLOR_1 = "color_1"
COLOR_2 = "color_2"
TAGS = "tags"
DATA_SOURCE_ID = "data_source_id"
SCHEDULE = "schedule"
IS_DRAFT = "is_draft"


# Custom JSON encoder to handle datetime objects
class CustomJSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, datetime):
            return o.isoformat()  # Convert datetime to ISO 8601 string
        return super().default(o)


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


class ReportRecentResource(BaseResource):
    @require_permission("view_report")
    def get(self):
        """
        Retrieve up to 10 reports recently modified by the user.

        Responds with a list of report objects.
        """
        recent_reports = Report.get_by_user(self.current_user).order_by(Report.updated_at.desc()).limit(10)
        return ReportSerializer(recent_reports).serialize()


class ReportGeneratePublicResource(BaseResource):
    decorators = [csp_allows_embeding]

    def post(self, model_id):
        if not self.current_user or (
            not self.current_user.is_authenticated and not isinstance(self.current_user, models.ApiUser)
        ):
            abort(405)

        req = request.get_json(True)

        require_fields(req, (HASH,))
        hash_string = req[HASH]
        bypass_cache = False
        model = get_object_or_404(Model.get_by_id, model_id)
        try:
            result = hash_to_result(hash_string, model, self.current_org, bypass_cache)
            return result.serialized()
        except ExpressionNotSupported as err:
            abort(400, message=err.message)


class ReportApiKeyAccess(BaseResource):
    decorators = []

    def get(self, report_id: int, filetype: str = "json"):
        api_key = request.args.get("api_key")
        if not api_key:
            abort(400, message="Missing api key")
        report = get_object_or_404(Report.get_by_id, report_id)
        if api_key != report.api_key:
            abort(403, message="Invalid api key")
        model = get_object_or_404(Model.get_by_id, report.model_id)

        execute_plywood = hash_to_result(hash_string=report.hash, model=model, organisation=self.current_org)
        serialized = execute_plywood.serialized()
        response_builders = {
            "json": self.make_json_response,
            "xlsx": self.make_excel_response,
            "csv": self.make_csv_response,
            "tsv": self.make_tsv_response,
        }
        query_results = []
        for query_result in serialized["queries"]:
            if "query_result" not in query_result:
                continue
            query_result = QueryResult.get_by_id(query_result["query_result"]["id"])
            query_results.append(query_result)
        if not query_results:
            abort(404, message="No query results found")
        return response_builders[filetype](query_results)

    @staticmethod
    def make_json_response(query_results):
        merged_rows = []
        all_columns = []

        # Merge results into a single list of rows, matching on common columns
        for query in query_results:
            query_data = query.data
            # Track all columns seen across all queries
            for col in query_data.get("columns", []):
                if col not in all_columns:
                    all_columns.append(col)

            for row in query_data.get("rows", []):
                found = False
                for existing_row in merged_rows:
                    common_keys = set(row.keys()) & set(existing_row.keys())
                    if common_keys and all(row[k] == existing_row[k] for k in common_keys):
                        existing_row.update(row)
                        found = True
                        break
                if not found:
                    merged_rows.append(dict(row))

        data = json_dumps({"columns": all_columns, "rows": merged_rows})
        headers = {"Content-Type": "application/json"}
        return make_response(data, 200, headers)

    @staticmethod
    def make_csv_response(query_results):
        results = []
        for query in query_results:
            results.append(query.to_dict())
        headers = {"Content-Type": "text/csv; charset=UTF-8"}
        return make_response(serialize_report_result_to_dsv(query_results, ","), 200, headers)

    @staticmethod
    def make_tsv_response(query_result):
        headers = {"Content-Type": "text/tab-separated-values; charset=UTF-8"}
        return make_response(serialize_report_result_to_dsv(query_result, "\t"), 200, headers)

    @staticmethod
    def make_excel_response(query_result):
        headers = {"Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}
        return make_response(serialize_query_result_to_xlsx_with_multiple_sheets(query_result), 200, headers)


# /api/reports/generate/<int:model_id>
class ReportGenerateResource(BaseResource):
    def post(self, model_id):
        if not self.current_user or (
            not self.current_user.is_authenticated and not isinstance(self.current_user, models.ApiUser)
        ):
            abort(405)

        req = request.get_json(True)

        require_fields(req, (HASH,))
        hash_string = req[HASH]
        bypass_cache = req.get("bypass_cache", False)
        model = get_object_or_404(Model.get_by_id, model_id)
        try:
            result = hash_to_result(hash_string, model, self.current_org, bypass_cache)
            return result.serialized()
        except ExpressionNotSupported as err:
            abort(400, message=err.message)


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

        self.record_event(
            {
                "action": "archive",
                "object_id": report.id,
                "object_type": "report",
            }
        )

        return make_response("", 204)


# /api/reports
class ReportsListResource(BaseResource):
    """
    List all reports or create a new report
    """

    @require_permission("create_report")
    def post(self):
        req = request.get_json(True)
        require_fields(req, (NAME, MODEL_ID, EXPRESSION, COLOR_1, COLOR_2, DATA_SOURCE_ID))

        name, model_id, expression, color_1, color_2, data_source_id = (
            req[NAME],
            req[MODEL_ID],
            req[EXPRESSION],
            req[COLOR_1],
            req[COLOR_2],
            req[DATA_SOURCE_ID],
        )
        is_archived = req.get("is_archived", False)
        is_draft = req.get(IS_DRAFT, True)
        formatting = request.args.get("format", "base64")
        model = get_object_or_404(Model.get_by_id, model_id)

        expression_obj = ExpressionBase64Parser.parse_base64_to_dict(expression)

        report = Report(
            name=name,
            model_id=model.id,
            user=self.current_user,
            expression=expression_obj,
            color_1=color_1,
            color_2=color_2,
            data_source_id=data_source_id,
            last_modified_by=self.current_user,
            is_archived=is_archived,
            is_draft=is_draft,
        )

        models.db.session.add(report)
        models.db.session.commit()

        self.record_event(
            {
                "action": "create",
                "object_id": report.id,
                "object_type": "report",
            }
        )

        return ReportSerializer(report, formatting).serialize()

    @require_permission("view_report")
    def get(self):
        _type = request.args.get("type", "all", type=str)
        search_query = request.args.get("q", "", type=str)
        reports = []
        if _type == "my":
            reports = Report.get_by_user(self.current_user).filter(Report.is_archived.is_(False))
        elif _type == "all":
            reports = Report.get_by_group_ids(self.current_user)
        if search_query:
            reports = reports.filter(Report.name.ilike(f"%{search_query}%"))

        formatting = request.args.get("format", "base64")
        ordered_results = order_results(reports)

        page = request.args.get("page", 1, type=int)
        page_size = request.args.get("page_size", 25, type=int)

        response = paginate(ordered_results, page, page_size, ReportSerializer, formatting=formatting)

        self.record_event({"action": "list", "object_type": "report"})
        return response

    def delete(self, report_id):
        """
        Archives given report.
        """
        report = get_object_or_404(Report.get_by_id, report_id)

        require_object_delete_permission(report, self.current_user)
        report.archive()

        self.record_event(
            {
                "action": "archive",
                "object_id": report.id,
                "object_type": "report",
            }
        )

        return make_response("", 204)


# /api/reports/<int:report_id>
class ReportResource(BaseResource):
    """A resource for a single report viewing, creating, editing and deleting"""

    @require_permission("view_report")
    def get(self, report_id: int):
        report: Report = get_object_or_404(Report.get_by_id, report_id)
        require_object_view_permission(report, self.current_user)

        self.record_event({"action": "view", "object_id": report.id, "object_type": "report"})
        report_user_email = report.user.email if report.user else None
        current_user = self.current_user.email
        if report_user_email != current_user:
            self.record_event(
                {
                    "action": "view",
                    "object_id": report.id,
                    "object_type": "report",
                    "message": f"Report viewed by {current_user}",
                }
            )
        if report_user_email != current_user:
            can_edit = False
        else:
            can_edit = True
        get_results = parse_boolean(request.args.get("get_results", "False"))
        return hash_report(report, can_edit, get_results)

    @require_permission("edit_report")
    def post(self, report_id: int):
        """
        Modify a report

        - param `report_id (int)`: ID of report to update
        - json `string` name:
        - json `number` data_source_id: The ID of the data source this report will run on
        - json `string` expression: hash of the report expression, encoded in base64
        - json `string` color_1: Hex code of the first color used in the report visualizations
        - json `string` color_2: Hex code of the second color used in the report visualizations
        - json `array` tags: List of tags associated with the report
        - json `string` schedule: Schedule interval, in seconds, for repeated execution of this report

        Responds with the updated :ref:`report <report-response-label>` object.
        """
        report_properties = request.get_json(force=True)
        updates = project(
            report_properties, (NAME, MODEL_ID, EXPRESSION, COLOR_1, COLOR_2, TAGS, SCHEDULE, DATA_SOURCE_ID, IS_DRAFT)
        )
        report: Report = get_object_or_404(Report.get_by_id, report_id)
        require_object_modify_permission(report, self.current_user)

        counter = 0
        for key, value in updates.items():
            if key == "expression" and isinstance(value, dict):
                counter += 1
            elif value == report.__getattribute__(key):
                counter += 1
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

        report.last_modified_by = self.current_user
        self.update_model(report, updates)

        models.db.session.commit()

        self.record_event({"action": "edit", "object_id": report.id, "object_type": "report"})

        formatting = request.args.get("format", "base64")
        return ReportSerializer(report, formatting).serialize()

    @require_permission("edit_report")
    def delete(self, report_id):
        report = get_object_or_404(Report.get_by_id, report_id)

        require_object_delete_permission(report, self.current_user)
        report.remove()
        # also delete as a cascade the widgets
        models.Widget.delete_by_report_id(report_id)

        self.record_event(
            {
                "action": "delete",
                "object_id": report.id,
                "object_type": "report",
            }
        )

        return make_response("", 204)


class ReportForkResource(BaseResource):
    @require_permission("edit_report")
    def post(self, report_id):
        report = get_object_or_404(Report.get_by_id_and_org, report_id, self.current_org)
        require_object_view_permission(report, self.current_user)

        forked_report = report.fork(self.current_user)
        models.db.session.commit()

        self.record_event({"action": "fork", "object_id": report_id, "object_type": "report"})

        return ReportSerializer(forked_report).serialize()


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
            favorites = Report.favorites(self.current_user, base_query=base_query)
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
    decorators = [csp_allows_embeding]

    def get(self, token):
        """
        Retrieve a public dashboard.

        :param token: An API key for a public dashboard.
        """
        if self.current_org.get_setting("disable_public_urls"):
            abort(400, message="Public URLs are disabled.")

        if not isinstance(self.current_user, models.ApiUser):
            api_key = get_object_or_404(models.ApiKey.get_by_api_key, token)
            report = api_key.object
        else:
            report = self.current_user.object
        get_results = parse_boolean(request.args.get("get_results", "False"))
        can_edit = False
        return hash_report(report, can_edit, get_results)


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
        report.set_api_key(api_key.api_key)
        models.db.session.flush()
        models.db.session.commit()

        public_url = url_for(
            "redash.public_report", token=api_key.api_key, org_slug=self.current_org.slug, _external=True
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
