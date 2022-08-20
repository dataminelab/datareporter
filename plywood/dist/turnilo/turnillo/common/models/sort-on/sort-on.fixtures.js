"use strict";
/*
 * Copyright 2015-2016 Imply Data, Inc.
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
exports.SortOnFixtures = void 0;
const dimension_1 = require("../dimension/dimension");
const measure_1 = require("../measure/measure");
const measure_concrete_series_1 = require("../series/measure-concrete-series");
const sort_on_1 = require("./sort-on");
class SortOnFixtures {
    static get DEFAULT_A_JS() {
        return measure_1.Measure.fromJS({
            name: "price",
            title: "Price",
            formula: "$main.min($price)"
        });
    }
    static get DEFAULT_B_JS() {
        return measure_1.Measure.fromJS({
            name: "price",
            title: "Price",
            formula: "$main.sum($price)"
        });
    }
    static get DEFAULT_C_JS() {
        return dimension_1.Dimension.fromJS({
            name: "country",
            title: "important countries",
            formula: "$country",
            kind: "string"
        });
    }
    static defaultA() {
        return new sort_on_1.SeriesSortOn(measure_concrete_series_1.fromMeasure(SortOnFixtures.DEFAULT_A_JS));
    }
    static defaultB() {
        return new sort_on_1.SeriesSortOn(measure_concrete_series_1.fromMeasure(SortOnFixtures.DEFAULT_B_JS));
    }
    static defaultC() {
        return new sort_on_1.DimensionSortOn(SortOnFixtures.DEFAULT_C_JS);
    }
}
exports.SortOnFixtures = SortOnFixtures;
//# sourceMappingURL=sort-on.fixtures.js.map