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
exports.TimeShift = exports.isValidTimeShift = void 0;
const chronoshift_1 = require("chronoshift");
const filter_clause_1 = require("../filter-clause/filter-clause");
function isValidTimeShift(input) {
    try {
        TimeShift.fromJS(input);
        return true;
    }
    catch (_a) {
        return false;
    }
}
exports.isValidTimeShift = isValidTimeShift;
class TimeShift {
    constructor(value) {
        this.value = value;
    }
    static fromJS(timeShift) {
        if (timeShift === null) {
            return TimeShift.empty();
        }
        return new TimeShift(chronoshift_1.Duration.fromJS(timeShift));
    }
    static empty() {
        return new TimeShift(null);
    }
    static isTimeShift(candidate) {
        return candidate instanceof TimeShift;
    }
    equals(other) {
        if (!TimeShift.isTimeShift(other)) {
            return false;
        }
        if (this.value === null) {
            return other.value === null;
        }
        return this.value.equals(other.value);
    }
    toJS() {
        return this.value === null ? null : this.value.toJS();
    }
    toJSON() {
        return this.toJS();
    }
    valueOf() {
        return this.value;
    }
    isEmpty() {
        return this.value === null;
    }
    getDescription(capitalize = false) {
        return this.value.getDescription(capitalize);
    }
    toString() {
        return this.toJS() || "";
    }
    isValidForTimeFilter(timeFilter, timezone) {
        //@ts-ignore
        switch (timeFilter.type) {
            case filter_clause_1.FilterTypes.FIXED_TIME:
                const { values } = timeFilter;
                //@ts-ignore
                const range = values.first();
                //@ts-ignore
                return !range.intersects(range.shift(this.value, timezone));
            case filter_clause_1.FilterTypes.RELATIVE_TIME:
                //@ts-ignore
                const { duration } = timeFilter;
                return this.value.getCanonicalLength() >= duration.getCanonicalLength();
            default:
                throw new Error(`Unknown time filter: ${timeFilter}`);
        }
    }
    constrainToFilter(timeFilter, timezone) {
        return this.value && this.isValidForTimeFilter(timeFilter, timezone) ? this : TimeShift.empty();
    }
}
exports.TimeShift = TimeShift;
//# sourceMappingURL=time-shift.js.map