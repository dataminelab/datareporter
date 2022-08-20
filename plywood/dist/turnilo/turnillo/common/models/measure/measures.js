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
exports.Measures = void 0;
const immutable_1 = require("immutable");
const immutable_class_1 = require("immutable-class");
const functional_1 = require("../../utils/functional/functional");
const general_1 = require("../../utils/general/general");
const concrete_series_1 = require("../series/concrete-series");
const measure_group_1 = require("./measure-group");
class FlattenMeasuresWithGroupsVisitor {
    constructor() {
        this.items = immutable_1.List().asMutable();
    }
    visitMeasure(measure) {
        this.items.push(measure);
    }
    visitMeasureGroup(measureGroup) {
        this.items.push(measureGroup);
        measureGroup.measures.forEach(measureOrGroup => measureOrGroup.accept(this));
    }
    getMeasuresAndGroups() {
        return this.items.toList();
    }
}
function findDuplicateNames(items) {
    return items
        .groupBy(measure => measure.name)
        .filter(names => names.count() > 1)
        .map((names, name) => name)
        .toList();
}
function measureNamesWithForbiddenPrefix(items) {
    return items
        .map(measureOrGroup => {
        if (measure_group_1.isMeasureGroupJS(measureOrGroup))
            return null;
        if (measureOrGroup.name.startsWith(concrete_series_1.SeriesDerivation.PREVIOUS)) {
            return { name: measureOrGroup.name, prefix: concrete_series_1.SeriesDerivation.PREVIOUS };
        }
        if (measureOrGroup.name.startsWith(concrete_series_1.SeriesDerivation.DELTA)) {
            return { name: measureOrGroup.name, prefix: concrete_series_1.SeriesDerivation.DELTA };
        }
        return null;
    })
        .filter(functional_1.complement(general_1.isNil))
        .toList();
}
function filterMeasures(items) {
    return items.filter(item => item.type === "measure");
}
class Measures {
    constructor(measures) {
        this.measures = [...measures];
        const duplicateNamesFindingVisitor = new FlattenMeasuresWithGroupsVisitor();
        this.measures.forEach(measureOrGroup => measureOrGroup.accept(duplicateNamesFindingVisitor));
        const flattenedMeasuresWithGroups = duplicateNamesFindingVisitor.getMeasuresAndGroups();
        const duplicateNames = findDuplicateNames(flattenedMeasuresWithGroups);
        if (duplicateNames.size > 0) {
            throw new Error(`found duplicate measure or group with names: ${general_1.quoteNames(duplicateNames)}`);
        }
        // To do Find where object  
        // const invalidNames = measureNamesWithForbiddenPrefix(flattenedMeasuresWithGroups);
        // if (invalidNames.size > 0) {
        //   throw new Error(`found measure that starts with forbidden prefixes: ${invalidNames.map(({ name, prefix }) => `'${name}' (prefix: '${prefix}')`).toArray().join(", ")}`);
        // }
        this.flattenedMeasures = filterMeasures(flattenedMeasuresWithGroups);
    }
    static empty() {
        return new Measures([]);
    }
    static fromJS(parameters) {
        return new Measures(parameters.map(measure_group_1.measureOrGroupFromJS));
    }
    static fromMeasures(measures) {
        return new Measures(measures);
    }
    accept(visitor) {
        return this.measures.map(measureOrGroup => measureOrGroup.accept(visitor));
    }
    size() {
        return this.flattenedMeasures.size;
    }
    first() {
        return this.flattenedMeasures.first();
    }
    equals(other) {
        return this === other || immutable_class_1.immutableArraysEqual(this.measures, other.measures);
    }
    mapMeasures(mapper) {
        return this.flattenedMeasures.map(mapper).toArray();
    }
    filterMeasures(predicate) {
        return this.flattenedMeasures.filter(predicate).toArray();
    }
    getMeasuresByNames(names) {
        return names.map(name => this.getMeasureByName(name));
    }
    forEachMeasure(sideEffect) {
        this.flattenedMeasures.forEach(sideEffect);
    }
    getMeasureByName(measureName) {
        return this.flattenedMeasures.find(measure => measure.name === measureName);
    }
    hasMeasureByName(measureName) {
        return general_1.isTruthy(this.getMeasureByName(measureName));
    }
    getMeasureByExpression(expression) {
        return this.flattenedMeasures.find(measure => measure.expression.equals(expression));
    }
    getMeasureNames() {
        return this.flattenedMeasures.map(measure => measure.name).toList();
    }
    containsMeasureWithName(name) {
        return this.flattenedMeasures.some(measure => measure.name === name);
    }
    getFirstNMeasureNames(n) {
        return immutable_1.OrderedSet(this.flattenedMeasures.slice(0, n).map(measure => measure.name));
    }
    append(...measures) {
        return new Measures([...this.measures, ...measures]);
    }
    prepend(...measures) {
        return new Measures([...measures, ...this.measures]);
    }
    toJS() {
        return this.measures.map(measure => measure.toJS());
    }
}
exports.Measures = Measures;
//# sourceMappingURL=measures.js.map