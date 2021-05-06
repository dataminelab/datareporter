import json

import lzstring

from redash.models.models import Report
from redash.serializers import Serializer
from redash.services.expression import ExpressionBase64Parser

parser = lzstring.LZString()


def _serialize_report(report: Report, formatting):
    # to have the same base64 as the one we had we need to remove spaces that json.dumps() adds

    if formatting == 'json':
        expression = report.expression
    else:
        expression = ExpressionBase64Parser.parse_dict_to_base64(report.expression)

    d = {
        "id": report.id,
        "name": report.name,
        "user_id": report.user_id,
        "model_id": report.model_id,
        "expression": expression,
        "created_at": report.created_at,
        "updated_at": report.updated_at,
    }

    return d


class ReportSerializer(Serializer):
    def __init__(self, object_or_list, formatting='base64', **kwargs):
        self.object_or_list = object_or_list
        self.formatting = formatting
        self.options = kwargs

    def serialize(self):
        if isinstance(self.object_or_list, Report):
            result = _serialize_report(self.object_or_list, self.formatting)
        else:
            result = [
                _serialize_report(query, self.formatting) for query in self.object_or_list
            ]

        return result
