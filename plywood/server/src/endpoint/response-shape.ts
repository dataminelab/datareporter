import { Request, Response } from "express";
import httpStatus from "http-status";
import { Expression, External } from "reporter-plywood";

export const responseShape = (req: Request, res: Response) => {

    const context = req.body.context;
    const expression = req.body.expression;
    const dataCube = req.body.dataCube;

    const ex = Expression.fromJS(expression);
    const external = External.fromJS(context);

    const shape = ex.simulate({ [dataCube]: external }, {others: expression});

    res
        .status(httpStatus.OK)
        .json({ shape });
};
