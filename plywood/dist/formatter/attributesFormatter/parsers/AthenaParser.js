"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AthenaParse = void 0;
const AttributeParser_1 = require("./AttributeParser");
const datareporter_plywood_1 = require("datareporter-plywood");
class AthenaParse extends AttributeParser_1.AttributeParser {
    _parseAttributes(attributes) {
        const columns = attributes.map((attribute) => {
            const result = { name: attribute.name, type: attribute.type };
            return result;
        });
        const newAttributes = datareporter_plywood_1.AwsAthenaExternal.mapTypes(columns).map((atr, index) => {
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
exports.AthenaParse = AthenaParse;
AthenaParse.engine = 'athena';
//# sourceMappingURL=AthenaParser.js.map