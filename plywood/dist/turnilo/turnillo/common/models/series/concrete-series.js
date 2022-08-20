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
exports.getNameWithDerivation = exports.titleWithDerivation = exports.ConcreteSeries = exports.SeriesDerivation = void 0;
const datareporter_plywood_1 = require("datareporter-plywood");
const time_shift_env_1 = require("../time-shift/time-shift-env");
const series_format_1 = require("./series-format");
var SeriesDerivation;
(function (SeriesDerivation) {
    SeriesDerivation["CURRENT"] = "";
    SeriesDerivation["PREVIOUS"] = "_previous__";
    SeriesDerivation["DELTA"] = "_delta__";
})(SeriesDerivation = exports.SeriesDerivation || (exports.SeriesDerivation = {}));
class ConcreteSeries {
    constructor(definition, measure) {
        this.definition = definition;
        this.measure = measure;
    }
    equals(other) {
        return this.definition.equals(other.definition) && this.measure.equals(other.measure);
    }
    reactKey(derivation = SeriesDerivation.CURRENT) {
        switch (derivation) {
            case SeriesDerivation.CURRENT:
                return this.definition.key();
            case SeriesDerivation.PREVIOUS:
                return `${this.definition.key()}-previous`;
            case SeriesDerivation.DELTA:
                return `${this.definition.key()}-delta`;
        }
    }
    plywoodKey(period = SeriesDerivation.CURRENT) {
        return this.definition.plywoodKey(period);
    }
    plywoodExpression(nestingLevel, timeShiftEnv) {
        const { expression } = this.measure;
        switch (timeShiftEnv.type) {
            case time_shift_env_1.TimeShiftEnvType.CURRENT:
                return this.applyExpression(expression, this.definition.plywoodKey(), nestingLevel);
            case time_shift_env_1.TimeShiftEnvType.WITH_PREVIOUS: {
                const currentName = this.plywoodKey();
                const previousName = this.plywoodKey(SeriesDerivation.PREVIOUS);
                const current = this.applyExpression(this.filterMainRefs(expression, timeShiftEnv.currentFilter), currentName, nestingLevel);
                const previous = this.applyExpression(this.filterMainRefs(expression, timeShiftEnv.previousFilter), previousName, nestingLevel);
                const delta = new datareporter_plywood_1.ApplyExpression({
                    name: this.plywoodKey(SeriesDerivation.DELTA),
                    expression: datareporter_plywood_1.$(currentName).subtract(datareporter_plywood_1.$(previousName))
                });
                return current.performAction(previous).performAction(delta);
            }
        }
    }
    filterMainRefs(exp, filter) {
        return exp.substitute(e => {
            if (e instanceof datareporter_plywood_1.RefExpression && e.name === "main") {
                return datareporter_plywood_1.$("main").filter(filter);
            }
            return null;
        });
    }
    selectValue(datum, period = SeriesDerivation.CURRENT) {
        const value = datum[this.plywoodKey(period)];
        if (typeof value === "number")
            return value;
        if (value === "NaN")
            return NaN;
        if (value === "Infinity")
            return Infinity;
        if (value === "-Infinity")
            return -Infinity;
        return NaN;
    }
    /**
     * @deprecated
     */
    formatter() {
        //@ts-ignore
        return series_format_1.seriesFormatter(this.definition.format, this.measure);
    }
    formatValue(datum, period = SeriesDerivation.CURRENT) {
        const value = this.selectValue(datum, period);
        //@ts-ignore
        const formatter = series_format_1.seriesFormatter(this.definition.format, this.measure);
        return formatter(value);
    }
    title(derivation = SeriesDerivation.CURRENT) {
        return `${titleWithDerivation(this.measure, derivation)}`;
    }
}
exports.ConcreteSeries = ConcreteSeries;
function titleWithDerivation({ title }, derivation) {
    switch (derivation) {
        case SeriesDerivation.CURRENT:
            return title;
        case SeriesDerivation.PREVIOUS:
            return `Previous ${title}`;
        case SeriesDerivation.DELTA:
            return `Difference ${title}`;
    }
}
exports.titleWithDerivation = titleWithDerivation;
/**
 * @deprecated
 * @param reference
 * @param derivation
 */
function getNameWithDerivation(reference, derivation) {
    return `${derivation}${reference}`;
}
exports.getNameWithDerivation = getNameWithDerivation;
//# sourceMappingURL=concrete-series.js.map