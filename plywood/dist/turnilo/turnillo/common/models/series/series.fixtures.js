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
exports.quantileSeries = exports.measureSeries = void 0;
const measure_series_1 = require("./measure-series");
const quantile_series_1 = require("./quantile-series");
const series_format_1 = require("./series-format");
function measureSeries(reference, format = series_format_1.DEFAULT_FORMAT) {
    return new measure_series_1.MeasureSeries({
        reference,
        format
    });
}
exports.measureSeries = measureSeries;
function quantileSeries(reference, percentile = 95, format = series_format_1.DEFAULT_FORMAT) {
    return new quantile_series_1.QuantileSeries({
        reference,
        percentile,
        format
    });
}
exports.quantileSeries = quantileSeries;
//# sourceMappingURL=series.fixtures.js.map