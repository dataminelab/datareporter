"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldError = void 0;
class FieldError extends Error {
    constructor(message, { fieldName, statusCode } = {}) {
        super(message);
        this.name = 'Validation error';
        this.fieldName = fieldName === undefined ? undefined : fieldName;
        this.statusCode = statusCode === undefined ? 400 : statusCode;
    }
}
exports.FieldError = FieldError;
//# sourceMappingURL=FieldError.js.map