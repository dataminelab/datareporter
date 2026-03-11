import { NextFunction, Request, Response } from "express";

import { ValidationError } from "../errors/ValidationError";
import { FieldError } from "../errors/FieldError";

import { logger } from "../logger/logger";
import { remapPlywoodBundleStack } from "../logger/plywoodStackMapper";

export const handleError = async (
  err: any,
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  if (!err) return next();

  if (err instanceof ValidationError) {
    logger.info(err.message);
    return res.status(err.statusCode).json({
      message: err.message,
    });
  } else if (err instanceof FieldError) {
    logger.info(err.message, err.fieldName);
    return res.status(err.statusCode).json({
      message: err.message,
      field: err.fieldName,
    });
  } else {
    if (typeof err?.stack === "string") {
      err.stack = await remapPlywoodBundleStack(err.stack);
    }

    logger.error(err);
    return res.status(500).json({
      message: `Unexpected error, ${err.message} `,
    });
  }
};
