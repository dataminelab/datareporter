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
exports.measure = exports.measuresCollection = exports.measures = exports.complex = exports.quantile = exports.avg = exports.sum = exports.count = void 0;
const datareporter_plywood_1 = require("datareporter-plywood");
const measure_1 = require("../../models/measure/measure");
const measures_1 = require("../../models/measure/measures");
exports.count = measure("count", datareporter_plywood_1.$("main").count());
exports.sum = measure("sum", datareporter_plywood_1.$("main").sum(datareporter_plywood_1.$("row")));
exports.avg = measure("average", datareporter_plywood_1.$("main").average(datareporter_plywood_1.$("row")));
exports.quantile = measure("quantile", datareporter_plywood_1.$("main").quantile(datareporter_plywood_1.$("histogram"), 0.95, "tuning"));
exports.complex = measure("complex", datareporter_plywood_1.$("main").sum(datareporter_plywood_1.$("a")).divide(datareporter_plywood_1.$("b").multiply(100)));
exports.measures = [
    exports.count,
    exports.sum,
    exports.avg,
    exports.quantile,
    exports.complex
];
exports.measuresCollection = measures_1.Measures.fromMeasures(exports.measures);
function measure(name, expression, opts = {}) {
    return new measure_1.Measure(Object.assign({ name, formula: expression.toString() }, opts));
}
exports.measure = measure;
//# sourceMappingURL=measure.js.map