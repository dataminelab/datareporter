import { NextFunction, Request, Response } from 'express';
import { logger } from '../logger/logger';
import dotenv from 'dotenv';

dotenv.config();

export const logRequestAndResponse = (req: Request, res: Response, next: NextFunction) => {
  const logMode = process.env.LOG_MODE;

  // Log the request
  logger.info(`Request: ${req.method} to ${req.url}`);

  if (logMode === 'request_and_response') {
    let responseLogged = false;

    const logResponse = (body: any) => {
      if (!responseLogged) {
        logger.info(`Response: ${res.statusCode} ${JSON.stringify(body)}`);
        responseLogged = true;
      }
    };

    // Wrap res.send
    const originalSend = res.send;
    res.send = function (body) {
      logResponse(body);
      return originalSend.call(this, body);
    };

    // Wrap res.json
    const originalJson = res.json;
    res.json = function (json) {
      logResponse(json);
      return originalJson.call(this, json);
    };
  }

  next();
};
