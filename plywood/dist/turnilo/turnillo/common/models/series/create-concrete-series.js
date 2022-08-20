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
const expression_concrete_series_1 = require("./expression-concrete-series");
const measure_concrete_series_1 = require("./measure-concrete-series");
const quantile_concrete_series_1 = require("./quantile-concrete-series");
const series_type_1 = require("./series-type");
function createConcreteSeries(series, measure, measures) {
    //@ts-ignore
    switch (series.type) {
        case series_type_1.SeriesType.MEASURE: {
            return new measure_concrete_series_1.MeasureConcreteSeries(series, measure);
        }
        case series_type_1.SeriesType.EXPRESSION: {
            return new expression_concrete_series_1.ExpressionConcreteSeries(series, measure, measures);
        }
        case series_type_1.SeriesType.QUANTILE: {
            return new quantile_concrete_series_1.QuantileConcreteSeries(series, measure);
        }
    }
}
exports.default = createConcreteSeries;
//# sourceMappingURL=create-concrete-series.js.map