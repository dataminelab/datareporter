"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributeParserFactory = void 0;
const ValidationError_1 = require("../../../errors/ValidationError");
class AttributeParserFactory {
    static getSupportedEngines() {
        return [...AttributeParserFactory.REGISTERED_PARSERS.keys()];
    }
    static getAttributeParser(engine) {
        this.engineValidation(engine);
        const AttributeParserInstance = AttributeParserFactory.REGISTERED_PARSERS.get(engine);
        return AttributeParserInstance;
    }
    static register(attributeParser) {
        const engine = attributeParser.engine.replace(/^\w/, (s) => s.toLowerCase());
        if (AttributeParserFactory.REGISTERED_PARSERS.has(engine)) {
            throw new Error(`Engine ${engine} is already registered`);
        }
        AttributeParserFactory.REGISTERED_PARSERS.set(engine, attributeParser);
    }
}
exports.AttributeParserFactory = AttributeParserFactory;
AttributeParserFactory.REGISTERED_PARSERS = new Map();
AttributeParserFactory.engineValidation = (engine) => {
    if (engine === undefined) {
        throw new ValidationError_1.ValidationError('Engine is missing');
    }
    if (typeof engine !== 'string') {
        throw new ValidationError_1.ValidationError("Engine should be string");
    }
    const engines = AttributeParserFactory.getSupportedEngines();
    if (!engines.includes(engine)) {
        throw new ValidationError_1.ValidationError(`Engine is not supported, supported are [${engines.join(',')}]`);
    }
};
//# sourceMappingURL=AttributeParserFactory.js.map