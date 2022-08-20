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
exports.DimensionGroup = exports.dimensionOrGroupFromJS = void 0;
const immutable_class_1 = require("immutable-class");
const general_1 = require("../../utils/general/general");
const dimension_1 = require("./dimension");
function dimensionOrGroupFromJS(dimensionOrGroup) {
    if (isDimensionGroupJS(dimensionOrGroup)) {
        return DimensionGroup.fromJS(dimensionOrGroup);
    }
    else {
        return dimension_1.Dimension.fromJS(dimensionOrGroup);
    }
}
exports.dimensionOrGroupFromJS = dimensionOrGroupFromJS;
function isDimensionGroupJS(dimensionOrGroup) {
    return dimensionOrGroup.dimensions !== undefined;
}
class DimensionGroup {
    constructor(parameters) {
        this.type = "group";
        this.name = parameters.name;
        this.title = parameters.title || general_1.makeTitle(parameters.name);
        this.description = parameters.description;
        this.dimensions = parameters.dimensions;
    }
    static fromJS(dimensionGroup) {
        const { name, title, dimensions, description } = dimensionGroup;
        if (name == null) {
            throw new Error("dimension group requires a name");
        }
        if (dimensions == null || dimensions.length === 0) {
            throw new Error(`dimension group '${name}' has no dimensions`);
        }
        return new DimensionGroup({
            name,
            title,
            description,
            dimensions: dimensions.map(dimensionOrGroupFromJS)
        });
    }
    static isDimensionGroup(candidate) {
        return candidate instanceof DimensionGroup;
    }
    accept(visitor) {
        return visitor.visitDimensionGroup(this);
    }
    equals(other) {
        return this === other
            || DimensionGroup.isDimensionGroup(other) && immutable_class_1.immutableArraysEqual(this.dimensions, other.dimensions);
    }
    toJS() {
        let dimensionGroup = {
            name: this.name,
            title: this.title,
            dimensions: this.dimensions.map(dimension => dimension.toJS())
        };
        if (this.description)
            dimensionGroup.description = this.description;
        return dimensionGroup;
    }
    toJSON() {
        return this.toJS();
    }
    valueOf() {
        let dimensionGroup = {
            name: this.name,
            title: this.title,
            dimensions: this.dimensions
        };
        if (this.description)
            dimensionGroup.description = this.description;
        return dimensionGroup;
    }
}
exports.DimensionGroup = DimensionGroup;
//# sourceMappingURL=dimension-group.js.map