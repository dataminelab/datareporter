import { FieldError } from './FieldError';

export class MissingFieldError extends FieldError {
    constructor(fieldName: string) {
        super(`Field ${fieldName} is missing`, { fieldName })
    }
}