"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissingFieldError = void 0;
const FieldError_1 = require("./FieldError");
class MissingFieldError extends FieldError_1.FieldError {
    constructor(fieldName) {
        super(`Field ${fieldName} is missing`, { fieldName });
    }
}
exports.MissingFieldError = MissingFieldError;
//# sourceMappingURL=MissingFieldError.js.map