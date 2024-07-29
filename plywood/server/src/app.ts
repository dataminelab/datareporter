import express, { NextFunction, Request } from "express";
import * as Sentry from "@sentry/node";
import { statusEndpoint } from "./endpoint/status-endpoint";
import { plywoodEndpoint } from "./endpoint/plywood-endpoint";
import { handleError } from "./middlewares/errorHandler";
import { logRequestAndResponse } from "./middlewares/requestLogs";
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
import { DruidParse } from "./formatter/attributesFormatter/parsers/DruidParser";
import { env } from "process";

AttributeParserFactory.register(PostgresAttributeParser);
AttributeParserFactory.register(MySqlAttributeParser);
AttributeParserFactory.register(BigQueryParser);
AttributeParserFactory.register(AthenaParse);
AttributeParserFactory.register(DruidParse);
const app = express();
if (env.SENTRY_DSN) {
    console.log("Sentry enabled");
    Sentry.init({
        dsn: env.SENTRY_DSN,
        release: env.DATAREPORTER_VERSION || 'unknown',
        environment: env.SENTRY_ENVIRONMENT,
        attachStacktrace: true,
        sampleRate: parseFloat(env.SENTRY_SAMPLE_RATE || "1.0",),
        tracesSampleRate: parseFloat(env.SENTRY_TRACES_SAMPLE_RATE || "1.0",),
    });
    app.use(Sentry.Handlers.requestHandler());
}
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(logRequestAndResponse);

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
