from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional

@dataclass
class AttributeInfo:
    name: str
    type: str  # PlyType
    native_type: Optional[str] = None
    maker: Optional[dict] = None

    @classmethod
    def from_js(cls, js: dict) -> AttributeInfo:
        return cls(
            name=js["name"],
            type=js.get("type", "STRING"),
            native_type=js.get("nativeType"),
            maker=js.get("maker"),
        )

    def to_js(self) -> dict:
        result = {"name": self.name, "type": self.type}
        if self.native_type:
            result["nativeType"] = self.native_type
        return result

    def drop_origin_info(self) -> AttributeInfo:
        return AttributeInfo(name=self.name, type=self.type)
