interface Options {
    statusCode?: number
}
export class ValidationError extends Error {
    statusCode: number
    constructor(message: string, { statusCode }: Options = {}) {
        super(message);
        this.name = 'Validation error'
        this.statusCode = statusCode === undefined ? 400 : statusCode;
    }
}