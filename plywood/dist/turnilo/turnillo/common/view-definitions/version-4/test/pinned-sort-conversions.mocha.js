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
const series_list_1 = require("../../../models/series-list/series-list");
const series_fixtures_1 = require("../../../models/series/series.fixtures");
const essence_fixture_1 = require("../../test/essence.fixture");
const series_definition_fixtures_1 = require("../series-definition.fixtures");
const view_definition_4_fixture_1 = require("../view-definition-4.fixture");
const utils_1 = require("./utils");
describe("PinnedSort", () => {
    it("reads pinned sort", () => {
        utils_1.assertConversionToEssence(view_definition_4_fixture_1.mockViewDefinition({ pinnedSort: "sum" }), essence_fixture_1.mockEssence({ pinnedSort: "sum" }));
    });
    it("reads pinned sort as key of complex series", () => {
        utils_1.assertConversionToEssence(view_definition_4_fixture_1.mockViewDefinition({
            series: [series_definition_fixtures_1.quantileSeriesDefinition("quantile", 90)],
            pinnedSort: "quantile__p90"
        }), essence_fixture_1.mockEssence({
            series: series_list_1.SeriesList.fromSeries([series_fixtures_1.quantileSeries("quantile", 90)]),
            pinnedSort: "quantile__p90"
        }));
    });
    it("reverts to default pinned sort when series does not exist", () => {
        utils_1.assertConversionToEssence(view_definition_4_fixture_1.mockViewDefinition({ pinnedSort: "foobar" }), essence_fixture_1.mockEssence({ pinnedSort: "count" }));
    });
    it("reverts to first available series when pinned sort series is not used", () => {
        utils_1.assertConversionToEssence(view_definition_4_fixture_1.mockViewDefinition({
            series: [series_definition_fixtures_1.fromReference("sum")],
            pinnedSort: "count"
        }), essence_fixture_1.mockEssence({
            series: series_list_1.SeriesList.fromSeries([series_fixtures_1.measureSeries("sum")]),
            pinnedSort: "sum"
        }));
    });
    it("reverts to default pinned sort when no series is used", () => {
        utils_1.assertConversionToEssence(view_definition_4_fixture_1.mockViewDefinition({
            series: [],
            pinnedSort: "sum"
        }), essence_fixture_1.mockEssence({
            series: series_list_1.EMPTY_SERIES,
            pinnedSort: "count"
        }));
    });
    it("does not recognize periods inside pinned sort key (sort only on current period)", () => {
        utils_1.assertConversionToEssence(view_definition_4_fixture_1.mockViewDefinition({
            series: [series_definition_fixtures_1.fromReference("sum")],
            pinnedSort: "__previous_sum"
        }), essence_fixture_1.mockEssence({
            series: series_list_1.SeriesList.fromSeries([series_fixtures_1.measureSeries("sum")]),
            pinnedSort: "sum"
        }));
    });
});
//# sourceMappingURL=pinned-sort-conversions.mocha.js.map