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
const filter_clause_1 = require("../../../models/filter-clause/filter-clause");
const filter_clause_fixtures_1 = require("../../../models/filter-clause/filter-clause.fixtures");
const filter_1 = require("../../../models/filter/filter");
const essence_fixture_1 = require("../../test/essence.fixture");
const filter_definition_1 = require("../filter-definition");
const filter_definition_fixtures_1 = require("../filter-definition.fixtures");
const view_definition_4_fixture_1 = require("../view-definition-4.fixture");
const utils_1 = require("./utils");
const mockViewDefinitionWithFilters = (...filters) => view_definition_4_fixture_1.mockViewDefinition({ filters });
const mockEssenceWithFilters = (...clauses) => essence_fixture_1.mockEssence({ filter: filter_1.Filter.fromClauses(clauses) });
const defaultTimeClauseDefinition = filter_definition_1.filterDefinitionConverter.fromFilterClause(essence_fixture_1.defaultTimeClause);
const mockViewDefinitionWithFiltersAndTime = (...filters) => view_definition_4_fixture_1.mockViewDefinition({ filters: [defaultTimeClauseDefinition, ...filters] });
const mockEssenceWithFiltersAndTime = (...clauses) => essence_fixture_1.mockEssence({ filter: filter_1.Filter.fromClauses([essence_fixture_1.defaultTimeClause, ...clauses]) });
describe("Filter", () => {
    describe("Clause conversion", () => {
        describe("Boolean Clause", () => {
            describe("Include mode", () => {
                it("single value", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFiltersAndTime(filter_definition_fixtures_1.booleanFilterDefinition("string_a", [true])), mockEssenceWithFiltersAndTime(filter_clause_fixtures_1.boolean("string_a", [true])));
                });
                it("multiple values", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFiltersAndTime(filter_definition_fixtures_1.booleanFilterDefinition("string_a", [true, false])), mockEssenceWithFiltersAndTime(filter_clause_fixtures_1.boolean("string_a", [true, false])));
                });
                it("heterogeneous values", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFiltersAndTime(filter_definition_fixtures_1.booleanFilterDefinition("string_a", [true, "Unknown"])), mockEssenceWithFiltersAndTime(filter_clause_fixtures_1.boolean("string_a", [true, "Unknown"])));
                });
            });
            describe("Exclude mode", () => {
                it("single value", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFiltersAndTime(filter_definition_fixtures_1.booleanFilterDefinition("string_a", [true], true)), mockEssenceWithFiltersAndTime(filter_clause_fixtures_1.boolean("string_a", [true], true)));
                });
                it("multiple values", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFiltersAndTime(filter_definition_fixtures_1.booleanFilterDefinition("string_a", [true, false], true)), mockEssenceWithFiltersAndTime(filter_clause_fixtures_1.boolean("string_a", [true, false], true)));
                });
                it("heterogeneous values", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFiltersAndTime(filter_definition_fixtures_1.booleanFilterDefinition("string_a", [true, "Unknown"], true)), mockEssenceWithFiltersAndTime(filter_clause_fixtures_1.boolean("string_a", [true, "Unknown"], true)));
                });
            });
        });
        describe("String Clause", () => {
            describe("IN action", () => {
                it("single value", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFiltersAndTime(filter_definition_fixtures_1.stringFilterDefinition("string_a", filter_clause_1.StringFilterAction.IN, ["bazz"])), mockEssenceWithFiltersAndTime(filter_clause_fixtures_1.stringWithAction("string_a", filter_clause_1.StringFilterAction.IN, ["bazz"])));
                });
                it("multiple values", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFiltersAndTime(filter_definition_fixtures_1.stringFilterDefinition("string_a", filter_clause_1.StringFilterAction.IN, ["bazz", "qvux"])), mockEssenceWithFiltersAndTime(filter_clause_fixtures_1.stringWithAction("string_a", filter_clause_1.StringFilterAction.IN, ["bazz", "qvux"])));
                });
                it("single value excluded", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFiltersAndTime(filter_definition_fixtures_1.stringFilterDefinition("string_a", filter_clause_1.StringFilterAction.IN, ["bazz"], true)), mockEssenceWithFiltersAndTime(filter_clause_fixtures_1.stringWithAction("string_a", filter_clause_1.StringFilterAction.IN, ["bazz"], true)));
                });
                it("multiple values excluded", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFiltersAndTime(filter_definition_fixtures_1.stringFilterDefinition("string_a", filter_clause_1.StringFilterAction.IN, ["bazz", "qvux"], true)), mockEssenceWithFiltersAndTime(filter_clause_fixtures_1.stringWithAction("string_a", filter_clause_1.StringFilterAction.IN, ["bazz", "qvux"], true)));
                });
            });
            describe("CONTAINS action", () => {
                it("single value", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFiltersAndTime(filter_definition_fixtures_1.stringFilterDefinition("string_a", filter_clause_1.StringFilterAction.CONTAINS, ["bazz"])), mockEssenceWithFiltersAndTime(filter_clause_fixtures_1.stringWithAction("string_a", filter_clause_1.StringFilterAction.CONTAINS, ["bazz"])));
                });
            });
            describe("MATCH action", () => {
                it("single value", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFiltersAndTime(filter_definition_fixtures_1.stringFilterDefinition("string_a", filter_clause_1.StringFilterAction.MATCH, ["^foo$"])), mockEssenceWithFiltersAndTime(filter_clause_fixtures_1.stringWithAction("string_a", filter_clause_1.StringFilterAction.MATCH, ["^foo$"])));
                });
            });
        });
        describe("Number Clause", () => {
            describe("Include mode", () => {
                it("open bounds", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFiltersAndTime(filter_definition_fixtures_1.numberRangeFilterDefinition("numeric", 1, 100, "()")), mockEssenceWithFiltersAndTime(filter_clause_fixtures_1.numberRange("numeric", 1, 100, "()")));
                });
                it("closed bounds", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFiltersAndTime(filter_definition_fixtures_1.numberRangeFilterDefinition("numeric", 1, 100, "[]")), mockEssenceWithFiltersAndTime(filter_clause_fixtures_1.numberRange("numeric", 1, 100, "[]")));
                });
                it("mixed bounds", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFiltersAndTime(filter_definition_fixtures_1.numberRangeFilterDefinition("numeric", 1, 100, "[)")), mockEssenceWithFiltersAndTime(filter_clause_fixtures_1.numberRange("numeric", 1, 100, "[)")));
                });
                it("empty start", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFiltersAndTime(filter_definition_fixtures_1.numberRangeFilterDefinition("numeric", null, 100, "[)")), mockEssenceWithFiltersAndTime(filter_clause_fixtures_1.numberRange("numeric", null, 100, "[)")));
                });
                it("empty end", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFiltersAndTime(filter_definition_fixtures_1.numberRangeFilterDefinition("numeric", 1, null, "[)")), mockEssenceWithFiltersAndTime(filter_clause_fixtures_1.numberRange("numeric", 1, null, "[)")));
                });
            });
            describe("Exclude mode", () => {
                it("open bounds", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFiltersAndTime(filter_definition_fixtures_1.numberRangeFilterDefinition("numeric", 1, 100, "()", true)), mockEssenceWithFiltersAndTime(filter_clause_fixtures_1.numberRange("numeric", 1, 100, "()", true)));
                });
                it("closed bounds", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFiltersAndTime(filter_definition_fixtures_1.numberRangeFilterDefinition("numeric", 1, 100, "[]", true)), mockEssenceWithFiltersAndTime(filter_clause_fixtures_1.numberRange("numeric", 1, 100, "[]", true)));
                });
                it("mixed bounds", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFiltersAndTime(filter_definition_fixtures_1.numberRangeFilterDefinition("numeric", 1, 100, "[)", true)), mockEssenceWithFiltersAndTime(filter_clause_fixtures_1.numberRange("numeric", 1, 100, "[)", true)));
                });
                it("empty start", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFiltersAndTime(filter_definition_fixtures_1.numberRangeFilterDefinition("numeric", null, 100, "[)", true)), mockEssenceWithFiltersAndTime(filter_clause_fixtures_1.numberRange("numeric", null, 100, "[)", true)));
                });
                it("empty end", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFiltersAndTime(filter_definition_fixtures_1.numberRangeFilterDefinition("numeric", 1, null, "[)", true)), mockEssenceWithFiltersAndTime(filter_clause_fixtures_1.numberRange("numeric", 1, null, "[)", true)));
                });
            });
        });
        describe("Time Clause", () => {
            it("fixed range", () => {
                const start = new Date("2018-01-01T00:00:00");
                const end = new Date("2018-01-02T00:00:00");
                utils_1.assertConversionToEssence(mockViewDefinitionWithFilters(filter_definition_fixtures_1.timeRangeFilterDefinition("time", start.toISOString(), end.toISOString())), mockEssenceWithFilters(filter_clause_fixtures_1.timeRange("time", start, end)));
            });
            describe("Latest period", () => {
                it("latest hour", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFilters(filter_definition_fixtures_1.latestTimeFilterDefinition("time", -1, "PT1H")), mockEssenceWithFilters(filter_clause_fixtures_1.timePeriod("time", "PT1H", filter_clause_1.TimeFilterPeriod.LATEST)));
                });
                it("latest two hours", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFilters(filter_definition_fixtures_1.latestTimeFilterDefinition("time", -2, "PT1H")), mockEssenceWithFilters(filter_clause_fixtures_1.timePeriod("time", "PT2H", filter_clause_1.TimeFilterPeriod.LATEST)));
                });
                it("latest fifteen minutes", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFilters(filter_definition_fixtures_1.latestTimeFilterDefinition("time", -15, "PT1M")), mockEssenceWithFilters(filter_clause_fixtures_1.timePeriod("time", "PT15M", filter_clause_1.TimeFilterPeriod.LATEST)));
                });
                it("latest day", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFilters(filter_definition_fixtures_1.latestTimeFilterDefinition("time", -1, "P1D")), mockEssenceWithFilters(filter_clause_fixtures_1.timePeriod("time", "P1D", filter_clause_1.TimeFilterPeriod.LATEST)));
                });
                it("latest two days", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFilters(filter_definition_fixtures_1.latestTimeFilterDefinition("time", -2, "P1D")), mockEssenceWithFilters(filter_clause_fixtures_1.timePeriod("time", "P2D", filter_clause_1.TimeFilterPeriod.LATEST)));
                });
                it("latest week", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFilters(filter_definition_fixtures_1.latestTimeFilterDefinition("time", -1, "P1W")), mockEssenceWithFilters(filter_clause_fixtures_1.timePeriod("time", "P1W", filter_clause_1.TimeFilterPeriod.LATEST)));
                });
                it("latest month", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFilters(filter_definition_fixtures_1.latestTimeFilterDefinition("time", -1, "P1M")), mockEssenceWithFilters(filter_clause_fixtures_1.timePeriod("time", "P1M", filter_clause_1.TimeFilterPeriod.LATEST)));
                });
                it("latest quarter", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFilters(filter_definition_fixtures_1.latestTimeFilterDefinition("time", -3, "P1M")), mockEssenceWithFilters(filter_clause_fixtures_1.timePeriod("time", "P3M", filter_clause_1.TimeFilterPeriod.LATEST)));
                });
                it("latest year", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFilters(filter_definition_fixtures_1.latestTimeFilterDefinition("time", -1, "P1Y")), mockEssenceWithFilters(filter_clause_fixtures_1.timePeriod("time", "P1Y", filter_clause_1.TimeFilterPeriod.LATEST)));
                });
                it("latest three years", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFilters(filter_definition_fixtures_1.latestTimeFilterDefinition("time", -3, "P1Y")), mockEssenceWithFilters(filter_clause_fixtures_1.timePeriod("time", "P3Y", filter_clause_1.TimeFilterPeriod.LATEST)));
                });
                it("handles multiplied duration", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFilters(filter_definition_fixtures_1.latestTimeFilterDefinition("time", -1, "P3Y")), mockEssenceWithFilters(filter_clause_fixtures_1.timePeriod("time", "P3Y", filter_clause_1.TimeFilterPeriod.LATEST)));
                });
            });
            describe("Current period", () => {
                it("current hour", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFilters(filter_definition_fixtures_1.currentTimeFilterDefinition("time", "PT1H")), mockEssenceWithFilters(filter_clause_fixtures_1.timePeriod("time", "PT1H", filter_clause_1.TimeFilterPeriod.CURRENT)));
                });
                it("current two hours", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFilters(filter_definition_fixtures_1.currentTimeFilterDefinition("time", "PT2H")), mockEssenceWithFilters(filter_clause_fixtures_1.timePeriod("time", "PT2H", filter_clause_1.TimeFilterPeriod.CURRENT)));
                });
                it("current fifteen minutes", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFilters(filter_definition_fixtures_1.currentTimeFilterDefinition("time", "PT15M")), mockEssenceWithFilters(filter_clause_fixtures_1.timePeriod("time", "PT15M", filter_clause_1.TimeFilterPeriod.CURRENT)));
                });
                it("current day", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFilters(filter_definition_fixtures_1.currentTimeFilterDefinition("time", "P1D")), mockEssenceWithFilters(filter_clause_fixtures_1.timePeriod("time", "P1D", filter_clause_1.TimeFilterPeriod.CURRENT)));
                });
                it("current two days", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFilters(filter_definition_fixtures_1.currentTimeFilterDefinition("time", "P2D")), mockEssenceWithFilters(filter_clause_fixtures_1.timePeriod("time", "P2D", filter_clause_1.TimeFilterPeriod.CURRENT)));
                });
                it("current week", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFilters(filter_definition_fixtures_1.currentTimeFilterDefinition("time", "P1W")), mockEssenceWithFilters(filter_clause_fixtures_1.timePeriod("time", "P1W", filter_clause_1.TimeFilterPeriod.CURRENT)));
                });
                it("current month", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFilters(filter_definition_fixtures_1.currentTimeFilterDefinition("time", "P1M")), mockEssenceWithFilters(filter_clause_fixtures_1.timePeriod("time", "P1M", filter_clause_1.TimeFilterPeriod.CURRENT)));
                });
                it("current quarter", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFilters(filter_definition_fixtures_1.currentTimeFilterDefinition("time", "P3M")), mockEssenceWithFilters(filter_clause_fixtures_1.timePeriod("time", "P3M", filter_clause_1.TimeFilterPeriod.CURRENT)));
                });
                it("current year", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFilters(filter_definition_fixtures_1.currentTimeFilterDefinition("time", "P1Y")), mockEssenceWithFilters(filter_clause_fixtures_1.timePeriod("time", "P1Y", filter_clause_1.TimeFilterPeriod.CURRENT)));
                });
                it("current three years", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFilters(filter_definition_fixtures_1.currentTimeFilterDefinition("time", "P3Y")), mockEssenceWithFilters(filter_clause_fixtures_1.timePeriod("time", "P3Y", filter_clause_1.TimeFilterPeriod.CURRENT)));
                });
            });
            describe("Previous period", () => {
                it("previous hour", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFilters(filter_definition_fixtures_1.previousTimeFilterDefinition("time", "PT1H")), mockEssenceWithFilters(filter_clause_fixtures_1.timePeriod("time", "PT1H", filter_clause_1.TimeFilterPeriod.PREVIOUS)));
                });
                it("previous two hours", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFilters(filter_definition_fixtures_1.previousTimeFilterDefinition("time", "PT2H")), mockEssenceWithFilters(filter_clause_fixtures_1.timePeriod("time", "PT2H", filter_clause_1.TimeFilterPeriod.PREVIOUS)));
                });
                it("previous fifteen minutes", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFilters(filter_definition_fixtures_1.previousTimeFilterDefinition("time", "PT15M")), mockEssenceWithFilters(filter_clause_fixtures_1.timePeriod("time", "PT15M", filter_clause_1.TimeFilterPeriod.PREVIOUS)));
                });
                it("previous day", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFilters(filter_definition_fixtures_1.previousTimeFilterDefinition("time", "P1D")), mockEssenceWithFilters(filter_clause_fixtures_1.timePeriod("time", "P1D", filter_clause_1.TimeFilterPeriod.PREVIOUS)));
                });
                it("previous two days", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFilters(filter_definition_fixtures_1.previousTimeFilterDefinition("time", "P2D")), mockEssenceWithFilters(filter_clause_fixtures_1.timePeriod("time", "P2D", filter_clause_1.TimeFilterPeriod.PREVIOUS)));
                });
                it("previous week", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFilters(filter_definition_fixtures_1.previousTimeFilterDefinition("time", "P1W")), mockEssenceWithFilters(filter_clause_fixtures_1.timePeriod("time", "P1W", filter_clause_1.TimeFilterPeriod.PREVIOUS)));
                });
                it("previous month", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFilters(filter_definition_fixtures_1.previousTimeFilterDefinition("time", "P1M")), mockEssenceWithFilters(filter_clause_fixtures_1.timePeriod("time", "P1M", filter_clause_1.TimeFilterPeriod.PREVIOUS)));
                });
                it("previous quarter", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFilters(filter_definition_fixtures_1.previousTimeFilterDefinition("time", "P3M")), mockEssenceWithFilters(filter_clause_fixtures_1.timePeriod("time", "P3M", filter_clause_1.TimeFilterPeriod.PREVIOUS)));
                });
                it("previous year", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFilters(filter_definition_fixtures_1.previousTimeFilterDefinition("time", "P1Y")), mockEssenceWithFilters(filter_clause_fixtures_1.timePeriod("time", "P1Y", filter_clause_1.TimeFilterPeriod.PREVIOUS)));
                });
                it("previous three years", () => {
                    utils_1.assertConversionToEssence(mockViewDefinitionWithFilters(filter_definition_fixtures_1.previousTimeFilterDefinition("time", "P3Y")), mockEssenceWithFilters(filter_clause_fixtures_1.timePeriod("time", "P3Y", filter_clause_1.TimeFilterPeriod.PREVIOUS)));
                });
            });
        });
    });
});
//# sourceMappingURL=filter-conversions.mocha.js.map