import json
import lzstring
from flask_restful import abort


class ExpressionBase64Parser(lzstring.LZString):

    @classmethod
    def parse_base64_to_dict(cls, expression: str) -> dict:
        try:
            expression_obj = json.loads(cls.decompressFromBase64(expression))
            return expression_obj
        except:
            abort(400, message='Error during reading expression string')

    @classmethod
    def parse_dict_to_base64(cls, expression: dict) -> str:
        expression = cls.compressToBase64(json.dumps(expression, separators=(',', ':')))
        return expression
