from flask import request

from redash.handlers.base import BaseResource, get_object_or_404
from redash.models.models import DataSource
from redash.permissions import require_access, view_only
from redash.query_runner import NotSupported
from redash.serializers.data_source_serializer import TableSerializer


class DataSourceTablesResource(BaseResource):
    def get(self, data_source_id):
        refresh = request.args.get("refresh") is not None

        data_source: DataSource = get_object_or_404(DataSource.get_by_id_and_org, data_source_id, self.current_org)

        require_access(data_source, self.current_user, view_only)
        try:
            schema = data_source.get_schema(refresh=refresh)
            return TableSerializer(schema).serialize()
        except NotSupported:
            return {"message": "Data source does not support schema generation."}, 400
        except Exception:
            return {"message": "Data source is corrupted, change settings."}, 400
