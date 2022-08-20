"use strict";
/*
 * Copyright 2017-2018 Allegro.pl
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
exports.mockEssence = exports.defaultTimeClause = void 0;
const chronoshift_1 = require("chronoshift");
const immutable_1 = require("immutable");
const essence_1 = require("../../models/essence/essence");
const filter_clause_1 = require("../../models/filter-clause/filter-clause");
const filter_1 = require("../../models/filter/filter");
const series_list_1 = require("../../models/series-list/series-list");
const splits_1 = require("../../models/splits/splits");
const time_shift_1 = require("../../models/time-shift/time-shift");
const totals_1 = require("../../visualization-manifests/totals/totals");
const data_cube_fixture_1 = require("./data-cube.fixture");
const measure_1 = require("./measure");
exports.defaultTimeClause = new filter_clause_1.RelativeTimeFilterClause({
    reference: "time",
    duration: chronoshift_1.Duration.fromCanonicalLength(chronoshift_1.day.canonicalLength),
    period: filter_clause_1.TimeFilterPeriod.PREVIOUS
});
// reuse this in fixtures (AnyObject - minimal case)
// random values for fields that are note essential for test case
const defaults = {
    filter: filter_1.Filter.fromClause(exports.defaultTimeClause),
    series: series_list_1.SeriesList.fromMeasures([measure_1.count, measure_1.sum]),
    splits: splits_1.Splits.fromSplits([]),
    pinnedDimensions: immutable_1.OrderedSet(["string_a"]),
    pinnedSort: "count",
    timeShift: time_shift_1.TimeShift.empty(),
    timezone: chronoshift_1.Timezone.UTC,
    visualization: totals_1.TOTALS_MANIFEST,
    visualizationSettings: null
};
function mockEssence(opts = {}) {
    return new essence_1.Essence(Object.assign(Object.assign({ dataCube: data_cube_fixture_1.dataCube }, defaults), opts));
}
exports.mockEssence = mockEssence;
//# sourceMappingURL=essence.fixture.js.map