"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attributesFormatterEndpoint = void 0;
const FieldError_1 = require("../errors/FieldError");
const ValidationError_1 = require("../errors/ValidationError");
const MissingFieldError_1 = require("../errors/MissingFieldError");
const AttributeParserFactory_1 = require("../formatter/attributesFormatter/factory/AttributeParserFactory");
const validation = (req) => {
    const body = req.body;
    const engine = body.engine;
    const attributes = body.attributes;
    try {
        AttributeParserFactory_1.AttributeParserFactory.engineValidation(engine);
    }
    catch (e) {
        if (e instanceof ValidationError_1.ValidationError)
            throw new FieldError_1.FieldError(e.message, { fieldName: 'engine' });
        throw new Error(e);
    }
    if (attributes === undefined)
        throw new MissingFieldError_1.MissingFieldError("attributes");
    if (!Array.isArray(attributes))
        throw new FieldError_1.FieldError("Should be an array", { fieldName: "attributes" });
    for (const [i, attribute] of attributes.entries()) {
        const name = attribute.name;
        const type = attribute.type;
        if (name === undefined)
            throw new FieldError_1.FieldError(`Name is missing in attributes at index ${i}`, { fieldName: 'attributes.name' });
        if (type === undefined)
            throw new FieldError_1.FieldError(`Type is missing in attributes at index ${i}`, { fieldName: 'attributes.type' });
    }
};
const attributesFormatterEndpoint = (req, res) => {
    // validation
    validation(req);
    // parsing
    const body = req.body;
    const AttributeParserInstance = AttributeParserFactory_1.AttributeParserFactory.getAttributeParser(body.engine);
    const attributeParser = new AttributeParserInstance(body.attributes);
    const newAttributes = attributeParser.parseAttributes();
    //response
    return res.json({ attributes: newAttributes });
};
exports.attributesFormatterEndpoint = attributesFormatterEndpoint;
//# sourceMappingURL=attributes-formatter.js.map