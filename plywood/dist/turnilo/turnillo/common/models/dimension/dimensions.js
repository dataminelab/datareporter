"use strict";
/*
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
exports.Dimensions = void 0;
const immutable_1 = require("immutable");
const immutable_class_1 = require("immutable-class");
const general_1 = require("../../utils/general/general");
const dimension_group_1 = require("./dimension-group");
class FlattenDimensionsWithGroupsVisitor {
    constructor() {
        this.items = immutable_1.List().asMutable();
    }
    visitDimension(dimension) {
        this.items.push(dimension);
    }
    visitDimensionGroup(dimensionGroup) {
        this.items.push(dimensionGroup);
        dimensionGroup.dimensions.forEach(dimensionOrGroup => dimensionOrGroup.accept(this));
    }
    getDimensionsWithGroups() {
        return this.items.toList();
    }
}
function findDuplicateNames(items) {
    return items
        .groupBy(dimension => dimension.name)
        .filter(names => names.count() > 1)
        .map((names, name) => name)
        .toList();
}
function filterDimensions(items) {
    return items.filter(item => item.type === "dimension");
}
class Dimensions {
    constructor(dimensions) {
        this.dimensions = [...dimensions];
        const flattenDimensionsWithGroupsVisitor = new FlattenDimensionsWithGroupsVisitor();
        this.dimensions.forEach(dimensionOrGroup => dimensionOrGroup.accept(flattenDimensionsWithGroupsVisitor));
        const flattenedDimensionsWithGroups = flattenDimensionsWithGroupsVisitor.getDimensionsWithGroups();
        const duplicateNames = findDuplicateNames(flattenedDimensionsWithGroups);
        if (duplicateNames.size > 0) {
            throw new Error(`found duplicate dimension or group with names: ${general_1.quoteNames(duplicateNames)}`);
        }
        this.flattenedDimensions = filterDimensions(flattenedDimensionsWithGroups);
    }
    static empty() {
        return new Dimensions([]);
    }
    static fromJS(parameters) {
        return new Dimensions(parameters.map(dimension_group_1.dimensionOrGroupFromJS));
    }
    static fromDimensions(dimensions) {
        return new Dimensions(dimensions);
    }
    accept(visitor) {
        return this.dimensions.map(dimensionOrGroup => dimensionOrGroup.accept(visitor));
    }
    size() {
        return this.flattenedDimensions.size;
    }
    first() {
        return this.flattenedDimensions.first();
    }
    equals(other) {
        return this === other || immutable_class_1.immutableArraysEqual(this.dimensions, other.dimensions);
    }
    mapDimensions(mapper) {
        return this.flattenedDimensions.map(mapper).toArray();
    }
    filterDimensions(predicate) {
        return this.flattenedDimensions.filter(predicate).toArray();
    }
    forEachDimension(sideEffect) {
        this.flattenedDimensions.forEach(sideEffect);
    }
    getDimensionByName(name) {
        return this.flattenedDimensions.find(dimension => dimension.name === name);
    }
    getDimensionByExpression(expression) {
        return this.flattenedDimensions.find(dimension => expression.equals(dimension.expression));
    }
    getDimensionNames() {
        return this.flattenedDimensions.map(dimension => dimension.name).toList();
    }
    containsDimensionWithName(name) {
        return this.flattenedDimensions.some(dimension => dimension.name === name);
    }
    append(...dimensions) {
        return new Dimensions([...this.dimensions, ...dimensions]);
    }
    prepend(...dimensions) {
        return new Dimensions([...dimensions, ...this.dimensions]);
    }
    toJS() {
        return this.dimensions.map(dimensionOrGroup => dimensionOrGroup.toJS());
    }
}
exports.Dimensions = Dimensions;
//# sourceMappingURL=dimensions.js.map