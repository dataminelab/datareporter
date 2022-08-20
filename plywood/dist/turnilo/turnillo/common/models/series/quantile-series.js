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
exports.QuantileSeries = void 0;
const immutable_1 = require("immutable");
const datareporter_plywood_1 = require("datareporter-plywood");
const concrete_series_1 = require("./concrete-series");
const series_format_1 = require("./series-format");
const series_type_1 = require("./series-type");
const defaultQuantileSeries = {
    format: series_format_1.DEFAULT_FORMAT,
    percentile: 95,
    reference: null,
    type: series_type_1.SeriesType.QUANTILE
};
//@ts-ignore
class QuantileSeries extends immutable_1.Record(defaultQuantileSeries) {
    static fromJS({ type, reference, percentile, format }) {
        return new QuantileSeries({
            type,
            reference,
            percentile,
            format: series_format_1.SeriesFormat.fromJS(format)
        });
    }
    static fromQuantileMeasure({ name: reference, expression }) {
        if (!(expression instanceof datareporter_plywood_1.QuantileExpression))
            throw new Error(`Expected QuantileExpression, got ${expression}`);
        return new QuantileSeries({
            reference,
            percentile: expression.value * 100
        });
    }
    constructor(params) {
        super(params);
    }
    formattedPercentile() {
        //@ts-ignore
        return this.percentile.toString();
    }
    key() {
        //@ts-ignore
        return `${this.reference}__p${this.formattedPercentile()}`;
    }
    plywoodKey(derivation = concrete_series_1.SeriesDerivation.CURRENT) {
        return concrete_series_1.getNameWithDerivation(this.key(), derivation);
    }
}
exports.QuantileSeries = QuantileSeries;
//# sourceMappingURL=quantile-series.js.map