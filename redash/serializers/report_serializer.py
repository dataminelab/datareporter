from redash.models.models import Report
from redash.serializers import Serializer


def _serialize_report(report: Report):
    d = {
        "id": report.id,
        "name": report.name,
        "user_id": report.user_id,
        "model_id": report.model_id,
        "expression": report.expression,
        "created_at": report.created_at,
        "updated_at": report.updated_at,
    }

    return d


class ReportSerializer(Serializer):
    def __init__(self, object_or_list, **kwargs):
        self.object_or_list = object_or_list
        self.options = kwargs

    def serialize(self):
        if isinstance(self.object_or_list, Report):
            result = _serialize_report(self.object_or_list)
        else:
            result = [
                _serialize_report(query) for query in self.object_or_list
            ]

        return result
