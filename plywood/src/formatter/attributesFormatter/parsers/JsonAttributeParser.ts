import { AttributeParser } from "./AttributeParser";
import { InputAttribute, OutputAttribute } from "../types/types";

export class JsonAttributeParse extends AttributeParser {
  static engine = "json";
  static type = "DATASET";

  constructor(attributes: InputAttribute[]) {
    super(attributes);
  }

  protected _parseAttributes(attributes: InputAttribute[]): OutputAttribute[] {
    return attributes.map(attr => ({
      name: attr.name,
      type: this._mapJsonType(attr.type),
      nativeType: attr.type,
      isTimeColumn: this._mapJsonType(attr.type) === "TIME",
    })) as OutputAttribute[];
  }

  private _mapJsonType(jsonType: string): string {
    const typeMap: Record<string, string> = {
      STRING: "STRING",
      INTEGER: "NUMBER",
      FLOAT: "NUMBER",
      BOOLEAN: "BOOLEAN",
      DATETIME: "TIME",
    };

    return typeMap[jsonType?.toUpperCase()] || "STRING";
  }
}
