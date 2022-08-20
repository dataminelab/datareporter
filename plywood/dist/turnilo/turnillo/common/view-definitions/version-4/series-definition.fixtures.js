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
exports.quantileSeriesDefinition = exports.measureSeriesDefinition = exports.fromReference = void 0;
const series_format_1 = require("../../models/series/series-format");
const series_type_1 = require("../../models/series/series-type");
function fromReference(reference) {
    return { reference };
}
exports.fromReference = fromReference;
function measureSeriesDefinition(reference, format = series_format_1.DEFAULT_FORMAT) {
    return {
        reference,
        format,
        type: series_type_1.SeriesType.MEASURE
    };
}
exports.measureSeriesDefinition = measureSeriesDefinition;
function quantileSeriesDefinition(reference, percentile = 95, format = series_format_1.DEFAULT_FORMAT) {
    return {
        reference,
        format,
        percentile,
        type: series_type_1.SeriesType.QUANTILE
    };
}
exports.quantileSeriesDefinition = quantileSeriesDefinition;
//# sourceMappingURL=series-definition.fixtures.js.map