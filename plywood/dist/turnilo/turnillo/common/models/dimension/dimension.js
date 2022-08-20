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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dimension = exports.BucketingStrategy = void 0;
const datareporter_plywood_1 = require("datareporter-plywood");
const general_1 = require("../../utils/general/general");
const granularity_1 = require("../granularity/granularity");
function readKind(kind) {
    if (kind === "string" || kind === "boolean" || kind === "time" || kind === "number")
        return kind;
    throw new Error(`Unrecognized kind: ${kind}`);
}
function typeToKind(type) {
    if (!type)
        return "string";
    return readKind(type.toLowerCase().replace(/_/g, "-").replace(/-range$/, ""));
}
var BucketingStrategy;
(function (BucketingStrategy) {
    BucketingStrategy["defaultBucket"] = "defaultBucket";
    BucketingStrategy["defaultNoBucket"] = "defaultNoBucket";
})(BucketingStrategy = exports.BucketingStrategy || (exports.BucketingStrategy = {}));
const bucketingStrategies = {
    defaultBucket: BucketingStrategy.defaultBucket,
    defaultNoBucket: BucketingStrategy.defaultNoBucket
};
var check;
class Dimension {
    constructor(parameters) {
        this.type = "dimension";
        const name = parameters.name;
        general_1.verifyUrlSafeName(name);
        this.name = name;
        this.title = parameters.title || general_1.makeTitle(name);
        this.description = parameters.description;
        const formula = parameters.formula || datareporter_plywood_1.$(name).toString();
        this.formula = formula;
        this.expression = datareporter_plywood_1.Expression.parse(formula);
        const kind = parameters.kind ? readKind(parameters.kind) : typeToKind(this.expression.type);
        this.kind = kind;
        this.multiValue = true === parameters.multiValue;
        this.className = kind;
        if (parameters.url) {
            if (typeof parameters.url !== "string") {
                throw new Error(`unsupported url: ${parameters.url}: only strings are supported`);
            }
            this.url = parameters.url;
        }
        const granularities = parameters.granularities;
        if (granularities) {
            if (!Array.isArray(granularities) || granularities.length !== 5) {
                throw new Error(`must have list of 5 granularities in dimension '${parameters.name}'`);
            }
            const sameType = granularities.every(g => typeof g === typeof granularities[0]);
            if (!sameType)
                throw new Error("granularities must have the same type of actions");
            this.granularities = granularities;
        }
        if (parameters.bucketedBy)
            this.bucketedBy = parameters.bucketedBy;
        if (parameters.bucketingStrategy)
            this.bucketingStrategy = parameters.bucketingStrategy;
        if (parameters.sortStrategy)
            this.sortStrategy = parameters.sortStrategy;
    }
    static isDimension(candidate) {
        return candidate instanceof Dimension;
    }
    static fromJS(parameters) {
        const parameterExpression = parameters.expression; // Back compat
        const value = {
            name: parameters.name,
            title: parameters.title,
            description: parameters.description,
            formula: parameters.formula || (typeof parameterExpression === "string" ? parameterExpression : null),
            kind: parameters.kind ? readKind(parameters.kind) : typeToKind(parameters.type),
            multiValue: parameters.multiValue === true,
            url: parameters.url
        };
        if (parameters.granularities) {
            value.granularities = parameters.granularities.map(granularity_1.granularityFromJS);
        }
        if (parameters.bucketedBy) {
            value.bucketedBy = granularity_1.granularityFromJS(parameters.bucketedBy);
        }
        if (parameters.bucketingStrategy) {
            value.bucketingStrategy = bucketingStrategies[parameters.bucketingStrategy];
        }
        if (parameters.sortStrategy) {
            value.sortStrategy = parameters.sortStrategy;
        }
        return new Dimension(value);
    }
    accept(visitor) {
        return visitor.visitDimension(this);
    }
    valueOf() {
        return {
            name: this.name,
            title: this.title,
            formula: this.formula,
            description: this.description,
            kind: this.kind,
            multiValue: this.multiValue,
            url: this.url,
            granularities: this.granularities,
            bucketedBy: this.bucketedBy,
            bucketingStrategy: this.bucketingStrategy,
            sortStrategy: this.sortStrategy
        };
    }
    toJS() {
        var js = {
            name: this.name,
            title: this.title,
            formula: this.formula,
            kind: this.kind
        };
        if (this.description)
            js.description = this.description;
        if (this.url)
            js.url = this.url;
        if (this.multiValue)
            js.multiValue = this.multiValue;
        if (this.granularities)
            js.granularities = this.granularities.map(g => granularity_1.granularityToJS(g));
        if (this.bucketedBy)
            js.bucketedBy = granularity_1.granularityToJS(this.bucketedBy);
        if (this.bucketingStrategy)
            js.bucketingStrategy = this.bucketingStrategy;
        if (this.sortStrategy)
            js.sortStrategy = this.sortStrategy;
        return js;
    }
    toJSON() {
        return this.toJS();
    }
    toString() {
        return `[Dimension: ${this.name}]`;
    }
    equals(other) {
        return Dimension.isDimension(other) &&
            this.name === other.name &&
            this.title === other.title &&
            this.description === other.description &&
            this.formula === other.formula &&
            this.kind === other.kind &&
            this.multiValue === other.multiValue &&
            this.url === other.url &&
            this.granularitiesEqual(other.granularities) &&
            granularity_1.granularityEquals(this.bucketedBy, other.bucketedBy) &&
            this.bucketingStrategy === other.bucketingStrategy &&
            this.sortStrategy === other.sortStrategy;
    }
    granularitiesEqual(otherGranularities) {
        if (!otherGranularities)
            return !this.granularities;
        if (otherGranularities.length !== this.granularities.length)
            return false;
        return this.granularities.every((g, idx) => granularity_1.granularityEquals(g, otherGranularities[idx]));
    }
    canBucketByDefault() {
        return this.isContinuous() && this.bucketingStrategy !== BucketingStrategy.defaultNoBucket;
    }
    isContinuous() {
        const { kind } = this;
        return kind === "time" || kind === "number";
    }
    change(propertyName, newValue) {
        var v = this.valueOf();
        if (!v.hasOwnProperty(propertyName)) {
            throw new Error(`Unknown property : ${propertyName}`);
        }
        v[propertyName] = newValue;
        return new Dimension(v);
    }
    changeKind(newKind) {
        return this.change("kind", newKind);
    }
    changeName(newName) {
        return this.change("name", newName);
    }
    changeTitle(newTitle) {
        return this.change("title", newTitle);
    }
    changeFormula(newFormula) {
        return this.change("formula", newFormula);
    }
}
exports.Dimension = Dimension;
check = Dimension;
//# sourceMappingURL=dimension.js.map