"use strict";
/*
 * Copyright 2015-2016 Imply Data, Inc.
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Measure = void 0;
const immutable_class_1 = require("immutable-class");
const datareporter_plywood_1 = require("datareporter-plywood");
const general_1 = require("../../utils/general/general");
const some_1 = __importDefault(require("../../utils/plywood/some"));
const series_format_1 = require("../series/series-format");
class Measure extends immutable_class_1.BaseImmutable {
    constructor(parameters) {
        super(parameters);
        this.type = "measure";
        this.title = this.title || general_1.makeTitle(this.name);
        this.expression = datareporter_plywood_1.Expression.parse(this.formula);
        this.formatFn = series_format_1.formatFnFactory(this.getFormat());
    }
    static isMeasure(candidate) {
        return candidate instanceof Measure;
    }
    static getMeasure(measures, measureName) {
        if (!measureName)
            return null;
        measureName = measureName.toLowerCase(); // Case insensitive
        return measures.find(measure => measure.name.toLowerCase() === measureName);
    }
    static getReferences(ex) {
        let references = [];
        ex.forEach((sub) => {
            if (sub instanceof datareporter_plywood_1.RefExpression && sub.name !== "main") {
                references = references.concat(sub.name);
            }
        });
        return datareporter_plywood_1.deduplicateSort(references);
    }
    static hasCountDistinctReferences(ex) {
        return some_1.default(ex, e => e instanceof datareporter_plywood_1.CountDistinctExpression);
    }
    static hasQuantileReferences(ex) {
        return some_1.default(ex, e => e instanceof datareporter_plywood_1.QuantileExpression);
    }
    static measuresFromAttributeInfo(attribute) {
        const { name, nativeType } = attribute;
        const $main = datareporter_plywood_1.$("main");
        const ref = datareporter_plywood_1.$(name);
        if (nativeType) {
            if (nativeType === "hyperUnique" || nativeType === "thetaSketch" || nativeType === "HLLSketch") {
                return [
                    new Measure({
                        name: general_1.makeUrlSafeName(name),
                        formula: $main.countDistinct(ref).toString()
                    })
                ];
            }
            else if (nativeType === "approximateHistogram" || nativeType === "quantilesDoublesSketch") {
                return [
                    new Measure({
                        name: general_1.makeUrlSafeName(name + "_p98"),
                        formula: $main.quantile(ref, 0.98).toString()
                    })
                ];
            }
        }
        let expression = $main.sum(ref);
        const makerAction = attribute.maker;
        if (makerAction) {
            switch (makerAction.op) {
                case "min":
                    expression = $main.min(ref);
                    break;
                case "max":
                    expression = $main.max(ref);
                    break;
                // default: // sum, count
            }
        }
        return [new Measure({
                name: general_1.makeUrlSafeName(name),
                formula: expression.toString()
            })];
    }
    static fromJS(parameters) {
        // Back compat
        if (!parameters.formula) {
            let parameterExpression = parameters.expression;
            parameters.formula = (typeof parameterExpression === "string" ? parameterExpression : datareporter_plywood_1.$("main").sum(datareporter_plywood_1.$(parameters.name)).toString());
        }
        console.log(immutable_class_1.BaseImmutable.jsToValue(Measure.PROPERTIES, parameters), 'BaseImmutable.jsToValue(Measure.PROPERTIES, parameters)');
        return new Measure(immutable_class_1.BaseImmutable.jsToValue(Measure.PROPERTIES, parameters));
    }
    accept(visitor) {
        return visitor.visitMeasure(this);
    }
    equals(other) {
        return this === other || Measure.isMeasure(other) && super.equals(other);
    }
    getTitleWithUnits() {
        if (this.units) {
            return `${this.title} (${this.units})`;
        }
        else {
            return this.title;
        }
    }
    isApproximate() {
        return Measure.hasCountDistinctReferences(this.expression) || Measure.hasQuantileReferences(this.expression);
    }
    isQuantile() {
        return this.expression instanceof datareporter_plywood_1.QuantileExpression;
    }
}
exports.Measure = Measure;
Measure.DEFAULT_FORMAT = series_format_1.measureDefaultFormat;
Measure.DEFAULT_TRANSFORMATION = "none";
Measure.TRANSFORMATIONS = ["none", "percent-of-parent", "percent-of-total"];
Measure.PROPERTIES = [
    { name: "name", validate: general_1.verifyUrlSafeName },
    { name: "title", defaultValue: null },
    { name: "units", defaultValue: null },
    { name: "lowerIsBetter", defaultValue: false },
    { name: "formula" },
    { name: "description", defaultValue: undefined },
    { name: "format", defaultValue: Measure.DEFAULT_FORMAT },
    { name: "transformation", defaultValue: Measure.DEFAULT_TRANSFORMATION, possibleValues: Measure.TRANSFORMATIONS }
];
immutable_class_1.BaseImmutable.finalize(Measure);
//# sourceMappingURL=measure.js.map