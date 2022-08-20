import { Request, Response } from "express";
import httpStatus from "http-status";
import { compressToBase64, decompressFromBase64 } from 'lz-string';

export const filterToHash = (req: Request, res: Response) => {
    res
        .status(httpStatus.OK)
        .json({ hash: compressToBase64(JSON.stringify(req.body)) });

};

export const hashToFilter = (req: Request, res: Response) => {
    res
        .status(httpStatus.OK)
        .json(JSON.parse(decompressFromBase64(req.body.hash)));

};
