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
const series_format_1 = require("../../../models/series/series-format");
const series_fixtures_1 = require("../../../models/series/series.fixtures");
const essence_fixture_1 = require("../../test/essence.fixture");
const series_definition_fixtures_1 = require("../series-definition.fixtures");
const view_definition_4_fixture_1 = require("../view-definition-4.fixture");
const utils_1 = require("./utils");
describe("Series", () => {
    const mockViewDefinitionWithSeries = (...series) => view_definition_4_fixture_1.mockViewDefinition({ series });
    const mockEssenceWithSeries = (...series) => essence_fixture_1.mockEssence({ series: series_list_1.SeriesList.fromSeries(series) });
    describe("Just reference in Definition", () => {
        it("reads single series", () => {
            utils_1.assertConversionToEssence(mockViewDefinitionWithSeries(series_definition_fixtures_1.fromReference("count")), mockEssenceWithSeries(series_fixtures_1.measureSeries("count")));
        });
        it("reads multiple series", () => {
            utils_1.assertConversionToEssence(mockViewDefinitionWithSeries(series_definition_fixtures_1.fromReference("count"), series_definition_fixtures_1.fromReference("sum")), mockEssenceWithSeries(series_fixtures_1.measureSeries("count"), series_fixtures_1.measureSeries("sum")));
        });
        it("infers quantile series from reference to measure that has quantile expression", () => {
            utils_1.assertConversionToEssence(mockViewDefinitionWithSeries(series_definition_fixtures_1.fromReference("quantile")), mockEssenceWithSeries(series_fixtures_1.quantileSeries("quantile")));
        });
    });
    describe("Measure Series", () => {
        it("reads series", () => {
            utils_1.assertConversionToEssence(mockViewDefinitionWithSeries(series_definition_fixtures_1.measureSeriesDefinition("count")), mockEssenceWithSeries(series_fixtures_1.measureSeries("count")));
        });
        it("reads series with custom format", () => {
            utils_1.assertConversionToEssence(mockViewDefinitionWithSeries(series_definition_fixtures_1.measureSeriesDefinition("sum", series_format_1.PERCENT_FORMAT)), mockEssenceWithSeries(series_fixtures_1.measureSeries("sum", series_format_1.PERCENT_FORMAT)));
        });
    });
    describe("Quantile series", () => {
        it("reads series", () => {
            utils_1.assertConversionToEssence(mockViewDefinitionWithSeries(series_definition_fixtures_1.quantileSeriesDefinition("quantile")), mockEssenceWithSeries(series_fixtures_1.quantileSeries("quantile")));
        });
        it("reads series with custom format", () => {
            utils_1.assertConversionToEssence(mockViewDefinitionWithSeries(series_definition_fixtures_1.quantileSeriesDefinition("quantile", 90, series_format_1.PERCENT_FORMAT)), mockEssenceWithSeries(series_fixtures_1.quantileSeries("quantile", 90, series_format_1.PERCENT_FORMAT)));
        });
        it("reads series with custom percentile", () => {
            utils_1.assertConversionToEssence(mockViewDefinitionWithSeries(series_definition_fixtures_1.quantileSeriesDefinition("quantile", 90)), mockEssenceWithSeries(series_fixtures_1.quantileSeries("quantile", 90)));
        });
        it.skip("omit quantile series referencing non quantile measure", () => {
            utils_1.assertConversionToEssence(mockViewDefinitionWithSeries(series_definition_fixtures_1.fromReference("sum"), series_definition_fixtures_1.quantileSeriesDefinition("count")), mockEssenceWithSeries(series_fixtures_1.measureSeries("sum")));
        });
    });
    describe.skip("Edge cases", () => {
        it("omits series for non existing measure", () => {
            utils_1.assertConversionToEssence(mockViewDefinitionWithSeries(series_definition_fixtures_1.fromReference("sum"), series_definition_fixtures_1.fromReference("foobar")), mockEssenceWithSeries(series_fixtures_1.measureSeries("sum")));
        });
        it("omits measure series for non existing measure", () => {
            utils_1.assertConversionToEssence(mockViewDefinitionWithSeries(series_definition_fixtures_1.measureSeriesDefinition("sum"), series_definition_fixtures_1.measureSeriesDefinition("foobar")), mockEssenceWithSeries(series_fixtures_1.measureSeries("sum")));
        });
    });
});
//# sourceMappingURL=series-conversions.mocha.js.map