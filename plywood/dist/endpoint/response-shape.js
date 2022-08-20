"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseShape = void 0;
const http_status_1 = __importDefault(require("http-status"));
const datareporter_plywood_1 = require("datareporter-plywood");
const responseShape = (req, res) => {
    const context = req.body.context;
    const expression = req.body.expression;
    const dataCube = req.body.dataCube;
    const ex = datareporter_plywood_1.Expression.fromJS(expression);
    const external = datareporter_plywood_1.External.fromJS(context);
    const shape = ex.simulate({ [dataCube]: external });
    res
        .status(http_status_1.default.OK)
        .json({ shape });
};
exports.responseShape = responseShape;
//# sourceMappingURL=response-shape.js.map