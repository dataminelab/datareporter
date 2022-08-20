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
exports.AppSettings = void 0;
const immutable_class_1 = require("immutable-class");
const general_1 = require("../../utils/general/general");
const immutable_utils_1 = require("../../utils/immutable-utils/immutable-utils");
const cluster_1 = require("../cluster/cluster");
const customization_1 = require("../customization/customization");
const data_cube_1 = require("../data-cube/data-cube");
var check;
class AppSettings {
    constructor(parameters) {
        const { version, clusters, customization, dataCubes } = parameters;
        for (var dataCube of dataCubes) {
            if (dataCube.clusterName === "native")
                continue;
            if (!immutable_class_1.NamedArray.findByName(clusters, dataCube.clusterName)) {
                throw new Error(`data cube ${dataCube.name} refers to an unknown cluster ${dataCube.clusterName}`);
            }
        }
        this.version = version || 0;
        this.clusters = clusters;
        this.customization = customization;
        this.dataCubes = dataCubes;
    }
    static isAppSettings(candidate) {
        return candidate instanceof AppSettings;
    }
    static fromJS(parameters, context) {
        if (!context)
            throw new Error("AppSettings must have context");
        var clusters;
        if (parameters.clusters) {
            clusters = parameters.clusters.map(cluster => cluster_1.Cluster.fromJS(cluster));
        }
        else if (general_1.hasOwnProperty(parameters, "druidHost") || general_1.hasOwnProperty(parameters, "brokerHost")) {
            var clusterJS = JSON.parse(JSON.stringify(parameters));
            clusterJS.name = "druid";
            clusterJS.type = "druid";
            clusterJS.host = clusterJS.druidHost || clusterJS.brokerHost;
            clusters = [cluster_1.Cluster.fromJS(clusterJS)];
        }
        else {
            clusters = [];
        }
        var executorFactory = context.executorFactory;
        var dataCubes = (parameters.dataCubes || parameters.dataSources || []).map((dataCubeJS) => {
            var dataCubeClusterName = dataCubeJS.clusterName || dataCubeJS.engine;
            if (dataCubeClusterName !== "native") {
                var cluster = immutable_class_1.NamedArray.findByName(clusters, dataCubeClusterName);
                if (!cluster)
                    throw new Error(`Can not find cluster '${dataCubeClusterName}' for data cube '${dataCubeJS.name}'`);
            }
            var dataCubeObject = data_cube_1.DataCube.fromJS(dataCubeJS, { cluster });
            if (executorFactory) {
                var executor = executorFactory(dataCubeObject);
                if (executor)
                    dataCubeObject = dataCubeObject.attachExecutor(executor);
            }
            return dataCubeObject;
        });
        var value = {
            version: parameters.version,
            clusters,
            customization: customization_1.Customization.fromJS(parameters.customization || {}),
            dataCubes
        };
        return new AppSettings(value);
    }
    valueOf() {
        return {
            version: this.version,
            clusters: this.clusters,
            customization: this.customization,
            dataCubes: this.dataCubes
        };
    }
    toJS() {
        var js = {};
        if (this.version)
            js.version = this.version;
        js.clusters = this.clusters.map(cluster => cluster.toJS());
        js.customization = this.customization.toJS();
        js.dataCubes = this.dataCubes.map(dataCube => dataCube.toJS());
        return js;
    }
    toJSON() {
        return this.toJS();
    }
    toString() {
        return `[AppSettings v${this.version} dataCubes=${this.dataCubes.length}]`;
    }
    equals(other) {
        return AppSettings.isAppSettings(other) &&
            this.version === other.version &&
            immutable_class_1.immutableArraysEqual(this.clusters, other.clusters) &&
            immutable_class_1.immutableEqual(this.customization, other.customization) &&
            immutable_class_1.immutableArraysEqual(this.dataCubes, other.dataCubes);
    }
    toClientSettings() {
        var value = this.valueOf();
        value.clusters = value.clusters.map(c => c.toClientCluster());
        value.dataCubes = value.dataCubes
            .filter(ds => ds.isQueryable())
            .map(ds => ds.toClientDataCube());
        return new AppSettings(value);
    }
    getVersion() {
        return this.version;
    }
    getDataCubesForCluster(clusterName) {
        return this.dataCubes.filter(dataCube => dataCube.clusterName === clusterName);
    }
    getDataCube(dataCubeName) {
        return immutable_class_1.NamedArray.findByName(this.dataCubes, dataCubeName);
    }
    addOrUpdateDataCube(dataCube) {
        var value = this.valueOf();
        value.dataCubes = immutable_class_1.NamedArray.overrideByName(value.dataCubes, dataCube);
        return new AppSettings(value);
    }
    deleteDataCube(dataCube) {
        var value = this.valueOf();
        var index = value.dataCubes.indexOf(dataCube);
        if (index === -1) {
            throw new Error(`Unknown dataCube : ${dataCube.toString()}`);
        }
        var newDataCubes = value.dataCubes.concat();
        newDataCubes.splice(index, 1);
        value.dataCubes = newDataCubes;
        return new AppSettings(value);
    }
    attachExecutors(executorFactory) {
        var value = this.valueOf();
        value.dataCubes = value.dataCubes.map(ds => {
            var executor = executorFactory(ds);
            if (executor)
                ds = ds.attachExecutor(executor);
            return ds;
        });
        return new AppSettings(value);
    }
    getSuggestedCubes() {
        return this.dataCubes;
    }
    validate() {
        return this.customization.validate();
    }
    changeCustomization(customization) {
        return this.change("customization", customization);
    }
    changeClusters(clusters) {
        return this.change("clusters", clusters);
    }
    addCluster(cluster) {
        return this.changeClusters(immutable_class_1.NamedArray.overrideByName(this.clusters, cluster));
    }
    change(propertyName, newValue) {
        return immutable_utils_1.ImmutableUtils.change(this, propertyName, newValue);
    }
    changeDataCubes(dataCubes) {
        return this.change("dataCubes", dataCubes);
    }
    addDataCube(dataCube) {
        return this.changeDataCubes(immutable_class_1.NamedArray.overrideByName(this.dataCubes, dataCube));
    }
    filterDataCubes(fn) {
        var value = this.valueOf();
        value.dataCubes = value.dataCubes.filter(fn);
        return new AppSettings(value);
    }
}
exports.AppSettings = AppSettings;
AppSettings.BLANK = AppSettings.fromJS({}, {});
check = AppSettings;
//# sourceMappingURL=app-settings.js.map