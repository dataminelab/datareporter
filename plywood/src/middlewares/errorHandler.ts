import { ValidationError } from "../errors/ValidationError";
import { FieldError } from "../errors/FieldError";

import { logger } from "../logger/logger";

export const handleError = (err, _req, res, next) => {
    if (!err) return next();

    if (err instanceof ValidationError) {
        logger.info(err.message);
        return res.status(err.statusCode).json({
            message: err.message
        });
    } else if (err instanceof FieldError) {
        logger.info(err.message, err.fieldName);
        return res.status(err.statusCode).json({
            message: err.message,
            field: err.fieldName
        });
    }
    else {
        logger.error(err);
        return res.status(500).json({
            message: `Unexpected error, ${err.message} `
        });
    }
}

