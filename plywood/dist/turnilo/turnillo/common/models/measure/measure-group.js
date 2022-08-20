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
exports.MeasureGroup = exports.isMeasureGroupJS = exports.measureOrGroupFromJS = void 0;
const immutable_class_1 = require("immutable-class");
const general_1 = require("../../utils/general/general");
const measure_1 = require("./measure");
function measureOrGroupFromJS(measureOrGroup) {
    if (isMeasureGroupJS(measureOrGroup)) {
        return MeasureGroup.fromJS(measureOrGroup);
    }
    else {
        return measure_1.Measure.fromJS(measureOrGroup);
    }
}
exports.measureOrGroupFromJS = measureOrGroupFromJS;
function isMeasureGroupJS(measureOrGroupJS) {
    return measureOrGroupJS.measures !== undefined;
}
exports.isMeasureGroupJS = isMeasureGroupJS;
class MeasureGroup {
    constructor(parameters) {
        this.type = "group";
        this.name = parameters.name;
        this.title = parameters.title || general_1.makeTitle(parameters.name);
        this.description = parameters.description;
        this.measures = parameters.measures;
    }
    static fromJS(parameters) {
        const { name, title, description, measures } = parameters;
        if (name == null) {
            throw new Error("measure group requires a name");
        }
        if (measures == null || measures.length === 0) {
            throw new Error(`measure group '${name}' has no measures`);
        }
        return new MeasureGroup({
            name,
            title,
            description,
            measures: measures.map(measureOrGroupFromJS)
        });
    }
    static isMeasureGroup(candidate) {
        return candidate instanceof MeasureGroup;
    }
    accept(visitor) {
        return visitor.visitMeasureGroup(this);
    }
    equals(other) {
        return this === other
            || MeasureGroup.isMeasureGroup(other) && immutable_class_1.immutableArraysEqual(this.measures, other.measures);
    }
    toJS() {
        let measureGroup = {
            name: this.name,
            measures: this.measures.map(measure => measure.toJS()),
            title: this.title
        };
        if (this.description)
            measureGroup.description = this.description;
        return measureGroup;
    }
    toJSON() {
        return this.toJS();
    }
    valueOf() {
        let measureGroup = {
            name: this.name,
            title: this.title,
            measures: this.measures
        };
        if (this.description)
            measureGroup.description = this.description;
        return measureGroup;
    }
}
exports.MeasureGroup = MeasureGroup;
//# sourceMappingURL=measure-group.js.map