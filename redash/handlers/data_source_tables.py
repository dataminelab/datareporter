from flask import request

from redash.handlers.base import BaseResource, get_object_or_404
from redash.models import models
from redash.permissions import require_access, view_only
from redash.serializers.data_source_serializer import TableSerializer


class DataSourceTablesResource(BaseResource):
    def get(self, data_source_id):
        refresh = request.args.get("refresh") is not None

        data_source = get_object_or_404(
            models.DataSource.get_by_id_and_org, data_source_id, self.current_org
        )

        require_access(data_source, self.current_user, view_only)

        schema = data_source.get_schema(refresh=refresh)

        return TableSerializer(schema).serialize()
