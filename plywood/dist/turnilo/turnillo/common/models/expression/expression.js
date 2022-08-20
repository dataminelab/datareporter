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
exports.fromJS = exports.ExpressionSeriesOperation = void 0;
const concreteArithmeticOperation_1 = require("./concreteArithmeticOperation");
const percent_1 = require("./percent");
var ExpressionSeriesOperation;
(function (ExpressionSeriesOperation) {
    ExpressionSeriesOperation["PERCENT_OF_PARENT"] = "percent_of_parent";
    ExpressionSeriesOperation["PERCENT_OF_TOTAL"] = "percent_of_total";
    ExpressionSeriesOperation["SUBTRACT"] = "subtract";
    ExpressionSeriesOperation["ADD"] = "add";
    ExpressionSeriesOperation["MULTIPLY"] = "multiply";
    ExpressionSeriesOperation["DIVIDE"] = "divide";
})(ExpressionSeriesOperation = exports.ExpressionSeriesOperation || (exports.ExpressionSeriesOperation = {}));
function fromJS(params) {
    const { operation } = params;
    switch (operation) {
        case ExpressionSeriesOperation.PERCENT_OF_TOTAL:
        case ExpressionSeriesOperation.PERCENT_OF_PARENT:
            return new percent_1.PercentExpression({ operation });
        case ExpressionSeriesOperation.SUBTRACT:
        case ExpressionSeriesOperation.ADD:
        case ExpressionSeriesOperation.MULTIPLY:
        case ExpressionSeriesOperation.DIVIDE:
            const reference = params.reference;
            return new concreteArithmeticOperation_1.ArithmeticExpression({ operation, reference });
    }
}
exports.fromJS = fromJS;
//# sourceMappingURL=expression.js.map