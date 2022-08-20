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
const data_cube_fixtures_1 = require("../../models/data-cube/data-cube.fixtures");
const filter_clause_1 = require("../../models/filter-clause/filter-clause");
const filter_clause_fixtures_1 = require("../../models/filter-clause/filter-clause.fixtures");
const view_definition_converter_2_1 = require("./view-definition-converter-2");
const view_definition_converter_2_fixtures_1 = require("./view-definition-converter-2.fixtures");
const currentDay = {
    op: "timeBucket",
    operand: {
        op: "ref",
        name: "n"
    },
    duration: "P1D"
};
const previousDay = {
    op: "timeRange",
    operand: {
        op: "timeFloor",
        operand: {
            op: "ref",
            name: "n"
        },
        duration: "P1D"
    },
    duration: "P1D",
    step: -1
};
const latestDay = {
    op: "timeRange",
    operand: {
        op: "ref",
        name: "m"
    },
    duration: "P1D",
    step: -1
};
describe("ViewDefinitionConverter2", () => {
    [
        { label: "current day", expression: currentDay, period: filter_clause_1.TimeFilterPeriod.CURRENT },
        { label: "previous day", expression: previousDay, period: filter_clause_1.TimeFilterPeriod.PREVIOUS },
        { label: "latest day", expression: latestDay, period: filter_clause_1.TimeFilterPeriod.LATEST }
    ].forEach(({ label, expression, period }) => {
        it(`converts ${label} bucket expression to time period`, () => {
            const viewDefinition = view_definition_converter_2_fixtures_1.ViewDefinitionConverter2Fixtures.withFilterExpression(expression);
            const essence = new view_definition_converter_2_1.ViewDefinitionConverter2().fromViewDefinition(viewDefinition, data_cube_fixtures_1.DataCubeFixtures.wiki());
            //@ts-ignore
            const convertedClause = essence.filter.clauses.first();
            const expectedClause = filter_clause_fixtures_1.timePeriod("time", "P1D", period);
            chai_1.expect(convertedClause).to.deep.equal(expectedClause);
        });
    });
    it("converts filter with lookup expressions", () => {
        const viewDefinition = view_definition_converter_2_fixtures_1.ViewDefinitionConverter2Fixtures.withFilterActions([
            {
                action: "in",
                expression: {
                    op: "chain",
                    expression: {
                        op: "ref",
                        name: "n"
                    },
                    actions: [
                        {
                            action: "timeFloor",
                            duration: "P1W"
                        },
                        {
                            action: "timeRange",
                            duration: "P1W",
                            step: -1
                        }
                    ]
                }
            },
            {
                action: "and",
                expression: {
                    op: "chain",
                    expression: {
                        op: "ref",
                        name: "page"
                    },
                    actions: [
                        {
                            action: "lookup",
                            lookup: "page_last_author"
                        },
                        {
                            action: "overlap",
                            expression: {
                                op: "literal",
                                value: {
                                    setType: "STRING",
                                    elements: [
                                        "TypeScript"
                                    ]
                                },
                                type: "SET"
                            }
                        }
                    ]
                }
            }
        ]);
        const convertedFilter = new view_definition_converter_2_1.ViewDefinitionConverter2().fromViewDefinition(viewDefinition, data_cube_fixtures_1.DataCubeFixtures.wiki()).filter;
        //@ts-ignore
        const convertedClause = convertedFilter.clauses.get(1);
        const expectedClause = filter_clause_fixtures_1.stringIn("page_last_author", ["TypeScript"]);
        chai_1.expect(convertedClause).to.deep.equal(expectedClause);
    });
    it("converts splits with lookup expressions", () => {
        const viewDefinition = view_definition_converter_2_fixtures_1.ViewDefinitionConverter2Fixtures.withSplits([{
                expression: {
                    op: "chain",
                    expression: {
                        op: "ref",
                        name: "page"
                    },
                    actions: [
                        {
                            action: "lookup",
                            lookup: "page_last_author"
                        }
                    ]
                },
                sortAction: {
                    action: "sort",
                    expression: {
                        op: "ref",
                        name: "count"
                    },
                    direction: "descending"
                },
                limitAction: {
                    action: "limit",
                    limit: 10
                }
            }]);
        //@ts-ignore
        const convertedSplits = new view_definition_converter_2_1.ViewDefinitionConverter2().fromViewDefinition(viewDefinition, data_cube_fixtures_1.DataCubeFixtures.wiki()).splits;
        chai_1.expect(convertedSplits.getSplit(0).reference).to.equal("page_last_author");
    });
});
//# sourceMappingURL=view-definition-converter-2.mocha.js.map