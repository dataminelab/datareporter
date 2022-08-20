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
exports.filterDefinitionConverter = exports.FilterType = void 0;
const chronoshift_1 = require("chronoshift");
const immutable_1 = require("immutable");
const date_range_1 = require("../../models/date-range/date-range");
const filter_clause_1 = require("../../models/filter-clause/filter-clause");
var FilterType;
(function (FilterType) {
    FilterType["boolean"] = "boolean";
    FilterType["number"] = "number";
    FilterType["string"] = "string";
    FilterType["time"] = "time";
})(FilterType = exports.FilterType || (exports.FilterType = {}));
const booleanFilterClauseConverter = {
    toFilterClause({ not, values }, { name }) {
        return new filter_clause_1.BooleanFilterClause({ reference: name, not, values: immutable_1.Set(values) });
    },
    //@ts-ignore
    fromFilterClause({ values, not, reference }) {
        return {
            type: FilterType.boolean,
            ref: reference,
            //@ts-ignore
            values: values.toArray(),
            not
        };
    }
};
const stringFilterClauseConverter = {
    toFilterClause({ action, not, values }, dimension) {
        if (action === null) {
            throw Error(`String filter action cannot be empty. Dimension: ${dimension}`);
        }
        if (!Object.values(filter_clause_1.StringFilterAction).includes(action)) {
            throw Error(`Unknown string filter action. Dimension: ${dimension}`);
        }
        if (action in [filter_clause_1.StringFilterAction.CONTAINS, filter_clause_1.StringFilterAction.MATCH] && values.length !== 1) {
            throw Error(`Wrong string filter values: ${values} for action: ${action}. Dimension: ${dimension}`);
        }
        const { name } = dimension;
        return new filter_clause_1.StringFilterClause({
            reference: name,
            action,
            not,
            values: immutable_1.Set(values)
        });
    },
    //@ts-ignore
    fromFilterClause({ action, reference, not, values }) {
        return {
            type: FilterType.string,
            ref: reference,
            action,
            //@ts-ignore
            values: values.toArray(),
            not
        };
    }
};
const numberFilterClauseConverter = {
    toFilterClause({ not, ranges }, { name }) {
        return new filter_clause_1.NumberFilterClause({ not, values: immutable_1.List(ranges.map(range => new filter_clause_1.NumberRange(range))), reference: name });
    },
    //@ts-ignore
    fromFilterClause({ not, reference, values }) {
        return {
            type: FilterType.number,
            ref: reference,
            not,
            //@ts-ignore
            ranges: values.toJS()
        };
    }
};
const timeFilterClauseConverter = {
    toFilterClause(filterModel, dimension) {
        const { timeRanges, timePeriods } = filterModel;
        if (timeRanges === undefined && timePeriods === undefined) {
            throw Error(`Time filter must have one of: timeRanges or timePeriods property. Dimension: ${dimension}`);
        }
        if (timeRanges !== undefined && timeRanges.length !== 1) {
            throw Error(`Time filter support a single timeRange only. Dimension: ${dimension}`);
        }
        if (timePeriods !== undefined && timePeriods.length !== 1) {
            throw Error(`Time filter support a single timePeriod only. Dimension: ${dimension}`);
        }
        const { name } = dimension;
        if (timeRanges !== undefined) {
            return new filter_clause_1.FixedTimeFilterClause({
                reference: name,
                values: immutable_1.List(timeRanges.map(range => new date_range_1.DateRange({ start: new Date(range.start), end: new Date(range.end) })))
            });
        }
        const { duration, step, type } = timePeriods[0];
        return new filter_clause_1.RelativeTimeFilterClause({
            reference: name,
            duration: chronoshift_1.Duration.fromJS(duration).multiply(Math.abs(step)),
            period: timeFilterPeriod(step, type)
        });
    },
    fromFilterClause(filterClause) {
        //@ts-ignore
        const { reference } = filterClause;
        if (filterClause instanceof filter_clause_1.RelativeTimeFilterClause) {
            //@ts-ignore
            const { duration, period } = filterClause;
            const step = period === filter_clause_1.TimeFilterPeriod.CURRENT ? 1 : -1;
            const type = period === filter_clause_1.TimeFilterPeriod.LATEST ? "latest" : "floored";
            return {
                type: FilterType.time,
                ref: reference,
                timePeriods: [{ duration: duration.toString(), step, type }]
            };
        }
        const { values } = filterClause;
        return {
            type: FilterType.time,
            ref: reference,
            //@ts-ignore
            timeRanges: values.map(value => ({ start: value.start.toISOString(), end: value.end.toISOString() })).toArray()
        };
    }
};
function timeFilterPeriod(step, type) {
    if (type === "latest") {
        return filter_clause_1.TimeFilterPeriod.LATEST;
    }
    if (step === 1) {
        return filter_clause_1.TimeFilterPeriod.CURRENT;
    }
    return filter_clause_1.TimeFilterPeriod.PREVIOUS;
}
const filterClauseConverters = {
    boolean: booleanFilterClauseConverter,
    number: numberFilterClauseConverter,
    string: stringFilterClauseConverter,
    time: timeFilterClauseConverter
};
exports.filterDefinitionConverter = {
    toFilterClause(clauseDefinition, dataCube) {
        if (clauseDefinition.ref == null) {
            throw new Error("Dimension name cannot be empty.");
        }
        const dimension = dataCube.getDimension(clauseDefinition.ref);
        if (dimension == null) {
            throw new Error(`Dimension ${clauseDefinition.ref} not found in data cube ${dataCube.name}.`);
        }
        const clauseConverter = filterClauseConverters[clauseDefinition.type];
        return clauseConverter.toFilterClause(clauseDefinition, dimension);
    },
    fromFilterClause(filterClause) {
        if (filterClause instanceof filter_clause_1.BooleanFilterClause) {
            return booleanFilterClauseConverter.fromFilterClause(filterClause);
        }
        if (filterClause instanceof filter_clause_1.NumberFilterClause) {
            return numberFilterClauseConverter.fromFilterClause(filterClause);
        }
        if (filterClause instanceof filter_clause_1.FixedTimeFilterClause || filterClause instanceof filter_clause_1.RelativeTimeFilterClause) {
            return timeFilterClauseConverter.fromFilterClause(filterClause);
        }
        if (filterClause instanceof filter_clause_1.StringFilterClause) {
            return stringFilterClauseConverter.fromFilterClause(filterClause);
        }
        throw Error(`Unrecognized filter clause type ${filterClause}`);
    }
};
//# sourceMappingURL=filter-definition.js.map