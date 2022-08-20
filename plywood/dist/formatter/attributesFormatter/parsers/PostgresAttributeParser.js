"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresAttributeParser = void 0;
const datareporter_plywood_1 = require("datareporter-plywood");
const AttributeParser_1 = require("./AttributeParser");
class PostgresAttributeParser extends AttributeParser_1.AttributeParser {
    _parseAttributes(attributes) {
        const columns = attributes.map((attribute) => {
            const result = { name: attribute.name, sqlType: attribute.type };
            if (result.sqlType === 'ARRAY') {
                // TO BE DONE, ALLOW SUPPORT FOR DIFFERENT ARRAY TYPES
                result.arrayType = 'character';
            }
            if (result.sqlType === 'NUMERIC' || result.sqlType === 'SMALLINT') {
                result.sqlType = 'INTEGER';
            }
            return result;
        });
        console.log(columns);
        const newAttributes = datareporter_plywood_1.PostgresExternal.postProcessIntrospect(columns).map(atr => {
            if (!atr)
                return;
            return {
                nativeType: atr.nativeType.toUpperCase(),
                name: atr.name,
                type: atr.type,
            };
        });
        return newAttributes.filter(Boolean);
    }
}
exports.PostgresAttributeParser = PostgresAttributeParser;
PostgresAttributeParser.engine = 'postgres';
//# sourceMappingURL=PostgresAttributeParser.js.map