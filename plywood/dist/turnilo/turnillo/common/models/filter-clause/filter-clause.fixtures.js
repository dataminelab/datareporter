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
exports.timePeriod = exports.timeRange = exports.numberRange = exports.boolean = exports.stringMatch = exports.stringContains = exports.stringIn = exports.stringWithAction = void 0;
const chronoshift_1 = require("chronoshift");
const immutable_1 = require("immutable");
const date_range_1 = require("../date-range/date-range");
const filter_clause_1 = require("./filter-clause");
function stringWithAction(reference, action, values, not = false) {
    if (action !== filter_clause_1.StringFilterAction.IN && values instanceof Array && values.length !== 1) {
        throw new Error(`Unsupported values: ${values} for action: ${action}.`);
    }
    return new filter_clause_1.StringFilterClause({ reference, action, values: immutable_1.Set(values), not });
}
exports.stringWithAction = stringWithAction;
function stringIn(reference, values, not = false) {
    return new filter_clause_1.StringFilterClause({ reference, action: filter_clause_1.StringFilterAction.IN, values: immutable_1.Set(values), not });
}
exports.stringIn = stringIn;
function stringContains(reference, value, not = false) {
    return new filter_clause_1.StringFilterClause({ reference, action: filter_clause_1.StringFilterAction.CONTAINS, values: immutable_1.Set.of(value), not });
}
exports.stringContains = stringContains;
function stringMatch(reference, value, not = false) {
    return new filter_clause_1.StringFilterClause({ reference, action: filter_clause_1.StringFilterAction.MATCH, values: immutable_1.Set.of(value), not });
}
exports.stringMatch = stringMatch;
function boolean(reference, values, not = false) {
    return new filter_clause_1.BooleanFilterClause({ reference, not, values: immutable_1.Set(values) });
}
exports.boolean = boolean;
function numberRange(reference, start, end, bounds = "[)", not = false) {
    return new filter_clause_1.NumberFilterClause({ reference, not, values: immutable_1.List.of(new filter_clause_1.NumberRange({ bounds, start, end })) });
}
exports.numberRange = numberRange;
function timeRange(reference, start, end) {
    return new filter_clause_1.FixedTimeFilterClause({ reference, values: immutable_1.List.of(new date_range_1.DateRange({ start, end })) });
}
exports.timeRange = timeRange;
function timePeriod(reference, duration, period) {
    return new filter_clause_1.RelativeTimeFilterClause({ reference, duration: chronoshift_1.Duration.fromJS(duration), period });
}
exports.timePeriod = timePeriod;
//# sourceMappingURL=filter-clause.fixtures.js.map