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
const measure_1 = require("../measure/measure");
const measure_fixtures_1 = require("../measure/measure.fixtures");
const concrete_series_1 = require("./concrete-series");
const quantile_series_1 = require("./quantile-series");
const quantileMeasure = measure_1.Measure.fromJS({
    name: "my-quantile",
    formula: "$main.quantile($histogram, 0.92, 'tuning')"
});
const quantileSeries = quantile_series_1.QuantileSeries.fromQuantileMeasure(quantileMeasure);
describe("QuantileSeries", () => {
    describe("fromQuantileMeasure", () => {
        it("throws when measure expression is not a quantile", () => {
            chai_1.expect(() => quantile_series_1.QuantileSeries.fromQuantileMeasure(measure_fixtures_1.MeasureFixtures.wikiCount())).throws(/Expected QuantileExpression/);
        });
        it("creates QuantileSeries from Measure with quantile expression", () => {
            chai_1.expect(quantile_series_1.QuantileSeries.fromQuantileMeasure(quantileMeasure)).to.be.instanceOf(quantile_series_1.QuantileSeries);
        });
        it("creates QuantileSeries with measure name as reference", () => {
            //@ts-ignore
            chai_1.expect(quantile_series_1.QuantileSeries.fromQuantileMeasure(quantileMeasure).reference).to.eq("my-quantile");
        });
        it("creates QuantileSeries with percentile taken from expression multiplied by 100", () => {
            //@ts-ignore
            chai_1.expect(quantile_series_1.QuantileSeries.fromQuantileMeasure(quantileMeasure).percentile).to.eq(92);
        });
    });
    describe("key", () => {
        it("constructs key from reference and percentile", () => {
            chai_1.expect(quantileSeries.key()).to.eq("my-quantile__p92");
        });
    });
    describe("plywoodKey", () => {
        it("constructs plywood key from reference, period and percentile for current period", () => {
            chai_1.expect(quantileSeries.plywoodKey(concrete_series_1.SeriesDerivation.CURRENT)).to.eq("my-quantile__p92");
        });
        it("constructs plywood key from reference, period and percentile for previous period", () => {
            chai_1.expect(quantileSeries.plywoodKey(concrete_series_1.SeriesDerivation.PREVIOUS)).to.eq("_previous__my-quantile__p92");
        });
        it("constructs plywood key from reference, period and percentile for delta", () => {
            chai_1.expect(quantileSeries.plywoodKey(concrete_series_1.SeriesDerivation.DELTA)).to.eq("_delta__my-quantile__p92");
        });
    });
});
//# sourceMappingURL=quantile-series.mocha.js.map