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
exports.Split = exports.kindToType = exports.toExpression = exports.bucketToAction = exports.SplitType = void 0;
const chronoshift_1 = require("chronoshift");
const immutable_1 = require("immutable");
const datareporter_plywood_1 = require("datareporter-plywood");
const general_1 = require("../../utils/general/general");
const nullable_equals_1 = __importDefault(require("../../utils/immutable-utils/nullable-equals"));
const sort_1 = require("../sort/sort");
const time_shift_env_1 = require("../time-shift/time-shift-env");
var SplitType;
(function (SplitType) {
    SplitType["number"] = "number";
    SplitType["string"] = "string";
    SplitType["time"] = "time";
})(SplitType = exports.SplitType || (exports.SplitType = {}));
const defaultSplit = {
    type: SplitType.string,
    reference: null,
    bucket: null,
    sort: new sort_1.DimensionSort({ reference: null }),
    limit: null
};
function bucketToAction(bucket) {
    return bucket instanceof chronoshift_1.Duration
        ? new datareporter_plywood_1.TimeBucketExpression({ duration: bucket })
        : new datareporter_plywood_1.NumberBucketExpression({ size: bucket });
}
exports.bucketToAction = bucketToAction;
function applyTimeShift(type, expression, env) {
    if (env.type === time_shift_env_1.TimeShiftEnvType.WITH_PREVIOUS && type === SplitType.time) {
        return env.currentFilter.then(expression).fallback(expression.timeShift(env.shift));
    }
    return expression;
}
//@ts-ignore
function toExpression({ bucket, type }, { expression }, env) {
    const expWithShift = applyTimeShift(type, expression, env);
    if (!bucket)
        return expWithShift;
    return expWithShift.performAction(bucketToAction(bucket));
}
exports.toExpression = toExpression;
function kindToType(kind) {
    switch (kind) {
        case "time":
            return SplitType.time;
        case "number":
            return SplitType.number;
        default:
            return SplitType.string;
    }
}
exports.kindToType = kindToType;
//@ts-ignore
class Split extends immutable_1.Record(defaultSplit) {
    static fromDimension({ name, kind }) {
        return new Split({ reference: name, type: kindToType(kind) });
    }
    toString() {
        //@ts-ignore
        return `[SplitCombine: ${this.reference}]`;
    }
    toKey() {
        //@ts-ignore
        return this.reference;
    }
    changeBucket(bucket) {
        //@ts-ignore
        return this.set("bucket", bucket);
    }
    changeSort(sort) {
        //@ts-ignore
        return this.set("sort", sort);
    }
    changeLimit(limit) {
        //@ts-ignore
        return this.set("limit", limit);
    }
    getTitle(dimension) {
        return (dimension ? dimension.title : "?") + this.getBucketTitle();
    }
    getBucketTitle() {
        //@ts-ignore
        const { bucket } = this;
        if (!general_1.isTruthy(bucket)) {
            return "";
        }
        if (bucket instanceof chronoshift_1.Duration) {
            return ` (${bucket.getDescription(true)})`;
        }
        return ` (by ${bucket})`;
    }
    equals(other) {
        //@ts-ignore
        if (this.type !== SplitType.time)
            return super.equals(other);
        return other instanceof Split &&
            //@ts-ignore
            this.type === other.type &&
            //@ts-ignore
            this.reference === other.reference &&
            //@ts-ignore
            this.sort.equals(other.sort) &&
            //@ts-ignore
            this.limit === other.limit &&
            //@ts-ignore
            nullable_equals_1.default(this.bucket, other.bucket);
    }
}
exports.Split = Split;
//# sourceMappingURL=split.js.map