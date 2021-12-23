import { Request, Response } from "express";
import httpStatus from "http-status";
import { AttributeParserFactory } from "../formatter/attributesFormatter/factory/AttributeParserFactory";

export const requestSupportedEngines = (_req: Request, res: Response) => {
    const supported = AttributeParserFactory.getSupportedEngines();

    res
        .status(httpStatus.OK)
        .json({ supportedEngines: supported });
};
