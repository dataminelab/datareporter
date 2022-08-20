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
exports.MeasureFixtures = void 0;
const measure_1 = require("./measure");
class MeasureFixtures {
    static wikiCountJS() {
        return {
            name: "count",
            title: "Count",
            formula: "$main.sum($count)"
        };
    }
    static previousWikiCountJS() {
        return {
            name: "_previous__count",
            title: "Count",
            formula: "$main.sum($count)"
        };
    }
    static deltaWikiCountJS() {
        return {
            name: "_delta__count",
            title: "Count",
            formula: "$main.sum($count)"
        };
    }
    static wikiCount() {
        return new measure_1.Measure({
            name: "count",
            title: "Count",
            formula: "$main.sum($count)"
        });
    }
    static wikiUniqueUsersJS() {
        return {
            name: "unique_users",
            title: "Unique Users",
            formula: "$main.countDistinct($unique_users)"
        };
    }
    static wikiUniqueUsers() {
        return new measure_1.Measure({
            name: "unique_users",
            title: "Unique Users",
            formula: "$main.countDistinct($unique_users)"
        });
    }
    static twitterCount() {
        return measure_1.Measure.fromJS({
            name: "count",
            formula: "$main.count()"
        });
    }
    static noTransformationMeasure() {
        return measure_1.Measure.fromJS({
            name: "items_measure",
            formula: "$main.sum($item)"
        });
    }
    static percentOfParentMeasure() {
        return measure_1.Measure.fromJS({
            name: "items_measure",
            formula: "$main.sum($item)",
            transformation: "percent-of-parent"
        });
    }
    static percentOfTotalMeasure() {
        return measure_1.Measure.fromJS({
            name: "items_measure",
            formula: "$main.sum($item)",
            transformation: "percent-of-total"
        });
    }
    static applyWithNoTransformation() {
        return {
            expression: {
                expression: {
                    name: "item",
                    op: "ref"
                },
                op: "sum",
                operand: {
                    name: "main",
                    op: "ref"
                }
            },
            name: "items_measure",
            op: "apply"
        };
    }
    static applyWithTransformationAtRootLevel() {
        return {
            expression: {
                expression: {
                    name: "item",
                    op: "ref"
                },
                op: "sum",
                operand: {
                    name: "main",
                    op: "ref"
                }
            },
            name: "__formula_items_measure",
            op: "apply"
        };
    }
    static applyWithTransformationAtLevel(level) {
        return {
            expression: {
                expression: {
                    op: "literal",
                    value: 100
                },
                op: "multiply",
                operand: {
                    expression: {
                        name: "__formula_items_measure",
                        nest: level,
                        op: "ref"
                    },
                    op: "divide",
                    operand: {
                        name: "__formula_items_measure",
                        op: "ref"
                    }
                }
            },
            name: "items_measure",
            op: "apply",
            operand: {
                expression: {
                    expression: {
                        name: "item",
                        op: "ref"
                    },
                    op: "sum",
                    operand: {
                        name: "main",
                        op: "ref"
                    }
                },
                name: "__formula_items_measure",
                op: "apply"
            }
        };
    }
}
exports.MeasureFixtures = MeasureFixtures;
//# sourceMappingURL=measure.fixtures.js.map