"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.plywoodEndpoint = void 0;
const http_status_1 = __importDefault(require("http-status"));
const datareporter_plywood_1 = require("datareporter-plywood");
const response_formatter_1 = require("../formatter/response-formatter");
const plywoodEndpoint = (req, res) => {
    const dataCube = req.body.dataCube;
    const expressionQuery = req.body.expression || {};
    const context = req.body.context || {};
    let expression = null;
    try {
        expression = datareporter_plywood_1.Expression.fromJS(expressionQuery);
    }
    catch (e) {
        res
            .status(http_status_1.default.BAD_REQUEST)
            .json({
            error: "bad expression",
            message: e.message
        });
        return;
    }
    if (!dataCube) {
        res
            .status(http_status_1.default.BAD_REQUEST)
            .json({
            error: "dataCube is null",
            message: "data cube must be defined"
        });
        return;
    }
    const external = datareporter_plywood_1.External.fromJS(context);
    const sqlQueries = expression.simulateQueryPlan({ [dataCube]: external });
    const formattedQueries = response_formatter_1.responseFormatter(sqlQueries);
    res
        .json({ queries: formattedQueries })
        .status(http_status_1.default.OK);
};
exports.plywoodEndpoint = plywoodEndpoint;
//# sourceMappingURL=plywood-endpoint.js.map