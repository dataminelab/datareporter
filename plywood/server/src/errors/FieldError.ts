
interface Optional {
    fieldName?: string,
    statusCode?: number
}

export class FieldError extends Error {
    fieldName?: string;
    statusCode: number
    constructor(message: string, { fieldName, statusCode }: Optional = {}) {
        super(message);
        this.name = 'Validation error'
        this.fieldName = fieldName === undefined ? undefined : fieldName
        this.statusCode = statusCode === undefined ? 400 : statusCode
    }
}

