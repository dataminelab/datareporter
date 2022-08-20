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
exports.MeasuresFixtures = void 0;
const measure_group_fixtures_1 = require("./measure-group.fixtures");
const measure_fixtures_1 = require("./measure.fixtures");
class MeasuresFixtures {
    static wikiNames() {
        return ["count", "added", "avg_added", "delta", "avg_delta"];
    }
    static wikiTitles() {
        return ["Count", "Added", "Avg Added", "Delta", "Avg Delta"];
    }
    static wikiJS() {
        return [
            measure_fixtures_1.MeasureFixtures.wikiCountJS(),
            {
                name: "other",
                title: "Other",
                measures: [
                    measure_group_fixtures_1.MeasureGroupFixtures.wikiAddedJS(),
                    measure_group_fixtures_1.MeasureGroupFixtures.wikiDeltaJS()
                ]
            }
        ];
    }
    static twitterJS() {
        return [
            {
                name: "count",
                title: "count",
                formula: "$main.count()"
            }
        ];
    }
}
exports.MeasuresFixtures = MeasuresFixtures;
//# sourceMappingURL=measures.fixtures.js.map