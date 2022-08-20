"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const status_endpoint_1 = require("./endpoint/status-endpoint");
const plywood_endpoint_1 = require("./endpoint/plywood-endpoint");
const errorHandler_1 = require("./middlewares/errorHandler");
const requestLogs_1 = require("./middlewares/requestLogs");
const attributes_formatter_1 = require("./endpoint/attributes-formatter");
const AttributeParserFactory_1 = require("./formatter/attributesFormatter/factory/AttributeParserFactory");
const PostgresAttributeParser_1 = require("./formatter/attributesFormatter/parsers/PostgresAttributeParser");
const supported_engines_1 = require("./endpoint/supported_engines");
const MySqlAttributeParser_1 = require("./formatter/attributesFormatter/parsers/MySqlAttributeParser");
const BigQueryParser_1 = require("./formatter/attributesFormatter/parsers/BigQueryParser");
const hash_converter_1 = require("./endpoint/hash-converter");
const filter_to_hash_converter_1 = require("./endpoint/filter-to-hash-converter");
const response_shape_1 = require("./endpoint/response-shape");
const AthenaParser_1 = require("./formatter/attributesFormatter/parsers/AthenaParser");
AttributeParserFactory_1.AttributeParserFactory.register(PostgresAttributeParser_1.PostgresAttributeParser);
AttributeParserFactory_1.AttributeParserFactory.register(MySqlAttributeParser_1.MySqlAttributeParser);
AttributeParserFactory_1.AttributeParserFactory.register(BigQueryParser_1.BigQueryParser);
AttributeParserFactory_1.AttributeParserFactory.register(AthenaParser_1.AthenaParse);
const app = express_1.default();
//@ts-ignore
app.use(express_1.default.urlencoded({ extended: true }));
//@ts-ignore
app.use(express_1.default.json());
app.use((req, _res, next) => {
    requestLogs_1.handleLogs(req, next);
});
app.use('/api/v1/status', status_endpoint_1.statusEndpoint);
app.use('/api/v1/plywood/attributes/engines', supported_engines_1.requestSupportedEngines);
app.use('/api/v1/plywood/attributes', attributes_formatter_1.attributesFormatterEndpoint);
app.use('/api/v1/plywood/expression', hash_converter_1.hashConverterRequest);
app.use('/api/v1/plywood/filter-to-hash', filter_to_hash_converter_1.filterToHash);
app.use('/api/v1/plywood/hash-to-filter', filter_to_hash_converter_1.hashToFilter);
app.use('/api/v1/plywood/response-shape', response_shape_1.responseShape);
app.use('/api/v1/plywood', plywood_endpoint_1.plywoodEndpoint);
app.use((err, req, res, next) => {
    errorHandler_1.handleError(err, req, res, next);
});
exports.default = app;
//# sourceMappingURL=app.js.map