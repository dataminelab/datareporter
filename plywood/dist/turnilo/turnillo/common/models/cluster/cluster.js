"use strict";
/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2019 Allegro.pl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cluster = void 0;
const immutable_class_1 = require("immutable-class");
const datareporter_plywood_1 = require("datareporter-plywood");
const url_1 = require("url");
const general_1 = require("../../utils/general/general");
function ensureNotNative(name) {
    if (name === "native") {
        throw new Error("can not be 'native'");
    }
}
function ensureNotTiny(v) {
    if (v === 0)
        return;
    if (v < 1000) {
        throw new Error(`can not be < 1000 (is ${v})`);
    }
}
function validateUrl(url) {
    try {
        new url_1.URL(url);
    }
    catch (e) {
        throw new Error(`Cluster url: ${url} has invalid format. It should be http[s]://hostname[:port]`);
    }
}
function oldHostParameter(cluster) {
    return cluster.host || cluster.druidHost || cluster.brokerHost;
}
class Cluster extends immutable_class_1.BaseImmutable {
    constructor() {
        super(...arguments);
        this.type = "druid";
    }
    static fromJS(parameters) {
        if (typeof parameters.timeout === "string") {
            parameters.timeout = parseInt(parameters.timeout, 10);
        }
        if (typeof parameters.sourceListRefreshInterval === "string") {
            parameters.sourceListRefreshInterval = parseInt(parameters.sourceListRefreshInterval, 10);
        }
        if (typeof parameters.sourceReintrospectInterval === "string") {
            parameters.sourceReintrospectInterval = parseInt(parameters.sourceReintrospectInterval, 10);
        }
        return new Cluster(immutable_class_1.BaseImmutable.jsToValue(Cluster.PROPERTIES, parameters, Cluster.BACKWARD_COMPATIBILITY));
    }
    toClientCluster() {
        return new Cluster({
            name: this.name,
            timeout: this.timeout
        });
    }
    makeExternalFromSourceName(source, version) {
        return datareporter_plywood_1.External.fromValue({
            engine: "druid",
            source,
            version,
            suppress: true,
            allowSelectQueries: true,
            allowEternity: false
        });
    }
    shouldScanSources() {
        return this.getSourceListScan() === "auto";
    }
}
exports.Cluster = Cluster;
Cluster.DEFAULT_TIMEOUT = 40000;
Cluster.DEFAULT_HEALTH_CHECK_TIMEOUT = 1000;
Cluster.DEFAULT_SOURCE_LIST_SCAN = "auto";
Cluster.SOURCE_LIST_SCAN_VALUES = ["disable", "auto"];
Cluster.DEFAULT_SOURCE_LIST_REFRESH_INTERVAL = 0;
Cluster.DEFAULT_SOURCE_LIST_REFRESH_ON_LOAD = false;
Cluster.DEFAULT_SOURCE_REINTROSPECT_INTERVAL = 0;
Cluster.DEFAULT_SOURCE_REINTROSPECT_ON_LOAD = false;
Cluster.DEFAULT_INTROSPECTION_STRATEGY = "segment-metadata-fallback";
Cluster.DEFAULT_GUARD_DATA_CUBES = false;
Cluster.PROPERTIES = [
    { name: "name", validate: [general_1.verifyUrlSafeName, ensureNotNative] },
    { name: "url", defaultValue: null, validate: [validateUrl] },
    { name: "title", defaultValue: "" },
    { name: "version", defaultValue: null },
    { name: "timeout", defaultValue: Cluster.DEFAULT_TIMEOUT },
    { name: "healthCheckTimeout", defaultValue: Cluster.DEFAULT_HEALTH_CHECK_TIMEOUT },
    { name: "sourceListScan", defaultValue: Cluster.DEFAULT_SOURCE_LIST_SCAN, possibleValues: Cluster.SOURCE_LIST_SCAN_VALUES },
    { name: "sourceListRefreshOnLoad", defaultValue: Cluster.DEFAULT_SOURCE_LIST_REFRESH_ON_LOAD },
    {
        name: "sourceListRefreshInterval",
        defaultValue: Cluster.DEFAULT_SOURCE_LIST_REFRESH_INTERVAL,
        validate: [immutable_class_1.BaseImmutable.ensure.number, ensureNotTiny]
    },
    { name: "sourceReintrospectOnLoad", defaultValue: Cluster.DEFAULT_SOURCE_REINTROSPECT_ON_LOAD },
    {
        name: "sourceReintrospectInterval",
        defaultValue: Cluster.DEFAULT_SOURCE_REINTROSPECT_INTERVAL,
        validate: [immutable_class_1.BaseImmutable.ensure.number, ensureNotTiny]
    },
    { name: "introspectionStrategy", defaultValue: Cluster.DEFAULT_INTROSPECTION_STRATEGY },
    { name: "requestDecorator", defaultValue: null },
    { name: "decoratorOptions", defaultValue: null },
    { name: "guardDataCubes", defaultValue: Cluster.DEFAULT_GUARD_DATA_CUBES }
];
Cluster.HTTP_PROTOCOL_TEST = /^http(s?):/;
Cluster.BACKWARD_COMPATIBILITY = [{
        condition: cluster => !general_1.isTruthy(cluster.url) && general_1.isTruthy(oldHostParameter(cluster)),
        action: cluster => {
            const oldHost = oldHostParameter(cluster);
            cluster.url = Cluster.HTTP_PROTOCOL_TEST.test(oldHost) ? oldHost : `http://${oldHost}`;
        }
    }];
immutable_class_1.BaseImmutable.finalize(Cluster);
//# sourceMappingURL=cluster.js.map