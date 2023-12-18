import { InputAttribute, OutputAttribute } from "../types/types";
import { AttributeParser } from "./AttributeParser";
import { BigQueryColumn, BigQueryExternal } from "reporter-plywood";


export class BigQueryParser extends AttributeParser {

    static engine = 'bigquery';

    protected _parseAttributes(attributes: InputAttribute[]): OutputAttribute[] {

        const columns: BigQueryColumn[] = attributes.map((attribute) => {
            const result: BigQueryColumn = { name: attribute.name, type: attribute.type };
            return result;
        });



        const newAttributes = BigQueryExternal.mapTypes(columns).map((atr, index) => {
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