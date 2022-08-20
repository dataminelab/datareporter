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
exports.ConcreteArithmeticOperation = exports.ArithmeticExpression = void 0;
const immutable_1 = require("immutable");
const datareporter_plywood_1 = require("datareporter-plywood");
const expression_1 = require("./expression");
const defaultExpression = {
    operation: null,
    reference: null
};
//@ts-ignore
class ArithmeticExpression extends immutable_1.Record(defaultExpression) {
    constructor(params) {
        super(params);
    }
    key() {
        //@ts-ignore
        return `${this.operation}__${this.reference}`;
    }
    toConcreteExpression(measures) {
        //@ts-ignore
        return new ConcreteArithmeticOperation(this.operation, measures.getMeasureByName(this.reference));
    }
}
exports.ArithmeticExpression = ArithmeticExpression;
class ConcreteArithmeticOperation {
    constructor(operation, measure) {
        this.operation = operation;
        this.measure = measure;
    }
    operationName() {
        switch (this.operation) {
            case expression_1.ExpressionSeriesOperation.SUBTRACT:
                return "minus";
            case expression_1.ExpressionSeriesOperation.MULTIPLY:
                return "times";
            case expression_1.ExpressionSeriesOperation.DIVIDE:
                return "by";
            case expression_1.ExpressionSeriesOperation.ADD:
                return "plus";
        }
    }
    title() {
        return ` ${this.operationName()} ${this.measure.title}`;
    }
    calculate(a) {
        const operand = this.measure.expression;
        switch (this.operation) {
            case expression_1.ExpressionSeriesOperation.SUBTRACT:
                return a.subtract(operand);
            case expression_1.ExpressionSeriesOperation.MULTIPLY:
                return a.multiply(operand);
            case expression_1.ExpressionSeriesOperation.DIVIDE:
                return a.divide(operand);
            case expression_1.ExpressionSeriesOperation.ADD:
                return a.add(operand);
        }
    }
    toExpression(expression, name, _nestingLevel) {
        return new datareporter_plywood_1.ApplyExpression({
            name,
            expression: this.calculate(expression)
        });
    }
}
exports.ConcreteArithmeticOperation = ConcreteArithmeticOperation;
//# sourceMappingURL=concreteArithmeticOperation.js.map