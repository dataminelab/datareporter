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
exports.MeasureGroupFixtures = void 0;
const measure_fixtures_1 = require("./measure.fixtures");
class MeasureGroupFixtures {
    static noTitleJS() {
        return {
            name: "dummyName",
            measures: [
                measure_fixtures_1.MeasureFixtures.wikiCountJS()
            ]
        };
    }
    static withTitleInferredJS() {
        return {
            name: "dummyName",
            title: "Dummy Name",
            measures: [
                measure_fixtures_1.MeasureFixtures.wikiCountJS()
            ]
        };
    }
    static noNameJS() {
        return {
            measures: [measure_fixtures_1.MeasureFixtures.wikiCountJS()]
        };
    }
    static noMeasuresJS() {
        return {
            name: "dummyName"
        };
    }
    static emptyMeasuresJS() {
        return {
            name: "dummyName",
            measures: []
        };
    }
    static wikiAddedJS() {
        return {
            name: "added_group",
            title: "Added Group",
            measures: [
                {
                    name: "added",
                    title: "Added",
                    formula: "$main.sum($added)"
                },
                {
                    name: "avg_added",
                    title: "Avg Added",
                    formula: "$main.average($added)"
                }
            ]
        };
    }
    static wikiDeltaJS() {
        return {
            name: "delta_group",
            title: "Delta Group",
            measures: [
                {
                    name: "delta",
                    title: "Delta",
                    formula: "$main.sum($delta)"
                },
                {
                    name: "avg_delta",
                    title: "Avg Delta",
                    formula: "$main.average($delta)"
                }
            ]
        };
    }
}
exports.MeasureGroupFixtures = MeasureGroupFixtures;
//# sourceMappingURL=measure-group.fixtures.js.map