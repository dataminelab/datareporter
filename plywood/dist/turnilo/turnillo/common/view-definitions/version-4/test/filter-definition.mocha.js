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
const chai_1 = require("chai");
const chronoshift_1 = require("chronoshift");
const data_cube_fixtures_1 = require("../../../models/data-cube/data-cube.fixtures");
const filter_clause_1 = require("../../../models/filter-clause/filter-clause");
const filter_clause_fixtures_1 = require("../../../models/filter-clause/filter-clause.fixtures");
const filter_definition_1 = require("../filter-definition");
const filter_definition_fixtures_1 = require("../filter-definition.fixtures");
describe("FilterDefinition v3", () => {
    const booleanFilterTests = [
        { dimension: "isRobot", exclude: false, values: [true] },
        { dimension: "isRobot", exclude: true, values: [false] },
        { dimension: "isRobot", exclude: false, values: [true, false] }
    ];
    describe.skip("boolean filter conversion to filter clause", () => {
        booleanFilterTests.forEach(({ dimension, exclude, values }) => {
            it(`converts filter clause with values: "${values}"`, () => {
                const filterClauseDefinition = filter_definition_fixtures_1.booleanFilterDefinition(dimension, values, exclude);
                const filterClause = filter_definition_1.filterDefinitionConverter.toFilterClause(filterClauseDefinition, data_cube_fixtures_1.DataCubeFixtures.wiki());
                const expected = filter_clause_fixtures_1.boolean(dimension, values, exclude);
                chai_1.expect(filterClause).to.deep.equal(expected);
            });
        });
    });
    describe("boolean filter conversion from filter clause", () => {
        booleanFilterTests.forEach(({ dimension, exclude, values }) => {
            it(`converts definition with values: "${values}"`, () => {
                const filterClause = filter_clause_fixtures_1.boolean(dimension, values, exclude);
                const filterClauseDefinition = filter_definition_1.filterDefinitionConverter.fromFilterClause(filterClause);
                const expected = filter_definition_fixtures_1.booleanFilterDefinition(dimension, values, exclude);
                chai_1.expect(filterClauseDefinition).to.deep.equal(expected);
            });
        });
    });
    const stringFilterTests = [
        { dimension: "channel", action: filter_clause_1.StringFilterAction.IN, exclude: false, values: ["en", "pl"] },
        { dimension: "channel", action: filter_clause_1.StringFilterAction.IN, exclude: true, values: ["en", "pl"] },
        { dimension: "channel", action: filter_clause_1.StringFilterAction.CONTAINS, exclude: false, values: ["en"] },
        { dimension: "channel", action: filter_clause_1.StringFilterAction.MATCH, exclude: false, values: ["^en$"] }
    ];
    describe.skip("string filter conversion to filter clause", () => {
        stringFilterTests.forEach(({ dimension, action, exclude, values }) => {
            it(`converts definition with "${action}" action`, () => {
                const filterClauseDefinition = filter_definition_fixtures_1.stringFilterDefinition(dimension, action, values, exclude);
                const filterClause = filter_definition_1.filterDefinitionConverter.toFilterClause(filterClauseDefinition, data_cube_fixtures_1.DataCubeFixtures.wiki());
                const expected = filter_clause_fixtures_1.stringWithAction(dimension, action, values, exclude);
                chai_1.expect(filterClause).to.deep.equal(expected);
            });
        });
    });
    describe("string filter conversion from filter clause", () => {
        stringFilterTests.forEach(({ dimension, action, exclude, values }) => {
            it(`converts clause with "${action}" action`, () => {
                const filterClause = filter_clause_fixtures_1.stringWithAction(dimension, action, values, exclude);
                const filterClauseDefinition = filter_definition_1.filterDefinitionConverter.fromFilterClause(filterClause);
                const expected = filter_definition_fixtures_1.stringFilterDefinition(dimension, action, values, exclude);
                chai_1.expect(filterClauseDefinition).to.deep.equal(expected);
            });
        });
    });
    const numberFilterTests = [
        { dimension: "commentLength", exclude: false, start: 1, end: null, bounds: "[)" },
        { dimension: "commentLength", exclude: true, start: null, end: 100, bounds: "()" },
        { dimension: "commentLength", exclude: false, start: 1, end: 2, bounds: "[)" },
        { dimension: "commentLength", exclude: false, start: 1, end: 1, bounds: "[]" }
    ];
    describe.skip("number filter conversion to filter clause", () => {
        numberFilterTests.forEach(({ dimension, exclude, start, end, bounds }) => {
            it(`converts range: ${start} - ${end} with bounds "${bounds}"`, () => {
                const filterClauseDefinition = filter_definition_fixtures_1.numberRangeFilterDefinition(dimension, start, end, bounds, exclude);
                const filterClause = filter_definition_1.filterDefinitionConverter.toFilterClause(filterClauseDefinition, data_cube_fixtures_1.DataCubeFixtures.wiki());
                const expected = filter_clause_fixtures_1.numberRange(dimension, start, end, bounds, exclude);
                chai_1.expect(filterClause).to.deep.equal(expected);
            });
        });
    });
    describe("number filter conversion from filter clause", () => {
        numberFilterTests.forEach(({ dimension, exclude, start, end, bounds }) => {
            it(`converts range: ${start} - ${end} with bounds "${bounds}"`, () => {
                const filterClause = filter_clause_fixtures_1.numberRange(dimension, start, end, bounds, exclude);
                const filterClauseDefinition = filter_definition_1.filterDefinitionConverter.fromFilterClause(filterClause);
                const expected = filter_definition_fixtures_1.numberRangeFilterDefinition(dimension, start, end, bounds, exclude);
                chai_1.expect(filterClauseDefinition).to.deep.equal(expected);
            });
        });
    });
    describe("time filter conversion", () => {
        it.skip("converts time range clause", () => {
            const startDate = new Date("2018-01-01T00:00:00");
            const endDate = new Date("2018-01-02T00:00:00");
            const filterClause = filter_clause_fixtures_1.timeRange("time", startDate, endDate);
            const filterClauseDefinition = filter_definition_1.filterDefinitionConverter.fromFilterClause(filterClause);
            const expected = filter_definition_fixtures_1.timeRangeFilterDefinition("time", startDate.toISOString(), endDate.toISOString());
            chai_1.expect(filterClauseDefinition).to.deep.equal(expected);
        });
        describe("latest time periods", () => {
            const latestTimeTests = [
                { multiple: -1, duration: "PT1H" },
                { multiple: -6, duration: "PT1H" },
                { multiple: -1, duration: "P1D" },
                { multiple: -7, duration: "P1D" },
                { multiple: -30, duration: "P1D" }
            ];
            describe.skip("filter conversion to filter clause", () => {
                latestTimeTests.forEach(({ duration, multiple }) => {
                    const multipliedDuration = chronoshift_1.Duration.fromJS(duration).multiply(Math.abs(multiple)).toJS();
                    it(`converts ${-multiple} of ${duration}`, () => {
                        const filterClauseDefinition = filter_definition_fixtures_1.latestTimeFilterDefinition("time", multiple, duration);
                        const filterClause = filter_definition_1.filterDefinitionConverter.toFilterClause(filterClauseDefinition, data_cube_fixtures_1.DataCubeFixtures.wiki());
                        const expected = filter_clause_fixtures_1.timePeriod("time", multipliedDuration, filter_clause_1.TimeFilterPeriod.LATEST);
                        chai_1.expect(filterClause).to.deep.equal(expected);
                    });
                });
            });
            describe("filter conversion from filter clause", () => {
                latestTimeTests.forEach(({ multiple, duration }) => {
                    const multipliedDuration = chronoshift_1.Duration.fromJS(duration).multiply(Math.abs(multiple)).toJS();
                    it(`converts ${-multiple} of ${duration}`, () => {
                        const filterClause = filter_clause_fixtures_1.timePeriod("time", multipliedDuration, filter_clause_1.TimeFilterPeriod.LATEST);
                        const filterClauseDefinition = filter_definition_1.filterDefinitionConverter.fromFilterClause(filterClause);
                        const expected = filter_definition_fixtures_1.latestTimeFilterDefinition("time", -1, multipliedDuration);
                        chai_1.expect(filterClauseDefinition).to.deep.equal(expected);
                    });
                });
            });
        });
        describe("floored time periods", () => {
            const flooredTimeDurations = [
                { duration: "P1D" },
                { duration: "P3D" },
                { duration: "P1W" },
                { duration: "P1M" },
                { duration: "P3M" },
                { duration: "P1Y" }
            ];
            const flooredTimeTests = [
                { periodName: "current", step: 1, period: filter_clause_1.TimeFilterPeriod.CURRENT },
                { periodName: "previous", step: -1, period: filter_clause_1.TimeFilterPeriod.PREVIOUS }
            ];
            describe.skip("definition to filter clause conversion", () => {
                flooredTimeTests.forEach(({ periodName, step, period }) => {
                    flooredTimeDurations.forEach(({ duration }) => {
                        it(`converts ${periodName} period ${duration}`, () => {
                            const filterClauseDefinition = filter_definition_fixtures_1.flooredTimeFilterDefinition("time", step, duration);
                            const filterClause = filter_definition_1.filterDefinitionConverter.toFilterClause(filterClauseDefinition, data_cube_fixtures_1.DataCubeFixtures.wiki());
                            const expected = filter_clause_fixtures_1.timePeriod("time", duration, period);
                            chai_1.expect(filterClause).to.deep.equal(expected);
                        });
                    });
                });
            });
            describe("filter clause to definition conversion", () => {
                flooredTimeTests.forEach(({ periodName, step, period }) => {
                    flooredTimeDurations.forEach(({ duration }) => {
                        it(`converts ${periodName} period ${duration}`, () => {
                            const filterClause = filter_clause_fixtures_1.timePeriod("time", duration, period);
                            const filterClauseDefinition = filter_definition_1.filterDefinitionConverter.fromFilterClause(filterClause);
                            const expected = filter_definition_fixtures_1.flooredTimeFilterDefinition("time", step, duration);
                            chai_1.expect(filterClauseDefinition).to.deep.equal(expected);
                        });
                    });
                });
            });
        });
    });
});
//# sourceMappingURL=filter-definition.mocha.js.map