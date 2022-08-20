"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributeParser = void 0;
const datareporter_plywood_1 = require("datareporter-plywood");
class AttributeParser {
    constructor(attributes) {
        this.attributes = attributes;
    }
    parseAttributes() {
        // public method to be called to parse attributes
        const parsedAttributes = this._parseAttributes(this.attributes);
        const updatedAttributes = this.fitNewAttributes(parsedAttributes);
        const cleanedAttributes = this.markUnsupportedAttributes(updatedAttributes);
        return cleanedAttributes;
    }
    //Marks  unsupported data types 
    markUnsupportedAttributes(attributes) {
        return attributes.map(o => {
            if (o.isSupported !== undefined)
                return Object.assign({}, o);
            return Object.assign(Object.assign({}, o), { isSupported: datareporter_plywood_1.RefExpression.validType(o.type) });
        });
    }
    //Changes  old attributes for new and removes 
    fitNewAttributes(newAttributes) {
        const result = [];
        for (const attribute of this.attributes) {
            const newIndex = newAttributes.findIndex(o => o.name === attribute.name);
            if (newIndex === -1)
                result.push(Object.assign(Object.assign({}, attribute), { nativeType: attribute.type }));
            else
                result.push(Object.assign({}, newAttributes[newIndex]));
        }
        return result;
    }
}
exports.AttributeParser = AttributeParser;
//# sourceMappingURL=AttributeParser.js.map