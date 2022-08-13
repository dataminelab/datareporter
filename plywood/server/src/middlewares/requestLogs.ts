import { NextFunction, Request } from "express";
import { logger } from "../logger/logger";

export const handleLogs = (req: Request, next: NextFunction) => {
    logger.info(`${req.method} to  ${req.url}`)
    next();
}