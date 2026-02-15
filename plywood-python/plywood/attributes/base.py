from __future__ import annotations
from typing import List
from ..datatypes.common import valid_type

class AttributeParser:
    def __init__(self, attributes: list):
        self.attributes = attributes

    def parse_attributes(self) -> list:
        parsed = self._parse_attributes(self.attributes)
        updated = self._fit_new_attributes(parsed)
        cleaned = self._mark_unsupported(updated)
        return cleaned

    def _parse_attributes(self, attributes: list) -> list:
        raise NotImplementedError

    def _mark_unsupported(self, attributes: list) -> list:
        result = []
        for attr in attributes:
            if "isSupported" not in attr or attr["isSupported"] is None:
                attr = {**attr, "isSupported": valid_type(attr.get("type", ""))}
            result.append(attr)
        return result

    def _fit_new_attributes(self, new_attrs: list) -> list:
        result = []
        new_by_name = {a["name"]: a for a in new_attrs}
        for attr in self.attributes:
            name = attr["name"] if isinstance(attr, dict) else attr.get("name", "")
            if name in new_by_name:
                result.append(new_by_name[name])
            else:
                a = dict(attr) if isinstance(attr, dict) else {"name": name, "type": attr.get("type", "")}
                a["nativeType"] = a.get("type", "")
                result.append(a)
        return result
