import { InputAttribute, OutputAttribute } from "../types/types";
import { AttributeParser } from "./AttributeParser";
// @ts-ignore
import { DruidSQLDescribeRow, DruidSQLExternal } from "reporter-plywood";


export class DruidParse extends AttributeParser {

    static engine = 'druid';

    protected _parseAttributes(attributes: InputAttribute[]): OutputAttribute[] {
        const columns: DruidSQLDescribeRow[] = attributes.map(atr => ({
            COLUMN_NAME: atr.name,
            DATA_TYPE: atr.type
        }) as DruidSQLDescribeRow);

        return DruidSQLExternal.postProcessIntrospect(columns);
    }
}
