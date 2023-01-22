import { ValidationError } from '../../../errors/ValidationError';
import { AttributeParser } from '../parsers/AttributeParser';
import { InputAttribute } from '../types/types';

type Class<T> = new (attributes: InputAttribute[]) => T

export class AttributeParserFactory {

    private static REGISTERED_PARSERS: Map<string, Class<AttributeParser>> = new Map();

    static engineValidation = (engine: string) => {
        if (engine === undefined) {
            throw new ValidationError('Engine is missing')
        }
        if (typeof engine !== 'string') {
            throw new ValidationError("Engine should be string")
        }

        const engines = AttributeParserFactory.getSupportedEngines();

        if (!engines.includes(engine)) {
            throw new ValidationError(`Engine is not supported, supported are [${engines.join(',')}]`)
        }
    }


    static getSupportedEngines(): string[] {
        return [...AttributeParserFactory.REGISTERED_PARSERS.keys()];
    }

    static getAttributeParser(engine: string): Class<AttributeParser> {
        this.engineValidation(engine);
        const AttributeParserInstance = AttributeParserFactory.REGISTERED_PARSERS.get(engine);
        return AttributeParserInstance;
    }

    static register(attributeParser: Class<AttributeParser>) {
        const engine = (<any>attributeParser).engine.replace(/^\w/, (s: string) => s.toLowerCase());
        if (AttributeParserFactory.REGISTERED_PARSERS.has(engine)) {
            throw new Error(`Engine ${engine} is already registered`);
        }
        AttributeParserFactory.REGISTERED_PARSERS.set(engine, attributeParser);
    }
}


