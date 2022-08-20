"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashToFilter = exports.filterToHash = void 0;
const http_status_1 = __importDefault(require("http-status"));
const lz_string_1 = require("lz-string");
const filterToHash = (req, res) => {
    res
        .status(http_status_1.default.OK)
        .json({ hash: lz_string_1.compressToBase64(JSON.stringify(req.body)) });
};
exports.filterToHash = filterToHash;
const hashToFilter = (req, res) => {
    res
        .status(http_status_1.default.OK)
        .json(JSON.parse(lz_string_1.decompressFromBase64(req.body.hash)));
};
exports.hashToFilter = hashToFilter;
//# sourceMappingURL=filter-to-hash-converter.js.map