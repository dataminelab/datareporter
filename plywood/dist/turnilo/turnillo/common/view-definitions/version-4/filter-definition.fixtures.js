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
exports.previousTimeFilterDefinition = exports.currentTimeFilterDefinition = exports.flooredTimeFilterDefinition = exports.latestTimeFilterDefinition = exports.timeRangeFilterDefinition = exports.numberRangeFilterDefinition = exports.stringFilterDefinition = exports.booleanFilterDefinition = void 0;
const filter_definition_1 = require("./filter-definition");
function booleanFilterDefinition(ref, values, not = false) {
    return {
        ref,
        type: filter_definition_1.FilterType.boolean,
        not,
        values
    };
}
exports.booleanFilterDefinition = booleanFilterDefinition;
function stringFilterDefinition(ref, action, values, not = false) {
    return {
        ref,
        type: filter_definition_1.FilterType.string,
        action,
        not,
        values
    };
}
exports.stringFilterDefinition = stringFilterDefinition;
function numberRangeFilterDefinition(ref, start, end, bounds = "[)", not = false) {
    return {
        ref,
        type: filter_definition_1.FilterType.number,
        not,
        ranges: [{ start, end, bounds }]
    };
}
exports.numberRangeFilterDefinition = numberRangeFilterDefinition;
function timeRangeFilterDefinition(ref, start, end) {
    return {
        ref,
        type: filter_definition_1.FilterType.time,
        timeRanges: [{ start, end }]
    };
}
exports.timeRangeFilterDefinition = timeRangeFilterDefinition;
function latestTimeFilterDefinition(ref, multiple, duration, multiply = false) {
    return {
        ref,
        type: filter_definition_1.FilterType.time,
        timePeriods: [{ type: "latest", duration, step: multiple }]
    };
}
exports.latestTimeFilterDefinition = latestTimeFilterDefinition;
function flooredTimeFilterDefinition(ref, step, duration) {
    return {
        ref,
        type: filter_definition_1.FilterType.time,
        timePeriods: [{ type: "floored", duration, step }]
    };
}
exports.flooredTimeFilterDefinition = flooredTimeFilterDefinition;
function currentTimeFilterDefinition(ref, duration) {
    return flooredTimeFilterDefinition(ref, 1, duration);
}
exports.currentTimeFilterDefinition = currentTimeFilterDefinition;
function previousTimeFilterDefinition(ref, duration) {
    return flooredTimeFilterDefinition(ref, -1, duration);
}
exports.previousTimeFilterDefinition = previousTimeFilterDefinition;
//# sourceMappingURL=filter-definition.fixtures.js.map