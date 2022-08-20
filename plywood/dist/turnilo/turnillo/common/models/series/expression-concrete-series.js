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
exports.ExpressionConcreteSeries = void 0;
const concrete_series_1 = require("./concrete-series");
class ExpressionConcreteSeries extends concrete_series_1.ConcreteSeries {
    constructor(series, measure, measures) {
        super(series, measure);
        //@ts-ignore
        this.expression = this.definition.expression.toConcreteExpression(measures);
    }
    reactKey(derivation) {
        //@ts-ignore
        return `${super.reactKey(derivation)}-${this.definition.expression.key()}`;
    }
    title(derivation) {
        return `${super.title(derivation)} ${this.expression.title()}`;
    }
    applyExpression(expression, name, nestingLevel) {
        return this.expression.toExpression(expression, name, nestingLevel);
    }
}
exports.ExpressionConcreteSeries = ExpressionConcreteSeries;
//# sourceMappingURL=expression-concrete-series.js.map