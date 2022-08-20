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
exports.ConcretePercentExpression = exports.PercentExpression = void 0;
const immutable_1 = require("immutable");
const datareporter_plywood_1 = require("datareporter-plywood");
const expression_1 = require("./expression");
const defaultPercentOf = {
    operation: null
};
//@ts-ignore
class PercentExpression extends immutable_1.Record(defaultPercentOf) {
    constructor(params) {
        super(params);
    }
    key() {
        //@ts-ignore
        return this.operation;
    }
    toConcreteExpression(_measures) {
        //@ts-ignore
        return new ConcretePercentExpression(this.operation);
    }
}
exports.PercentExpression = PercentExpression;
class ConcretePercentExpression {
    constructor(operation) {
        this.operation = operation;
    }
    relativeNesting(nestingLevel) {
        switch (this.operation) {
            case expression_1.ExpressionSeriesOperation.PERCENT_OF_TOTAL:
                return nestingLevel;
            case expression_1.ExpressionSeriesOperation.PERCENT_OF_PARENT:
                return Math.min(nestingLevel, 1);
        }
    }
    toExpression(expression, name, nestingLevel) {
        const relativeNesting = this.relativeNesting(nestingLevel);
        const formulaName = `__formula_${name}`;
        if (relativeNesting < 0)
            throw new Error(`wrong nesting level: ${relativeNesting}`);
        return new datareporter_plywood_1.ApplyExpression({
            name,
            operand: new datareporter_plywood_1.ApplyExpression({ expression, name: formulaName }),
            expression: datareporter_plywood_1.$(formulaName).divide(datareporter_plywood_1.$(formulaName, relativeNesting)).fallback(0)
        });
    }
    title() {
        switch (this.operation) {
            case expression_1.ExpressionSeriesOperation.PERCENT_OF_PARENT:
                return "(% of Parent)";
            case expression_1.ExpressionSeriesOperation.PERCENT_OF_TOTAL:
                return "(% of Total)";
        }
    }
}
exports.ConcretePercentExpression = ConcretePercentExpression;
//# sourceMappingURL=percent.js.map