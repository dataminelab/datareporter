"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = void 0;
const ValidationError_1 = require("../errors/ValidationError");
const FieldError_1 = require("../errors/FieldError");
const logger_1 = require("../logger/logger");
const handleError = (err, _req, res, next) => {
    if (!err)
        return next();
    if (err instanceof ValidationError_1.ValidationError) {
        logger_1.logger.info(err.message);
        return res.status(err.statusCode).json({
            message: err.message
        });
    }
    else if (err instanceof FieldError_1.FieldError) {
        logger_1.logger.info(err.message, err.fieldName);
        return res.status(err.statusCode).json({
            message: err.message,
            field: err.fieldName
        });
    }
    else {
        logger_1.logger.error(err);
        return res.status(500).json({
            message: `Unexpected error, ${err.message} `
        });
    }
};
exports.handleError = handleError;
//# sourceMappingURL=errorHandler.js.map