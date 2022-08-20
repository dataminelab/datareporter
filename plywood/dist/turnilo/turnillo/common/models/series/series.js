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
exports.fromJS = exports.fromMeasure = void 0;
const datareporter_plywood_1 = require("datareporter-plywood");
const general_1 = require("../../utils/general/general");
const expression_series_1 = require("./expression-series");
const measure_series_1 = require("./measure-series");
const quantile_series_1 = require("./quantile-series");
const series_type_1 = require("./series-type");
function fromMeasure(measure) {
    if (measure.expression instanceof datareporter_plywood_1.QuantileExpression) {
        return quantile_series_1.QuantileSeries.fromQuantileMeasure(measure);
    }
    return measure_series_1.MeasureSeries.fromMeasure(measure);
}
exports.fromMeasure = fromMeasure;
function inferTypeAndConstruct({ expression }, params) {
    if (expression instanceof datareporter_plywood_1.QuantileExpression) {
        return quantile_series_1.QuantileSeries.fromJS(Object.assign(Object.assign({}, params), { type: series_type_1.SeriesType.QUANTILE }));
    }
    return measure_series_1.MeasureSeries.fromJS(Object.assign(Object.assign({}, params), { type: series_type_1.SeriesType.MEASURE }));
}
function fromJS(params, measure) {
    const { type } = params;
    if (!general_1.isTruthy(type))
        return inferTypeAndConstruct(measure, params);
    switch (type) {
        case series_type_1.SeriesType.MEASURE:
            return inferTypeAndConstruct(measure, params);
        case series_type_1.SeriesType.EXPRESSION:
            return expression_series_1.ExpressionSeries.fromJS(params);
        case series_type_1.SeriesType.QUANTILE:
            return quantile_series_1.QuantileSeries.fromJS(params);
    }
}
exports.fromJS = fromJS;
//# sourceMappingURL=series.js.map