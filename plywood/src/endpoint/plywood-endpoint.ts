import { Request, Response } from "express";
import httpStatus from "http-status";
import { Expression, External } from "datareporter-plywood";
import { responseFormatter } from "../formatter/response-formatter";

export const plywoodEndpoint = (req: Request, res: Response) => {
    const dataCube = req.body.dataCube;
    const expressionQuery = req.body.expression || {};
    const context = req.body.context || {};

    let expression: Expression = null;

    try {
        expression = Expression.fromJS(expressionQuery);
    } catch (e) {
        res
            .status(httpStatus.BAD_REQUEST)
            .json({
                error: "bad expression",
                message: e.message
            });
        return;
    }

    if (!dataCube) {
        res
            .status(httpStatus.BAD_REQUEST)
            .json({
                error: "dataCube is null",
                message: "data cube must be defined"
            });
        return;
    }


    const external: External = External.fromJS(context);

    const sqlQueries = expression.simulateQueryPlan({ [dataCube]: external });
    const formattedQueries = responseFormatter(sqlQueries);

    res
        .json({ queries: formattedQueries })
        .status(httpStatus.OK);
};
