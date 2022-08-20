"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusEndpoint = void 0;
const http_status_1 = __importDefault(require("http-status"));
const statusEndpoint = (_req, res) => {
    res
        .status(http_status_1.default.OK)
        .json({ status: "UP" });
};
exports.statusEndpoint = statusEndpoint;
//# sourceMappingURL=status-endpoint.js.map