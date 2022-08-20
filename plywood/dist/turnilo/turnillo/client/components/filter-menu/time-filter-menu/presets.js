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
exports.getTimeFilterPresets = exports.constructFilter = exports.COMPARISON_PRESETS = exports.PREVIOUS_PRESETS = exports.CURRENT_PRESETS = exports.LATEST_PRESETS = void 0;
const datareporter_plywood_1 = require("datareporter-plywood");
const filter_clause_1 = require("../../../../common/models/filter-clause/filter-clause");
const time_shift_1 = require("../../../../common/models/time-shift/time-shift");
const time_1 = require("../../../../common/models/time/time");
const $MAX_TIME = datareporter_plywood_1.$(time_1.MAX_TIME_REF_NAME);
const $NOW = datareporter_plywood_1.$(time_1.NOW_REF_NAME);
exports.LATEST_PRESETS = [
    { name: "1H", duration: "PT1H" },
    { name: "6H", duration: "PT6H" },
    { name: "1D", duration: "P1D" },
    { name: "7D", duration: "P7D" },
    { name: "30D", duration: "P30D" }
];
exports.CURRENT_PRESETS = [
    { name: "D", duration: "P1D" },
    { name: "W", duration: "P1W" },
    { name: "M", duration: "P1M" },
    { name: "Q", duration: "P3M" },
    { name: "Y", duration: "P1Y" }
];
exports.PREVIOUS_PRESETS = [
    { name: "D", duration: "P1D" },
    { name: "W", duration: "P1W" },
    { name: "M", duration: "P1M" },
    { name: "Q", duration: "P3M" },
    { name: "Y", duration: "P1Y" }
];
exports.COMPARISON_PRESETS = [
    { label: "Off", shift: time_shift_1.TimeShift.empty() },
    { label: "D", shift: time_shift_1.TimeShift.fromJS("P1D") },
    { label: "W", shift: time_shift_1.TimeShift.fromJS("P1W") },
    { label: "M", shift: time_shift_1.TimeShift.fromJS("P1M") },
    { label: "Q", shift: time_shift_1.TimeShift.fromJS("P3M") }
];
function constructFilter(period, duration) {
    switch (period) {
        case filter_clause_1.TimeFilterPeriod.PREVIOUS:
            return $NOW.timeFloor(duration).timeRange(duration, -1);
        case filter_clause_1.TimeFilterPeriod.LATEST:
            return $MAX_TIME.timeRange(duration, -1);
        case filter_clause_1.TimeFilterPeriod.CURRENT:
            return $NOW.timeFloor(duration).timeRange(duration, 1);
        default:
            return null;
    }
}
exports.constructFilter = constructFilter;
function getTimeFilterPresets(period) {
    switch (period) {
        case filter_clause_1.TimeFilterPeriod.PREVIOUS:
            return exports.PREVIOUS_PRESETS;
        case filter_clause_1.TimeFilterPeriod.LATEST:
            return exports.LATEST_PRESETS;
        case filter_clause_1.TimeFilterPeriod.CURRENT:
            return exports.CURRENT_PRESETS;
    }
}
exports.getTimeFilterPresets = getTimeFilterPresets;
//# sourceMappingURL=presets.js.map