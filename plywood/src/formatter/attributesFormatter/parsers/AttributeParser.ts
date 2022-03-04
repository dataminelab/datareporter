import { InputAttribute, OutputAttribute } from "../types/types";
import { RefExpression } from "datareporter-plywood";




export abstract class AttributeParser {
    private attributes: InputAttribute[];



    constructor(attributes: InputAttribute[]) {
        this.attributes = attributes;
    }

    public parseAttributes(): OutputAttribute[] {
        // public method to be called to parse attributes
        const parsedAttributes = this._parseAttributes(this.attributes);
        const updatedAttributes = this.fitNewAttributes(parsedAttributes);
        const cleanedAttributes = this.markUnsupportedAttributes(updatedAttributes)
        return cleanedAttributes;
    }

    // should be implemented to do the actual work
    // Should only return values that have been effected
    protected abstract _parseAttributes(attributes: InputAttribute[]): OutputAttribute[];


    //Marks  unsupported data types 
    protected markUnsupportedAttributes(attributes: OutputAttribute[]): OutputAttribute[] {
        return attributes.map(o => {
            if (o.isSupported !== undefined) return { ...o }
            return { ...o, isSupported: RefExpression.validType(o.type) }
        });
    }

    //Changes  old attributes for new and removes 
    protected fitNewAttributes(newAttributes: OutputAttribute[]): OutputAttribute[] {
        const result: OutputAttribute[] = [];


        for (const attribute of this.attributes) {
            const newIndex = newAttributes.findIndex(o => o.name === attribute.name);
            if (newIndex === -1) result.push({ ...attribute, nativeType: attribute.type })
            else result.push({ ...newAttributes[newIndex] })
        }

        return result;
    }

}


