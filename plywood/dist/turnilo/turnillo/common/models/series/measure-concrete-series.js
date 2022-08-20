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
exports.MeasureConcreteSeries = exports.fromMeasure = void 0;
const datareporter_plywood_1 = require("datareporter-plywood");
const concrete_series_1 = require("./concrete-series");
const measure_series_1 = require("./measure-series");
function fromMeasure(measure) {
    return new MeasureConcreteSeries(measure_series_1.MeasureSeries.fromMeasure(measure), measure);
}
exports.fromMeasure = fromMeasure;
class MeasureConcreteSeries extends concrete_series_1.ConcreteSeries {
    applyExpression(expression, name, nestingLevel) {
        return new datareporter_plywood_1.ApplyExpression({ expression, name });
    }
}
exports.MeasureConcreteSeries = MeasureConcreteSeries;
//# sourceMappingURL=measure-concrete-series.js.map