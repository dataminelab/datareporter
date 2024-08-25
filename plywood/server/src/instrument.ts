import {env} from "process";
import * as Sentry from "@sentry/node";

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
}
