import { Request, Response } from "express";
import { FieldError } from "../errors/FieldError";
import { hashToExpression } from "../turnilo/dataminelab/hash-converter";



export const hashConverterRequest = (req: Request, res: Response) => {

    const hash = req.body.hash;
    const dataCube = req.body.dataCube;

    if (!hash) {
        throw new FieldError("hash not defined", {
            fieldName: 'hash',
            statusCode: 400
        });
    }

    if (!dataCube) {
        throw new FieldError("dataCube not defined", {
            fieldName: 'dataCube',
            statusCode: 400
        });
    }

    const result = hashToExpression(hash, dataCube);

    return res.json(result);
};
