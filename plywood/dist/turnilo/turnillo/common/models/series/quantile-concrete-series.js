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
exports.QuantileConcreteSeries = void 0;
const datareporter_plywood_1 = require("datareporter-plywood");
const concrete_series_1 = require("./concrete-series");
class QuantileConcreteSeries extends concrete_series_1.ConcreteSeries {
    constructor(series, measure) {
        super(series, measure);
    }
    title(derivation) {
        return `${super.title(derivation)} p${this.definition.formattedPercentile()}`;
    }
    applyExpression(quantileExpression, name, nestingLevel) {
        if (!(quantileExpression instanceof datareporter_plywood_1.QuantileExpression))
            throw new Error(`Expected QuantileExpression, got ${quantileExpression}`);
        //@ts-ignore
        const expression = new datareporter_plywood_1.QuantileExpression(Object.assign(Object.assign({}, quantileExpression.valueOf()), { value: this.definition.percentile / 100 }));
        return new datareporter_plywood_1.ApplyExpression({ name, expression });
    }
}
exports.QuantileConcreteSeries = QuantileConcreteSeries;
//# sourceMappingURL=quantile-concrete-series.js.map