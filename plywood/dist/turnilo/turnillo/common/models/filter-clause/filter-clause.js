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
exports.fromJS = exports.toExpression = exports.isTimeFilter = exports.RelativeTimeFilterClause = exports.TimeFilterPeriod = exports.FixedTimeFilterClause = exports.StringFilterClause = exports.StringFilterAction = exports.NumberFilterClause = exports.NumberRange = exports.BooleanFilterClause = exports.FilterTypes = void 0;
const chronoshift_1 = require("chronoshift");
const immutable_1 = require("immutable");
const datareporter_plywood_1 = require("datareporter-plywood");
const presets_1 = require("../../../client/components/filter-menu/time-filter-menu/presets");
const date_range_1 = require("../date-range/date-range");
const time_1 = require("../time/time");
var FilterTypes;
(function (FilterTypes) {
    FilterTypes["BOOLEAN"] = "boolean";
    FilterTypes["NUMBER"] = "number";
    FilterTypes["STRING"] = "string";
    FilterTypes["FIXED_TIME"] = "fixed_time";
    FilterTypes["RELATIVE_TIME"] = "relative_time";
})(FilterTypes = exports.FilterTypes || (exports.FilterTypes = {}));
const defaultBooleanFilter = {
    reference: null,
    type: FilterTypes.BOOLEAN,
    not: false,
    values: immutable_1.Set([])
};
//@ts-ignore
class BooleanFilterClause extends immutable_1.Record(defaultBooleanFilter) {
    constructor(params) {
        super(params);
    }
}
exports.BooleanFilterClause = BooleanFilterClause;
//@ts-ignore
const defaultNumberRange = { start: null, end: null, bounds: "[)" };
//@ts-ignore
class NumberRange extends immutable_1.Record(defaultNumberRange) {
}
exports.NumberRange = NumberRange;
const defaultNumberFilter = {
    reference: null,
    type: FilterTypes.NUMBER,
    not: false,
    values: immutable_1.List([])
};
//@ts-ignore
class NumberFilterClause extends immutable_1.Record(defaultNumberFilter) {
    constructor(params) {
        super(params);
    }
}
exports.NumberFilterClause = NumberFilterClause;
var StringFilterAction;
(function (StringFilterAction) {
    StringFilterAction["IN"] = "in";
    StringFilterAction["MATCH"] = "match";
    StringFilterAction["CONTAINS"] = "contains";
})(StringFilterAction = exports.StringFilterAction || (exports.StringFilterAction = {}));
const defaultStringFilter = {
    reference: null,
    type: FilterTypes.STRING,
    not: false,
    action: StringFilterAction.CONTAINS,
    values: immutable_1.Set([])
};
//@ts-ignore
class StringFilterClause extends immutable_1.Record(defaultStringFilter) {
    constructor(params) {
        super(params);
    }
}
exports.StringFilterClause = StringFilterClause;
const defaultFixedTimeFilter = {
    reference: null,
    type: FilterTypes.FIXED_TIME,
    values: immutable_1.List([])
};
//@ts-ignore
class FixedTimeFilterClause extends immutable_1.Record(defaultFixedTimeFilter) {
    constructor(params) {
        super(params);
    }
}
exports.FixedTimeFilterClause = FixedTimeFilterClause;
var TimeFilterPeriod;
(function (TimeFilterPeriod) {
    TimeFilterPeriod["PREVIOUS"] = "previous";
    TimeFilterPeriod["LATEST"] = "latest";
    TimeFilterPeriod["CURRENT"] = "current";
})(TimeFilterPeriod = exports.TimeFilterPeriod || (exports.TimeFilterPeriod = {}));
const defaultRelativeTimeFilter = {
    reference: null,
    type: FilterTypes.RELATIVE_TIME,
    period: TimeFilterPeriod.CURRENT,
    duration: null
};
//@ts-ignore
class RelativeTimeFilterClause extends immutable_1.Record(defaultRelativeTimeFilter) {
    constructor(params) {
        super(params);
    }
    evaluate(now, maxTime, timezone) {
        //@ts-ignore
        const selection = presets_1.constructFilter(this.period, this.duration.toJS());
        const maxTimeMinuteTop = chronoshift_1.minute.shift(chronoshift_1.minute.floor(maxTime || now, timezone), timezone, 1);
        const datum = {};
        datum[time_1.NOW_REF_NAME] = now;
        datum[time_1.MAX_TIME_REF_NAME] = maxTimeMinuteTop;
        const { start, end } = selection.defineEnvironment({ timezone }).getFn()(datum);
        //@ts-ignore
        return new FixedTimeFilterClause({ reference: this.reference, values: immutable_1.List.of(new date_range_1.DateRange({ start, end })) });
    }
    equals(other) {
        return other instanceof RelativeTimeFilterClause &&
            //@ts-ignore
            this.reference === other.reference &&
            //@ts-ignore
            this.period === other.period &&
            //@ts-ignore
            this.duration.equals(other.duration);
    }
}
exports.RelativeTimeFilterClause = RelativeTimeFilterClause;
function isTimeFilter(clause) {
    return clause instanceof FixedTimeFilterClause || clause instanceof RelativeTimeFilterClause;
}
exports.isTimeFilter = isTimeFilter;
function toExpression(clause, { expression }) {
    //@ts-ignore
    const { type } = clause;
    switch (type) {
        case FilterTypes.BOOLEAN: {
            //@ts-ignore
            const { not, values } = clause;
            //@ts-ignore
            const boolExp = expression.overlap(datareporter_plywood_1.r(values.toArray()));
            return not ? boolExp.not() : boolExp;
        }
        case FilterTypes.NUMBER: {
            //@ts-ignore
            const { not, values } = clause;
            //@ts-ignore
            const elements = values.toArray().map(range => new datareporter_plywood_1.NumberRange(range));
            const set = new datareporter_plywood_1.Set({ elements, setType: "NUMBER_RANGE" });
            const numExp = expression.overlap(datareporter_plywood_1.r(set));
            return not ? numExp.not() : numExp;
        }
        case FilterTypes.STRING: {
            //@ts-ignore
            const { not, action, values } = clause;
            let stringExp = null;
            switch (action) {
                case StringFilterAction.CONTAINS:
                    //@ts-ignore
                    stringExp = expression.contains(datareporter_plywood_1.r(values.first()));
                    break;
                case StringFilterAction.IN:
                    //@ts-ignore
                    stringExp = expression.overlap(datareporter_plywood_1.r(values.toArray()));
                    break;
                case StringFilterAction.MATCH:
                    //@ts-ignore
                    stringExp = expression.match(values.first());
                    break;
            }
            return not ? stringExp.not() : stringExp;
        }
        case FilterTypes.FIXED_TIME: {
            //@ts-ignore
            const values = clause.values.toArray();
            const elements = values.map(value => new datareporter_plywood_1.TimeRange(value));
            const res = expression.overlap(datareporter_plywood_1.r(new datareporter_plywood_1.Set({ elements, setType: "TIME_RANGE" })));
            return res;
        }
        case FilterTypes.RELATIVE_TIME: {
            throw new Error("Can't call toExpression on RelativeFilterClause. Evaluate clause first");
        }
    }
}
exports.toExpression = toExpression;
function fromJS(parameters) {
    const { type, reference } = parameters;
    switch (type) {
        case FilterTypes.BOOLEAN: {
            const { not, values } = parameters;
            return new BooleanFilterClause({
                reference,
                not,
                values: immutable_1.Set(values)
            });
        }
        case FilterTypes.NUMBER: {
            const { not, values } = parameters;
            return new NumberFilterClause({
                reference,
                not,
                values: immutable_1.List(values)
            });
        }
        case FilterTypes.STRING: {
            const { not, values, action } = parameters;
            return new StringFilterClause({
                reference,
                action,
                not,
                values: immutable_1.Set(values)
            });
        }
        case FilterTypes.FIXED_TIME: {
            const { values } = parameters;
            return new FixedTimeFilterClause({
                reference,
                values: immutable_1.List(values)
            });
        }
        case FilterTypes.RELATIVE_TIME: {
            const { period, duration } = parameters;
            return new RelativeTimeFilterClause({
                reference,
                period,
                duration: chronoshift_1.Duration.fromJS(duration)
            });
        }
    }
}
exports.fromJS = fromJS;
//# sourceMappingURL=filter-clause.js.map