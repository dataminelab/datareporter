
import { PostgresExternal, PostgresSQLDescribeRow } from "@dataminelab/datareporter-plywood";
import { InputAttribute, OutputAttribute } from "../types/types";
import { AttributeParser } from "./AttributeParser";



export class PostgresAttributeParser extends AttributeParser {

    static engine = 'postgres';

    protected _parseAttributes(attributes: InputAttribute[]): OutputAttribute[] {

        const columns: PostgresSQLDescribeRow[] = attributes.map((attribute) => {
            const result: PostgresSQLDescribeRow = { name: attribute.name, sqlType: attribute.type };
            if (result.sqlType === 'ARRAY') {
                // TO BE DONE, ALLOW SUPPORT FOR DIFFERENT ARRAY TYPES
                result.arrayType = 'character';
            }
            if (result.sqlType === 'NUMERIC' || result.sqlType === 'SMALLINT') {
                result.sqlType = 'INTEGER'
            }
            return result;
        });

        const newAttributes = PostgresExternal.postProcessIntrospect(columns).map(atr => {
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


