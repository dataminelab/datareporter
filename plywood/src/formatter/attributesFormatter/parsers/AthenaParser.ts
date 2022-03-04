import { InputAttribute, OutputAttribute } from "../types/types";
import { AttributeParser } from "./AttributeParser";
import { AthenaColumn, AwsAthenaExternal } from "datareporter-plywood";


export class AthenaParse extends AttributeParser {

  static engine = 'athena';

  protected _parseAttributes(attributes: InputAttribute[]): OutputAttribute[] {

    const columns: AthenaColumn[] = attributes.map((attribute) => {
      const result: AthenaColumn = { name: attribute.name, type: attribute.type };
      return result;
    });



    const newAttributes = AwsAthenaExternal.mapTypes(columns).map((atr, index) => {
      if (!atr) return;

      return {
        nativeType: atr.nativeType.toUpperCase(),
        name: atr.name,
        type: atr.type,
      }
    });

    return newAttributes.filter(Boolean);

  }
}