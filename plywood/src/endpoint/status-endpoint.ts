import {Request, Response} from "express";
import httpStatus from "http-status";

export const statusEndpoint = (_req: Request, res: Response) => {
    res
        .status(httpStatus.OK)
        .json({status: "UP"});
};
