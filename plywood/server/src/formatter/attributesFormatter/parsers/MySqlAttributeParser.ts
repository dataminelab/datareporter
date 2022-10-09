import { MySQLDescribeRow, MySQLExternal } from "@dataminelab/datareporter-plywood";
import { InputAttribute, OutputAttribute } from "../types/types";
import { AttributeParser } from "./AttributeParser";

export class MySqlAttributeParser extends AttributeParser {

    static engine = 'mysql';

    protected _parseAttributes(attributes: InputAttribute[]): OutputAttribute[] {


        const columns: MySQLDescribeRow[] = attributes.map((attribute) => {
            const result: MySQLDescribeRow = { Field: attribute.name, Type: attribute.type };
            return result;
        });
        const newAttributes = MySQLExternal.postProcessIntrospect(columns).map(atr => {
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
