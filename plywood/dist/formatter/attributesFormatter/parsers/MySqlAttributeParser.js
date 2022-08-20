"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySqlAttributeParser = void 0;
const datareporter_plywood_1 = require("datareporter-plywood");
const AttributeParser_1 = require("./AttributeParser");
class MySqlAttributeParser extends AttributeParser_1.AttributeParser {
    _parseAttributes(attributes) {
        const columns = attributes.map((attribute) => {
            const result = { Field: attribute.name, Type: attribute.type };
            return result;
        });
        const newAttributes = datareporter_plywood_1.MySQLExternal.postProcessIntrospect(columns).map(atr => {
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
exports.MySqlAttributeParser = MySqlAttributeParser;
MySqlAttributeParser.engine = 'mysql';
//# sourceMappingURL=MySqlAttributeParser.js.map