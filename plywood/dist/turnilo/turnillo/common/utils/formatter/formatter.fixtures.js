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
exports.FormatterFixtures = void 0;
const chronoshift_1 = require("chronoshift");
const immutable_1 = require("immutable");
const date_range_1 = require("../../models/date-range/date-range");
const filter_clause_1 = require("../../models/filter-clause/filter-clause");
class FormatterFixtures {
    static fixedTimeFilter(start, end) {
        return new filter_clause_1.FixedTimeFilterClause({
            reference: "time",
            values: immutable_1.List.of(new date_range_1.DateRange({ start, end }))
        });
    }
    static previousDuration(duration) {
        return new filter_clause_1.RelativeTimeFilterClause({
            reference: "time",
            period: filter_clause_1.TimeFilterPeriod.PREVIOUS,
            duration: chronoshift_1.Duration.fromJS(duration)
        });
    }
    static currentDuration(duration) {
        return new filter_clause_1.RelativeTimeFilterClause({
            reference: "time",
            period: filter_clause_1.TimeFilterPeriod.CURRENT,
            duration: chronoshift_1.Duration.fromJS(duration)
        });
    }
    static latestDuration(duration) {
        return new filter_clause_1.RelativeTimeFilterClause({
            reference: "time",
            period: filter_clause_1.TimeFilterPeriod.LATEST,
            duration: chronoshift_1.Duration.fromJS(duration)
        });
    }
    static numberFilter() {
        return new filter_clause_1.NumberFilterClause({
            reference: "commentLength",
            not: true,
            values: immutable_1.List.of(new filter_clause_1.NumberRange({ start: 1, end: 3 }))
        });
    }
    static stringFilterShort() {
        return new filter_clause_1.StringFilterClause({
            action: filter_clause_1.StringFilterAction.IN,
            reference: "country",
            values: immutable_1.Set.of("iceland")
        });
    }
}
exports.FormatterFixtures = FormatterFixtures;
//# sourceMappingURL=formatter.fixtures.js.map