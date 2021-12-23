import { Request, Response } from "express";
import { FieldError } from "../errors/FieldError";
import { ValidationError } from "../errors/ValidationError";
import { MissingFieldError } from "../errors/MissingFieldError";

import { AttributeParserFactory } from "../formatter/attributesFormatter/factory/AttributeParserFactory";
import { InputAttribute } from "../formatter/attributesFormatter/types/types";




interface Input {
    engine: string,
    attributes: InputAttribute[]
}

const validation = (req: Request) => {
    const body = req.body as Input;

    const engine = body.engine;
    const attributes = body.attributes;

    try {
        AttributeParserFactory.engineValidation(engine);
    } catch (e) {
        if (e instanceof ValidationError) throw new FieldError(e.message, { fieldName: 'engine' })
        throw new Error(e);
    }

    if (attributes === undefined) throw new MissingFieldError("attributes")
    if (!Array.isArray(attributes)) throw new FieldError("Should be an array", { fieldName: "attributes" })

    for (const [i, attribute] of attributes.entries()) {

        const name = attribute.name;
        const type = attribute.type;
        if (name === undefined) throw new FieldError(`Name is missing in attributes at index ${i}`, { fieldName: 'attributes.name' })
        if (type === undefined) throw new FieldError(`Type is missing in attributes at index ${i}`, { fieldName: 'attributes.type' })

    }


}



export const attributesFormatterEndpoint = (req: Request, res: Response) => {
    // validation
    validation(req);

    // parsing
    const body = req.body as Input;
    const AttributeParserInstance = AttributeParserFactory.getAttributeParser(body.engine);
    const attributeParser = new AttributeParserInstance(body.attributes);
    const newAttributes = attributeParser.parseAttributes();
    //response
    return res.json({ attributes: newAttributes })
};
