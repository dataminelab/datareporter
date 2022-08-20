"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestSupportedEngines = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AttributeParserFactory_1 = require("../formatter/attributesFormatter/factory/AttributeParserFactory");
const requestSupportedEngines = (_req, res) => {
    const supported = AttributeParserFactory_1.AttributeParserFactory.getSupportedEngines();
    res
        .status(http_status_1.default.OK)
        .json({ supportedEngines: supported });
};
exports.requestSupportedEngines = requestSupportedEngines;
//# sourceMappingURL=supported_engines.js.map