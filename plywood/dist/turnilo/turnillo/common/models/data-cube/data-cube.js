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
exports.DataCube = void 0;
const chronoshift_1 = require("chronoshift");
const immutable_1 = require("immutable");
const immutable_class_1 = require("immutable-class");
const datareporter_plywood_1 = require("datareporter-plywood");
const array_1 = require("../../utils/array/array");
const general_1 = require("../../utils/general/general");
const dimension_1 = require("../dimension/dimension");
const dimensions_1 = require("../dimension/dimensions");
const filter_clause_1 = require("../filter-clause/filter-clause");
const filter_1 = require("../filter/filter");
const measure_1 = require("../measure/measure");
const measures_1 = require("../measure/measures");
const refresh_rule_1 = require("../refresh-rule/refresh-rule");
const splits_1 = require("../splits/splits");
function checkDimensionsAndMeasuresNamesUniqueness(dimensions, measures, dataCubeName) {
    if (dimensions != null && measures != null) {
        const dimensionNames = dimensions.getDimensionNames();
        const measureNames = measures.getMeasureNames();
        const duplicateNames = dimensionNames
            .concat(measureNames)
            .groupBy(name => name)
            .filter(names => names.count() > 1)
            .map((names, name) => name)
            .toList();
        if (duplicateNames.size > 0) {
            throw new Error(`data cube: '${dataCubeName}', names: ${general_1.quoteNames(duplicateNames)} found in both dimensions and measures'`);
        }
    }
}
function measuresFromLongForm(longForm) {
    const { metricColumn, measures, possibleAggregates } = longForm;
    let myPossibleAggregates = {};
    for (let agg in possibleAggregates) {
        if (!general_1.hasOwnProperty(possibleAggregates, agg))
            continue;
        myPossibleAggregates[agg] = datareporter_plywood_1.Expression.fromJSLoose(possibleAggregates[agg]);
    }
    return measures.map(measure => {
        if (general_1.hasOwnProperty(measure, "name")) {
            return measure_1.Measure.fromJS(measure);
        }
        const title = measure.title;
        if (!title) {
            throw new Error("must have title in longForm value");
        }
        const value = measure.value;
        const aggregate = measure.aggregate;
        if (!aggregate) {
            throw new Error("must have aggregates in longForm value");
        }
        const myExpression = myPossibleAggregates[aggregate];
        if (!myExpression)
            throw new Error(`can not find aggregate ${aggregate} for value ${value}`);
        const name = general_1.makeUrlSafeName(`${aggregate}_${value}`);
        return new measure_1.Measure({
            name,
            title,
            units: measure.units,
            formula: myExpression.substitute(ex => {
                if (ex instanceof datareporter_plywood_1.RefExpression && ex.name === "filtered") {
                    return datareporter_plywood_1.$("main").filter(datareporter_plywood_1.$(metricColumn).is(datareporter_plywood_1.r(value)));
                }
                return null;
            }).toString()
        });
    });
}
function filterFromLongForm(longForm) {
    const { metricColumn, measures } = longForm;
    let values = [];
    for (let measure of measures) {
        if (general_1.hasOwnProperty(measure, "aggregate"))
            values.push(measure.value);
    }
    return datareporter_plywood_1.$(metricColumn).in(values).simplify();
}
let check;
class DataCube {
    constructor(parameters) {
        const name = parameters.name;
        if (!parameters.name)
            throw new Error("DataCube must have a name");
        general_1.verifyUrlSafeName(name);
        this.name = name;
        this.title = parameters.title ? parameters.title : parameters.name;
        this.clusterName = parameters.clusterName || "druid";
        this.source = parameters.source || name;
        this.group = parameters.group || null;
        this.subsetFormula = parameters.subsetFormula;
        this.subsetExpression = parameters.subsetFormula ? datareporter_plywood_1.Expression.fromJSLoose(parameters.subsetFormula) : datareporter_plywood_1.Expression.TRUE;
        this.rollup = Boolean(parameters.rollup);
        this.options = parameters.options || {};
        this.introspection = parameters.introspection;
        this.attributes = parameters.attributes || [];
        this.attributeOverrides = parameters.attributeOverrides || [];
        this.derivedAttributes = parameters.derivedAttributes;
        this.timeAttribute = parameters.timeAttribute;
        this.defaultTimezone = parameters.defaultTimezone;
        this.defaultFilter = parameters.defaultFilter;
        this.defaultSplitDimensions = parameters.defaultSplitDimensions;
        this.defaultDuration = parameters.defaultDuration;
        this.defaultSortMeasure = parameters.defaultSortMeasure;
        this.defaultSelectedMeasures = parameters.defaultSelectedMeasures;
        this.defaultPinnedDimensions = parameters.defaultPinnedDimensions;
        this.maxSplits = parameters.maxSplits;
        this.maxQueries = parameters.maxQueries;
        const { description, extendedDescription } = this.parseDescription(parameters);
        this.description = description;
        this.extendedDescription = extendedDescription;
        this.refreshRule = parameters.refreshRule || refresh_rule_1.RefreshRule.query();
        this.cluster = parameters.cluster;
        this.executor = parameters.executor;
        const dimensions = parameters.dimensions;
        const measures = parameters.measures;
        checkDimensionsAndMeasuresNamesUniqueness(dimensions, measures, name);
        this.dimensions = dimensions || dimensions_1.Dimensions.empty();
        this.measures = measures || measures_1.Measures.empty();
        this._validateDefaults();
    }
    static isDataCube(candidate) {
        return candidate instanceof DataCube;
    }
    static queryMaxTime(dataCube) {
        if (!dataCube.executor) {
            return Promise.reject(new Error("dataCube not ready"));
        }
        const ex = datareporter_plywood_1.ply().apply("maxTime", datareporter_plywood_1.$("main").max(dataCube.timeAttribute));
        return dataCube.executor(ex).then((dataset) => {
            const maxTimeDate = dataset.data[0]["maxTime"];
            if (isNaN(maxTimeDate))
                return null;
            return maxTimeDate;
        });
    }
    static fromClusterAndExternal(name, cluster, external) {
        const dataCube = DataCube.fromJS({
            name,
            clusterName: cluster.name,
            source: String(external.source),
            refreshRule: refresh_rule_1.RefreshRule.query().toJS()
        });
        return dataCube.updateCluster(cluster).updateWithExternal(external);
    }
    static fromJS(parameters, context = {}) {
        const { cluster, executor } = context;
        if (!parameters.name)
            throw new Error("DataCube must have a name");
        const introspection = parameters.introspection;
        if (introspection && DataCube.INTROSPECTION_VALUES.indexOf(introspection) === -1) {
            throw new Error(`invalid introspection value ${introspection}, must be one of ${DataCube.INTROSPECTION_VALUES.join(", ")}`);
        }
        const refreshRule = parameters.refreshRule ? refresh_rule_1.RefreshRule.fromJS(parameters.refreshRule) : null;
        let timeAttributeName = parameters.timeAttribute;
        if (cluster && cluster.type === "druid" && !timeAttributeName) {
            timeAttributeName = "__time";
        }
        const timeAttribute = timeAttributeName ? datareporter_plywood_1.$(timeAttributeName) : null;
        const attributeOverrides = datareporter_plywood_1.AttributeInfo.fromJSs(parameters.attributeOverrides || []);
        const attributes = datareporter_plywood_1.AttributeInfo.fromJSs(parameters.attributes || []);
        let derivedAttributes = null;
        if (parameters.derivedAttributes) {
            derivedAttributes = datareporter_plywood_1.Expression.expressionLookupFromJS(parameters.derivedAttributes);
        }
        let dimensions;
        let measures;
        try {
            dimensions = dimensions_1.Dimensions.fromJS(parameters.dimensions || []);
            measures = measures_1.Measures.fromJS(parameters.measures || []);
            if (timeAttribute && !dimensions.getDimensionByExpression(timeAttribute)) {
                dimensions = dimensions.prepend(new dimension_1.Dimension({
                    name: timeAttributeName,
                    kind: "time",
                    formula: timeAttribute.toString()
                }));
            }
        }
        catch (e) {
            e.message = `data cube: '${parameters.name}', ${e.message}`;
            throw e;
        }
        const subsetFormula = parameters.subsetFormula || parameters.subsetFilter;
        let defaultFilter = null;
        if (parameters.defaultFilter) {
            try {
                defaultFilter = filter_1.Filter.fromJS(parameters.defaultFilter);
            }
            catch (_a) {
                console.warn(`Incorrect format of default filter for ${parameters.name}. Ignoring field`);
            }
        }
        let value = {
            executor: null,
            name: parameters.name,
            title: parameters.title,
            description: parameters.description,
            extendedDescription: parameters.extendedDescription,
            clusterName: parameters.clusterName,
            source: parameters.source,
            group: parameters.group,
            subsetFormula,
            rollup: parameters.rollup,
            options: parameters.options,
            introspection,
            attributeOverrides,
            attributes,
            derivedAttributes,
            dimensions,
            measures,
            timeAttribute,
            defaultTimezone: parameters.defaultTimezone ? chronoshift_1.Timezone.fromJS(parameters.defaultTimezone) : null,
            defaultFilter,
            defaultSplitDimensions: parameters.defaultSplitDimensions ? immutable_1.List(parameters.defaultSplitDimensions) : null,
            defaultDuration: parameters.defaultDuration ? chronoshift_1.Duration.fromJS(parameters.defaultDuration) : null,
            defaultSortMeasure: parameters.defaultSortMeasure || (measures.size() ? measures.first().name : null),
            defaultSelectedMeasures: parameters.defaultSelectedMeasures ? immutable_1.OrderedSet(parameters.defaultSelectedMeasures) : null,
            defaultPinnedDimensions: parameters.defaultPinnedDimensions ? immutable_1.OrderedSet(parameters.defaultPinnedDimensions) : null,
            maxSplits: parameters.maxSplits,
            maxQueries: parameters.maxQueries,
            refreshRule
        };
        if (cluster) {
            if (parameters.clusterName !== cluster.name)
                throw new Error(`Cluster name '${parameters.clusterName}' was given but '${cluster.name}' cluster was supplied (must match)`);
            value.cluster = cluster;
        }
        if (executor)
            value.executor = executor;
        return new DataCube(value);
    }
    valueOf() {
        let value = {
            name: this.name,
            title: this.title,
            description: this.description,
            extendedDescription: this.extendedDescription,
            clusterName: this.clusterName,
            source: this.source,
            group: this.group,
            subsetFormula: this.subsetFormula,
            rollup: this.rollup,
            options: this.options,
            introspection: this.introspection,
            attributeOverrides: this.attributeOverrides,
            attributes: this.attributes,
            derivedAttributes: this.derivedAttributes,
            dimensions: this.dimensions,
            measures: this.measures,
            timeAttribute: this.timeAttribute,
            defaultTimezone: this.defaultTimezone,
            defaultFilter: this.defaultFilter,
            defaultSplitDimensions: this.defaultSplitDimensions,
            defaultDuration: this.defaultDuration,
            defaultSortMeasure: this.defaultSortMeasure,
            defaultSelectedMeasures: this.defaultSelectedMeasures,
            defaultPinnedDimensions: this.defaultPinnedDimensions,
            refreshRule: this.refreshRule,
            maxSplits: this.maxSplits,
            maxQueries: this.maxQueries
        };
        if (this.cluster)
            value.cluster = this.cluster;
        if (this.executor)
            value.executor = this.executor;
        return value;
    }
    toJS() {
        let js = {
            name: this.name,
            title: this.title,
            description: this.description,
            clusterName: this.clusterName,
            source: this.source,
            dimensions: this.dimensions.toJS(),
            measures: this.measures.toJS(),
            refreshRule: this.refreshRule.toJS()
        };
        if (this.extendedDescription)
            js.extendedDescription = this.extendedDescription;
        if (this.group)
            js.group = this.group;
        if (this.introspection)
            js.introspection = this.introspection;
        if (this.subsetFormula)
            js.subsetFormula = this.subsetFormula;
        if (this.defaultTimezone)
            js.defaultTimezone = this.defaultTimezone.toJS();
        if (this.defaultFilter)
            js.defaultFilter = this.defaultFilter.toJS();
        if (this.defaultSplitDimensions)
            js.defaultSplitDimensions = this.defaultSplitDimensions.toArray();
        if (this.defaultDuration)
            js.defaultDuration = this.defaultDuration.toJS();
        if (this.defaultSortMeasure)
            js.defaultSortMeasure = this.defaultSortMeasure;
        if (this.defaultSelectedMeasures)
            js.defaultSelectedMeasures = this.defaultSelectedMeasures.toArray();
        if (this.defaultPinnedDimensions)
            js.defaultPinnedDimensions = this.defaultPinnedDimensions.toArray();
        if (this.rollup)
            js.rollup = true;
        if (this.maxSplits)
            js.maxSplits = this.maxSplits;
        if (this.maxQueries)
            js.maxQueries = this.maxQueries;
        if (this.timeAttribute)
            js.timeAttribute = this.timeAttribute.name;
        if (this.attributeOverrides.length)
            js.attributeOverrides = datareporter_plywood_1.AttributeInfo.toJSs(this.attributeOverrides);
        if (this.attributes.length)
            js.attributes = datareporter_plywood_1.AttributeInfo.toJSs(this.attributes);
        if (this.derivedAttributes)
            js.derivedAttributes = datareporter_plywood_1.Expression.expressionLookupToJS(this.derivedAttributes);
        if (Object.keys(this.options).length)
            js.options = this.options;
        return js;
    }
    toJSON() {
        return this.toJS();
    }
    toString() {
        return `[DataCube: ${this.name}]`;
    }
    equalsSource(source) {
        if (!Array.isArray(source))
            return this.source === source;
        if (!Array.isArray(this.source))
            return false;
        return array_1.shallowEqualArrays(this.source, source);
    }
    equals(other) {
        return DataCube.isDataCube(other) &&
            this.name === other.name &&
            this.title === other.title &&
            this.description === other.description &&
            this.extendedDescription === other.extendedDescription &&
            this.clusterName === other.clusterName &&
            this.equalsSource(other.source) &&
            this.group === other.group &&
            this.subsetFormula === other.subsetFormula &&
            this.rollup === other.rollup &&
            JSON.stringify(this.options) === JSON.stringify(other.options) &&
            this.introspection === other.introspection &&
            immutable_class_1.immutableArraysEqual(this.attributeOverrides, other.attributeOverrides) &&
            immutable_class_1.immutableArraysEqual(this.attributes, other.attributes) &&
            immutable_class_1.immutableLookupsEqual(this.derivedAttributes, other.derivedAttributes) &&
            this.dimensions.equals(other.dimensions) &&
            this.measures.equals(other.measures) &&
            immutable_class_1.immutableEqual(this.timeAttribute, other.timeAttribute) &&
            immutable_class_1.immutableEqual(this.defaultTimezone, other.defaultTimezone) &&
            immutable_class_1.immutableEqual(this.defaultFilter, other.defaultFilter) &&
            immutable_class_1.immutableEqual(this.defaultSplitDimensions, other.defaultSplitDimensions) &&
            immutable_class_1.immutableEqual(this.defaultDuration, other.defaultDuration) &&
            this.defaultSortMeasure === other.defaultSortMeasure &&
            Boolean(this.defaultSelectedMeasures) === Boolean(other.defaultSelectedMeasures) &&
            (!this.defaultSelectedMeasures || this.defaultSelectedMeasures.equals(other.defaultSelectedMeasures)) &&
            Boolean(this.defaultPinnedDimensions) === Boolean(other.defaultPinnedDimensions) &&
            (!this.defaultPinnedDimensions || this.defaultPinnedDimensions.equals(other.defaultPinnedDimensions)) &&
            this.maxSplits === other.maxSplits &&
            this.maxQueries === other.maxQueries &&
            this.refreshRule.equals(other.refreshRule);
    }
    parseDescription({ description, extendedDescription }) {
        if (!description) {
            return { description: "" };
        }
        if (extendedDescription) {
            return { description, extendedDescription };
        }
        const segments = description.split(/\n---\n/);
        if (segments.length === 0) {
            return { description };
        }
        return {
            description: segments[0],
            extendedDescription: segments.splice(1).join("\n---\n ")
        };
    }
    _validateDefaults() {
        const { measures, defaultSortMeasure } = this;
        if (defaultSortMeasure) {
            if (!measures.containsMeasureWithName(defaultSortMeasure)) {
                throw new Error(`can not find defaultSortMeasure '${defaultSortMeasure}' in data cube '${this.name}'`);
            }
        }
    }
    toExternal() {
        if (this.clusterName === "native")
            throw new Error("there is no external on a native data cube");
        const { cluster, options } = this;
        if (!cluster)
            throw new Error("must have a cluster");
        let externalValue = {
            engine: cluster.type,
            suppress: true,
            source: this.source,
            version: cluster.version,
            derivedAttributes: this.derivedAttributes,
            customAggregations: options.customAggregations,
            customTransforms: options.customTransforms,
            filter: this.subsetExpression
        };
        if (cluster.type === "druid") {
            externalValue.rollup = this.rollup;
            externalValue.timeAttribute = this.timeAttribute.name;
            externalValue.introspectionStrategy = cluster.getIntrospectionStrategy();
            externalValue.allowSelectQueries = true;
            let externalContext = options.druidContext || {};
            externalContext["timeout"] = cluster.getTimeout();
            externalValue.context = externalContext;
        }
        if (this.introspection === "none") {
            externalValue.attributes = datareporter_plywood_1.AttributeInfo.override(this.deduceAttributes(), this.attributeOverrides);
            externalValue.derivedAttributes = this.derivedAttributes;
        }
        else {
            // ToDo: else if (we know that it will GET introspect) and there are no overrides apply special attributes as overrides
            externalValue.attributeOverrides = this.attributeOverrides;
        }
        return datareporter_plywood_1.External.fromValue(externalValue);
    }
    getMainTypeContext() {
        const { attributes, derivedAttributes } = this;
        if (!attributes)
            return null;
        let datasetType = {};
        for (let attribute of attributes) {
            datasetType[attribute.name] = attribute;
        }
        for (let name in derivedAttributes) {
            datasetType[name] = {
                type: derivedAttributes[name].type
            };
        }
        return {
            type: "DATASET",
            datasetType
        };
    }
    getIssues() {
        const { dimensions, measures } = this;
        const mainTypeContext = this.getMainTypeContext();
        let issues = [];
        dimensions.forEachDimension(dimension => {
            try {
                dimension.expression.changeInTypeContext(mainTypeContext);
            }
            catch (e) {
                issues.push(`failed to validate dimension '${dimension.name}': ${e.message}`);
            }
        });
        const measureTypeContext = {
            type: "DATASET",
            datasetType: {
                main: mainTypeContext
            }
        };
        measures.forEachMeasure(measure => {
            try {
                measure.expression.changeInTypeContext(measureTypeContext);
            }
            catch (e) {
                let message = e.message;
                // If we get here it is possible that the user has misunderstood what the meaning of a measure is and have tried
                // to do something like $volume / $volume. We detect this here by checking for a reference to $main
                // If there is no main reference raise a more informative issue.
                if (measure.expression.getFreeReferences().indexOf("main") === -1) {
                    message = "measure must contain a $main reference";
                }
                issues.push(`failed to validate measure '${measure.name}': ${message}`);
            }
        });
        return issues;
    }
    updateCluster(cluster) {
        let value = this.valueOf();
        value.cluster = cluster;
        return new DataCube(value);
    }
    updateWithDataset(dataset) {
        if (this.clusterName !== "native")
            throw new Error("must be native to have a dataset");
        const executor = datareporter_plywood_1.basicExecutorFactory({
            datasets: { main: dataset }
        });
        return this.addAttributes(dataset.attributes).attachExecutor(executor);
    }
    updateWithExternal(external) {
        if (this.clusterName === "native")
            throw new Error("can not be native and have an external");
        const executor = datareporter_plywood_1.basicExecutorFactory({
            datasets: { main: external }
        });
        return this.addAttributes(external.attributes).attachExecutor(executor);
    }
    attachExecutor(executor) {
        let value = this.valueOf();
        value.executor = executor;
        return new DataCube(value);
    }
    toClientDataCube() {
        let value = this.valueOf();
        // Do not reveal the subset filter to the client
        value.subsetFormula = null;
        // No need for any introspection information on the client
        value.introspection = null;
        // No need for the overrides
        value.attributeOverrides = null;
        if (value.options.druidContext) {
            delete value.options.druidContext;
        }
        return new DataCube(value);
    }
    isQueryable() {
        return Boolean(this.executor);
    }
    getMaxTime(timekeeper) {
        const { name, refreshRule } = this;
        if (refreshRule.isRealtime()) {
            return timekeeper.now();
        }
        else if (refreshRule.isFixed()) {
            return refreshRule.time;
        }
        else { // refreshRule is query
            return timekeeper.getTime(name);
        }
    }
    getDimension(dimensionName) {
        return this.dimensions.getDimensionByName(dimensionName);
    }
    getDimensionByExpression(expression) {
        return this.dimensions.getDimensionByExpression(expression);
    }
    getDimensionsByKind(kind) {
        return this.dimensions.filterDimensions(dimension => dimension.kind === kind);
    }
    getSuggestedDimensions() {
        // TODO: actually implement this
        return [];
    }
    getTimeDimension() {
        return this.getDimensionByExpression(this.timeAttribute);
    }
    isTimeAttribute(ex) {
        return ex.equals(this.timeAttribute);
    }
    getMeasure(measureName) {
        return this.measures.getMeasureByName(measureName);
    }
    getSuggestedMeasures() {
        // TODO: actually implement this
        return [];
    }
    changeDimensions(dimensions) {
        let value = this.valueOf();
        value.dimensions = dimensions;
        return new DataCube(value);
    }
    rolledUp() {
        return this.clusterName === "druid";
    }
    /**
     * This function tries to deduce the structure of the dataCube based on the dimensions and measures defined within.
     * It should only be used when, for some reason, introspection if not available.
     */
    deduceAttributes() {
        const { dimensions, measures, timeAttribute, attributeOverrides } = this;
        let attributes = [];
        if (timeAttribute) {
            attributes.push(datareporter_plywood_1.AttributeInfo.fromJS({ name: timeAttribute.name, type: "TIME" }));
        }
        dimensions.forEachDimension(dimension => {
            const expression = dimension.expression;
            if (expression.equals(timeAttribute))
                return;
            const references = expression.getFreeReferences();
            for (let reference of references) {
                if (immutable_class_1.NamedArray.findByName(attributes, reference))
                    continue;
                attributes.push(datareporter_plywood_1.AttributeInfo.fromJS({ name: reference, type: "STRING" }));
            }
        });
        measures.forEachMeasure(measure => {
            const references = measure_1.Measure.getReferences(measure.expression);
            for (let reference of references) {
                if (immutable_class_1.NamedArray.findByName(attributes, reference))
                    continue;
                if (measure_1.Measure.hasCountDistinctReferences(measure.expression))
                    continue;
                if (measure_1.Measure.hasQuantileReferences(measure.expression))
                    continue;
                attributes.push(datareporter_plywood_1.AttributeInfo.fromJS({ name: reference, type: "NUMBER" }));
            }
        });
        if (attributeOverrides.length) {
            attributes = datareporter_plywood_1.AttributeInfo.override(attributes, attributeOverrides);
        }
        return attributes;
    }
    addAttributes(newAttributes) {
        let { dimensions, measures, attributes } = this;
        const introspection = this.getIntrospection();
        if (introspection === "none")
            return this;
        const autofillDimensions = introspection === "autofill-dimensions-only" || introspection === "autofill-all";
        const autofillMeasures = introspection === "autofill-measures-only" || introspection === "autofill-all";
        const $main = datareporter_plywood_1.$("main");
        for (let newAttribute of newAttributes) {
            const { name, type, nativeType } = newAttribute;
            // Already exists as a current attribute
            if (attributes && immutable_class_1.NamedArray.findByName(attributes, name))
                continue;
            // Already exists as a current dimension or a measure
            const urlSafeName = general_1.makeUrlSafeName(name);
            if (this.getDimension(urlSafeName) || this.getMeasure(urlSafeName))
                continue;
            let expression;
            switch (type) {
                case "TIME":
                    if (!autofillDimensions)
                        continue;
                    expression = datareporter_plywood_1.$(name);
                    if (this.getDimensionByExpression(expression))
                        continue;
                    // Add to the start
                    dimensions = dimensions.prepend(new dimension_1.Dimension({
                        name: urlSafeName,
                        kind: "time",
                        formula: expression.toString()
                    }));
                    break;
                case "STRING":
                    if (!autofillDimensions)
                        continue;
                    expression = datareporter_plywood_1.$(name);
                    if (this.getDimensionByExpression(expression))
                        continue;
                    dimensions = dimensions.append(new dimension_1.Dimension({
                        name: urlSafeName,
                        formula: expression.toString()
                    }));
                    break;
                case "SET/STRING":
                    if (!autofillDimensions)
                        continue;
                    expression = datareporter_plywood_1.$(name);
                    if (this.getDimensionByExpression(expression))
                        continue;
                    dimensions = dimensions.append(new dimension_1.Dimension({
                        kind: "string",
                        multiValue: true,
                        name: urlSafeName,
                        formula: expression.toString()
                    }));
                    break;
                case "BOOLEAN":
                    if (!autofillDimensions)
                        continue;
                    expression = datareporter_plywood_1.$(name);
                    if (this.getDimensionByExpression(expression))
                        continue;
                    dimensions = dimensions.append(new dimension_1.Dimension({
                        name: urlSafeName,
                        kind: "boolean",
                        formula: expression.toString()
                    }));
                    break;
                case "NUMBER":
                case "NULL":
                    if (!autofillMeasures)
                        continue;
                    const newMeasures = measure_1.Measure.measuresFromAttributeInfo(newAttribute);
                    newMeasures.forEach(newMeasure => {
                        if (this.measures.getMeasureByExpression(newMeasure.expression))
                            return;
                        measures = (name === "count") ? measures.prepend(newMeasure) : measures.append(newMeasure);
                    });
                    break;
                default:
                    throw new Error(`unsupported attribute ${name}; type ${type}, native type ${nativeType}`);
            }
        }
        if (!this.rolledUp() && !measures.containsMeasureWithName("count")) {
            measures = measures.prepend(new measure_1.Measure({
                name: "count",
                formula: $main.count().toString()
            }));
        }
        let value = this.valueOf();
        value.attributes = attributes ? datareporter_plywood_1.AttributeInfo.override(attributes, newAttributes) : newAttributes;
        value.dimensions = dimensions;
        value.measures = measures;
        if (!value.defaultSortMeasure) {
            value.defaultSortMeasure = measures.size() ? measures.first().name : null;
        }
        if (!value.timeAttribute && dimensions.size && dimensions.first().kind === "time") {
            value.timeAttribute = dimensions.first().expression;
        }
        return new DataCube(value);
    }
    getIntrospection() {
        return this.introspection || DataCube.DEFAULT_INTROSPECTION;
    }
    getDefaultTimezone() {
        return this.defaultTimezone || DataCube.DEFAULT_DEFAULT_TIMEZONE;
    }
    getDefaultFilter() {
        const filter = this.defaultFilter || DataCube.DEFAULT_DEFAULT_FILTER;
        if (!this.timeAttribute)
            return filter;
        return filter.insertByIndex(0, new filter_clause_1.RelativeTimeFilterClause({
            period: filter_clause_1.TimeFilterPeriod.LATEST,
            duration: this.getDefaultDuration(),
            reference: this.getTimeDimension().name
        }));
    }
    getDefaultSplits() {
        if (this.defaultSplitDimensions) {
            const dimensions = this.defaultSplitDimensions.map(name => this.getDimension(name));
            //@ts-ignore
            return splits_1.Splits.fromDimensions(dimensions);
        }
        return DataCube.DEFAULT_DEFAULT_SPLITS;
    }
    getDefaultDuration() {
        return this.defaultDuration || DataCube.DEFAULT_DEFAULT_DURATION;
    }
    getDefaultSortMeasure() {
        return this.defaultSortMeasure;
    }
    getMaxSplits() {
        return general_1.isTruthy(this.maxSplits) ? this.maxSplits : DataCube.DEFAULT_MAX_SPLITS;
    }
    getMaxQueries() {
        return general_1.isTruthy(this.maxQueries) ? this.maxQueries : DataCube.DEFAULT_MAX_QUERIES;
    }
    getDefaultSelectedMeasures() {
        return this.defaultSelectedMeasures || this.measures.getFirstNMeasureNames(4);
    }
    getDefaultPinnedDimensions() {
        return this.defaultPinnedDimensions || immutable_1.OrderedSet([]);
    }
    change(propertyName, newValue) {
        let v = this.valueOf();
        if (!v.hasOwnProperty(propertyName)) {
            throw new Error(`Unknown property : ${propertyName}`);
        }
        v[propertyName] = newValue;
        return new DataCube(v);
    }
    changeDefaultSortMeasure(defaultSortMeasure) {
        return this.change("defaultSortMeasure", defaultSortMeasure);
    }
    changeTitle(title) {
        return this.change("title", title);
    }
    changeDescription(description) {
        return this.change("description", description);
    }
    changeMeasures(measures) {
        return this.change("measures", measures);
    }
}
exports.DataCube = DataCube;
DataCube.DEFAULT_INTROSPECTION = "autofill-all";
DataCube.INTROSPECTION_VALUES = ["none", "no-autofill", "autofill-dimensions-only", "autofill-measures-only", "autofill-all"];
DataCube.DEFAULT_DEFAULT_TIMEZONE = chronoshift_1.Timezone.UTC;
DataCube.DEFAULT_DEFAULT_FILTER = filter_1.EMPTY_FILTER;
DataCube.DEFAULT_DEFAULT_SPLITS = splits_1.EMPTY_SPLITS;
DataCube.DEFAULT_DEFAULT_DURATION = chronoshift_1.Duration.fromJS("P1D");
DataCube.DEFAULT_MAX_SPLITS = 3;
DataCube.DEFAULT_MAX_QUERIES = 500;
check = DataCube;
//# sourceMappingURL=data-cube.js.map