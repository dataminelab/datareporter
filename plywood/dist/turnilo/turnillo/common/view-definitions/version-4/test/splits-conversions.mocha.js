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
const chai_1 = require("chai");
const concrete_series_1 = require("../../../models/series/concrete-series");
const sort_1 = require("../../../models/sort/sort");
const split_fixtures_1 = require("../../../models/split/split.fixtures");
const splits_1 = require("../../../models/splits/splits");
const table_1 = require("../../../visualization-manifests/table/table");
const assertions_1 = require("../../test/assertions");
const essence_fixture_1 = require("../../test/essence.fixture");
const split_definition_fixtures_1 = require("../split-definition.fixtures");
const view_definition_4_fixture_1 = require("../view-definition-4.fixture");
const utils_1 = require("./utils");
describe("Splits", () => {
    const mockViewDefinitionWithSplits = (...splits) => view_definition_4_fixture_1.mockViewDefinition({
        splits,
        visualization: table_1.TABLE_MANIFEST.name,
        visualizationSettings: null
    });
    const mockEssenceWithSplits = (...splits) => essence_fixture_1.mockEssence({
        splits: splits_1.Splits.fromSplits(splits),
        //@ts-ignore
        visualization: table_1.TABLE_MANIFEST,
        visualizationSettings: table_1.TABLE_MANIFEST.visualizationSettings.defaults
    });
    describe("String Dimensions", () => {
        it("reads basic split", () => {
            utils_1.assertConversionToEssence(mockViewDefinitionWithSplits(split_definition_fixtures_1.stringSplitDefinition("string_a")), mockEssenceWithSplits(split_fixtures_1.stringSplitCombine("string_a")));
        });
        it("reads split with sort on measure", () => {
            utils_1.assertConversionToEssence(mockViewDefinitionWithSplits(split_definition_fixtures_1.stringSplitDefinition("string_a", { sort: { reference: "count" } })), mockEssenceWithSplits(split_fixtures_1.stringSplitCombine("string_a", { sort: { reference: "count" } })));
        });
        it("reads split with sort on measure in previous period", () => {
            utils_1.assertConversionToEssence(mockViewDefinitionWithSplits(split_definition_fixtures_1.stringSplitDefinition("string_a", { sort: { reference: "count", period: concrete_series_1.SeriesDerivation.PREVIOUS } })), mockEssenceWithSplits(split_fixtures_1.stringSplitCombine("string_a", { sort: { reference: "count", period: concrete_series_1.SeriesDerivation.PREVIOUS } })));
        });
        it("reads split with sort on measure in delta", () => {
            utils_1.assertConversionToEssence(mockViewDefinitionWithSplits(split_definition_fixtures_1.stringSplitDefinition("string_a", { sort: { reference: "count", period: concrete_series_1.SeriesDerivation.DELTA } })), mockEssenceWithSplits(split_fixtures_1.stringSplitCombine("string_a", { sort: { reference: "count", period: concrete_series_1.SeriesDerivation.DELTA } })));
        });
        it("reads split with descending sort", () => {
            utils_1.assertConversionToEssence(mockViewDefinitionWithSplits(split_definition_fixtures_1.stringSplitDefinition("string_a", { sort: { direction: sort_1.SortDirection.descending } })), mockEssenceWithSplits(split_fixtures_1.stringSplitCombine("string_a", { sort: { direction: sort_1.SortDirection.descending } })));
        });
        it("reads split with limit", () => {
            utils_1.assertConversionToEssence(mockViewDefinitionWithSplits(split_definition_fixtures_1.stringSplitDefinition("string_a", { limit: 10 })), mockEssenceWithSplits(split_fixtures_1.stringSplitCombine("string_a", { limit: 10 })));
        });
    });
    describe("Time Dimension", () => {
        it("reads basic split", () => {
            utils_1.assertConversionToEssence(mockViewDefinitionWithSplits(split_definition_fixtures_1.timeSplitDefinition("time", "P1D")), mockEssenceWithSplits(split_fixtures_1.timeSplitCombine("time", "P1D")));
        });
        it("reads split with granularity", () => {
            utils_1.assertConversionToEssence(mockViewDefinitionWithSplits(split_definition_fixtures_1.timeSplitDefinition("time", "PT2M")), mockEssenceWithSplits(split_fixtures_1.timeSplitCombine("time", "PT2M")));
        });
        it("reads split with sort on measure", () => {
            utils_1.assertConversionToEssence(mockViewDefinitionWithSplits(split_definition_fixtures_1.timeSplitDefinition("time", "P1D", { sort: { reference: "count" } })), mockEssenceWithSplits(split_fixtures_1.timeSplitCombine("time", "P1D", { sort: { reference: "count" } })));
        });
        it("reads split with sort on measure in previous period", () => {
            utils_1.assertConversionToEssence(mockViewDefinitionWithSplits(split_definition_fixtures_1.timeSplitDefinition("time", "P1D", { sort: { reference: "count", period: concrete_series_1.SeriesDerivation.PREVIOUS } })), mockEssenceWithSplits(split_fixtures_1.timeSplitCombine("time", "P1D", { sort: { reference: "count", period: concrete_series_1.SeriesDerivation.PREVIOUS } })));
        });
        it("reads split with sort on measure in delta", () => {
            utils_1.assertConversionToEssence(mockViewDefinitionWithSplits(split_definition_fixtures_1.timeSplitDefinition("time", "P1D", { sort: { reference: "count", period: concrete_series_1.SeriesDerivation.DELTA } })), mockEssenceWithSplits(split_fixtures_1.timeSplitCombine("time", "P1D", { sort: { reference: "count", period: concrete_series_1.SeriesDerivation.DELTA } })));
        });
        it("reads split with descending sort", () => {
            utils_1.assertConversionToEssence(mockViewDefinitionWithSplits(split_definition_fixtures_1.timeSplitDefinition("time", "P1D", { sort: { direction: sort_1.SortDirection.descending } })), mockEssenceWithSplits(split_fixtures_1.timeSplitCombine("time", "P1D", { sort: { direction: sort_1.SortDirection.descending } })));
        });
        it("reads split with limit", () => {
            utils_1.assertConversionToEssence(mockViewDefinitionWithSplits(split_definition_fixtures_1.timeSplitDefinition("time", "P1D", { limit: 10 })), mockEssenceWithSplits(split_fixtures_1.timeSplitCombine("time", "P1D", { limit: 10 })));
        });
    });
    describe("Numeric Dimensions", () => {
        it("reads basic split", () => {
            utils_1.assertConversionToEssence(mockViewDefinitionWithSplits(split_definition_fixtures_1.numberSplitDefinition("numeric", 100)), mockEssenceWithSplits(split_fixtures_1.numberSplitCombine("numeric", 100)));
        });
        it("reads split with sort on measure", () => {
            utils_1.assertConversionToEssence(mockViewDefinitionWithSplits(split_definition_fixtures_1.numberSplitDefinition("numeric", 100, { sort: { reference: "count" } })), mockEssenceWithSplits(split_fixtures_1.numberSplitCombine("numeric", 100, { sort: { reference: "count" } })));
        });
        it("reads split with sort on measure in previous period", () => {
            utils_1.assertConversionToEssence(mockViewDefinitionWithSplits(split_definition_fixtures_1.numberSplitDefinition("numeric", 100, { sort: { reference: "count", period: concrete_series_1.SeriesDerivation.PREVIOUS } })), mockEssenceWithSplits(split_fixtures_1.numberSplitCombine("numeric", 100, { sort: { reference: "count", period: concrete_series_1.SeriesDerivation.PREVIOUS } })));
        });
        it("reads split with sort on measure in delta", () => {
            utils_1.assertConversionToEssence(mockViewDefinitionWithSplits(split_definition_fixtures_1.numberSplitDefinition("numeric", 100, { sort: { reference: "count", period: concrete_series_1.SeriesDerivation.DELTA } })), mockEssenceWithSplits(split_fixtures_1.numberSplitCombine("numeric", 100, { sort: { reference: "count", period: concrete_series_1.SeriesDerivation.DELTA } })));
        });
        it("reads split with descending sort", () => {
            utils_1.assertConversionToEssence(mockViewDefinitionWithSplits(split_definition_fixtures_1.numberSplitDefinition("numeric", 100, { sort: { direction: sort_1.SortDirection.descending } })), mockEssenceWithSplits(split_fixtures_1.numberSplitCombine("numeric", 100, { sort: { direction: sort_1.SortDirection.descending } })));
        });
        it("reads split with limit", () => {
            utils_1.assertConversionToEssence(mockViewDefinitionWithSplits(split_definition_fixtures_1.numberSplitDefinition("numeric", 100, { limit: 10 })), mockEssenceWithSplits(split_fixtures_1.numberSplitCombine("numeric", 100, { limit: 10 })));
        });
    });
    describe("Legacy previous/delta sort reference", () => {
        it("reads previous sort reference", () => {
            utils_1.assertConversionToEssence(mockViewDefinitionWithSplits(split_definition_fixtures_1.stringSplitDefinition("string_a", { sort: { reference: "_previous__count" } })), mockEssenceWithSplits(split_fixtures_1.stringSplitCombine("string_a", { sort: { reference: "count", period: concrete_series_1.SeriesDerivation.PREVIOUS } })));
        });
        it("reads delta sort reference", () => {
            utils_1.assertConversionToEssence(mockViewDefinitionWithSplits(split_definition_fixtures_1.stringSplitDefinition("string_a", { sort: { reference: "_delta__count" } })), mockEssenceWithSplits(split_fixtures_1.stringSplitCombine("string_a", { sort: { reference: "count", period: concrete_series_1.SeriesDerivation.DELTA } })));
        });
    });
    describe("Edge cases", () => {
        it("omits split on non existing dimension", () => {
            utils_1.assertConversionToEssence(mockViewDefinitionWithSplits(split_definition_fixtures_1.stringSplitDefinition("string_a"), split_definition_fixtures_1.stringSplitDefinition("foobar-dimension")), mockEssenceWithSplits(split_fixtures_1.stringSplitCombine("string_a")));
        });
        it("omits dimension with non existing sort reference", () => {
            utils_1.assertConversionToEssence(mockViewDefinitionWithSplits(split_definition_fixtures_1.stringSplitDefinition("string_a"), split_definition_fixtures_1.stringSplitDefinition("string_b", { sort: { reference: "foobar-dimension" } })), mockEssenceWithSplits(split_fixtures_1.stringSplitCombine("string_a")));
        });
        it.skip("omits split on single non existing dimension and advises visualisation change", () => {
            const viewDefinition = mockViewDefinitionWithSplits(split_definition_fixtures_1.stringSplitDefinition("foobar-dimension"));
            const essence = mockEssenceWithSplits();
            const resultEssence = utils_1.toEssence(viewDefinition);
            assertions_1.assertEqlEssenceWithoutVisResolve(resultEssence, essence);
            // TODO:
            /*
              Currently we run visResolve before constraining splits
              In this case that means that we satisfy predicate with at least one split.
              But in next step we will remove it and we get "valid" Table without splits.
             */
            chai_1.expect(resultEssence.visResolve.isManual()).to.be.true;
        });
    });
});
//# sourceMappingURL=splits-conversions.mocha.js.map