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
exports.getFormattedClause = exports.formatFilterClause = exports.formatSegment = exports.formatValue = exports.formatNumberRange = void 0;
const datareporter_plywood_1 = require("datareporter-plywood");
const constants_1 = require("../../../client/config/constants");
const date_range_1 = require("../../models/date-range/date-range");
const filter_clause_1 = require("../../models/filter-clause/filter-clause");
const time_1 = require("../time/time");
function formatNumberRange(value) {
    return `${formatValue(value.start || "any")} to ${formatValue(value.end || "any")}`;
}
exports.formatNumberRange = formatNumberRange;
function formatValue(value, timezone) {
    if (datareporter_plywood_1.NumberRange.isNumberRange(value)) {
        return formatNumberRange(value);
    }
    else if (datareporter_plywood_1.TimeRange.isTimeRange(value)) {
        //@ts-ignore
        return time_1.formatTimeRange(new date_range_1.DateRange(value), timezone);
    }
    else {
        return "" + value;
    }
}
exports.formatValue = formatValue;
function formatSegment(value, timezone) {
    if (datareporter_plywood_1.TimeRange.isTimeRange(value)) {
        return time_1.formatStartOfTimeRange(value, timezone);
    }
    else if (datareporter_plywood_1.NumberRange.isNumberRange(value)) {
        return formatNumberRange(value);
    }
    return String(value);
}
exports.formatSegment = formatSegment;
function formatFilterClause(dimension, clause, timezone) {
    const { title, values } = getFormattedClause(dimension, clause, timezone);
    return title ? `${title} ${values}` : values;
}
exports.formatFilterClause = formatFilterClause;
//@ts-ignore
function getFormattedStringClauseValues({ values, action }) {
    switch (action) {
        case filter_clause_1.StringFilterAction.MATCH:
            //@ts-ignore
            return `/${values.first()}/`;
        case filter_clause_1.StringFilterAction.CONTAINS:
            //@ts-ignore
            return `"${values.first()}"`;
        case filter_clause_1.StringFilterAction.IN:
            //@ts-ignore
            return values.count() > 1 ? `(${values.count()})` : values.first();
    }
}
function getFormattedBooleanClauseValues({ values }) {
    //@ts-ignore
    return values.count() > 1 ? `(${values.count()})` : values.first().toString();
}
function getFormattedNumberClauseValues(clause) {
    //@ts-ignore
    const { start, end } = clause.values.first();
    return `${start} to ${end}`;
}
function getFilterClauseValues(clause, timezone) {
    if (filter_clause_1.isTimeFilter(clause)) {
        return getFormattedTimeClauseValues(clause, timezone);
    }
    //@ts-ignore
    if (clause instanceof filter_clause_1.StringFilterClause) {
        return getFormattedStringClauseValues(clause);
    }
    //@ts-ignore
    if (clause instanceof filter_clause_1.BooleanFilterClause) {
        return getFormattedBooleanClauseValues(clause);
    }
    //@ts-ignore
    if (clause instanceof filter_clause_1.NumberFilterClause) {
        return getFormattedNumberClauseValues(clause);
    }
    throw new Error(`Unknown Filter Clause: ${clause}`);
}
function getClauseLabel(clause, dimension) {
    const dimensionTitle = dimension.title;
    if (filter_clause_1.isTimeFilter(clause))
        return "";
    //@ts-ignore
    const delimiter = clause instanceof filter_clause_1.StringFilterClause && [filter_clause_1.StringFilterAction.MATCH, filter_clause_1.StringFilterAction.CONTAINS].indexOf(clause.action) !== -1 ? " ~" : ":";
    //@ts-ignore
    const clauseValues = clause.values;
    if (clauseValues && clauseValues.count() > 1)
        return `${dimensionTitle}`;
    return `${dimensionTitle}${delimiter}`;
}
function getFormattedClause(dimension, clause, timezone) {
    return { title: getClauseLabel(clause, dimension), values: getFilterClauseValues(clause, timezone) };
}
exports.getFormattedClause = getFormattedClause;
function getFormattedTimeClauseValues(clause, timezone) {
    if (clause instanceof filter_clause_1.FixedTimeFilterClause) {
        //@ts-ignore
        return time_1.formatTimeRange(clause.values.get(0), timezone);
    }
    //@ts-ignore
    const { period, duration } = clause;
    switch (period) {
        case filter_clause_1.TimeFilterPeriod.PREVIOUS:
            return `${constants_1.STRINGS.previous} ${getQualifiedDurationDescription(duration)}`;
        case filter_clause_1.TimeFilterPeriod.CURRENT:
            return `${constants_1.STRINGS.current} ${getQualifiedDurationDescription(duration)}`;
        case filter_clause_1.TimeFilterPeriod.LATEST:
            return `${constants_1.STRINGS.latest} ${getQualifiedDurationDescription(duration)}`;
    }
}
function getQualifiedDurationDescription(duration) {
    if (duration.toString() === "P3M") {
        return constants_1.STRINGS.quarter.toLowerCase();
    }
    else {
        return duration.getDescription();
    }
}
//# sourceMappingURL=formatter.js.map