import express, { NextFunction, Request } from "express";
import { statusEndpoint } from "./endpoint/status-endpoint";
import { plywoodEndpoint } from "./endpoint/plywood-endpoint";
import { handleError } from "./middlewares/errorHandler";
import { handleLogs } from "./middlewares/requestLogs";
import { attributesFormatterEndpoint } from './endpoint/attributes-formatter'
import { AttributeParserFactory } from "./formatter/attributesFormatter/factory/AttributeParserFactory";
import { PostgresAttributeParser } from './formatter/attributesFormatter/parsers/PostgresAttributeParser';
import { requestSupportedEngines } from './endpoint/supported_engines';
import { MySqlAttributeParser } from "./formatter/attributesFormatter/parsers/MySqlAttributeParser";
import { BigQueryParser } from "./formatter/attributesFormatter/parsers/BigQueryParser";
import { hashConverterRequest } from "./endpoint/hash-converter";
import { filterToHash, hashToFilter } from './endpoint/filter-to-hash-converter';
import { responseShape } from './endpoint/response-shape';
import { AthenaParse } from "./formatter/attributesFormatter/parsers/AthenaParser";

AttributeParserFactory.register(PostgresAttributeParser);
AttributeParserFactory.register(MySqlAttributeParser);
AttributeParserFactory.register(BigQueryParser);
AttributeParserFactory.register(AthenaParse);
const app = express();

//@ts-ignore
app.use(express.urlencoded({ extended: true }));
//@ts-ignore
app.use(express.json());

app.use((req: Request, _res, next: NextFunction) => {
    handleLogs(req, next)
});

app.use('/api/v1/status', statusEndpoint);
app.use('/api/v1/plywood/attributes/engines', requestSupportedEngines)
app.use('/api/v1/plywood/attributes', attributesFormatterEndpoint)
app.use('/api/v1/plywood/expression', hashConverterRequest)
app.use('/api/v1/plywood/filter-to-hash', filterToHash)
app.use('/api/v1/plywood/hash-to-filter', hashToFilter)
app.use('/api/v1/plywood/response-shape', responseShape)
app.use('/api/v1/plywood', plywoodEndpoint);

app.use((err, req, res, next) => {
    handleError(err, req, res, next);
});

export default app;
