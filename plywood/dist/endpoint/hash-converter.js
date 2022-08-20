"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashConverterRequest = void 0;
const FieldError_1 = require("../errors/FieldError");
const hash_converter_1 = require("../turnilo/dataminelab/hash-converter");
const hashConverterRequest = (req, res) => {
    const hash = req.body.hash;
    const dataCube = req.body.dataCube;
    if (!hash) {
        throw new FieldError_1.FieldError("hash not defined", {
            fieldName: 'hash',
            statusCode: 400
        });
    }
    if (!dataCube) {
        throw new FieldError_1.FieldError("dataCube not defined", {
            fieldName: 'dataCube',
            statusCode: 400
        });
    }
    const result = hash_converter_1.hashToExpression(hash, dataCube);
    return res.json(result);
};
exports.hashConverterRequest = hashConverterRequest;
//# sourceMappingURL=hash-converter.js.map