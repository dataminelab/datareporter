"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = void 0;
class ValidationError extends Error {
    constructor(message, { statusCode } = {}) {
        super(message);
        this.name = 'Validation error';
        this.statusCode = statusCode === undefined ? 400 : statusCode;
    }
}
exports.ValidationError = ValidationError;
//# sourceMappingURL=ValidationError.js.map