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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitConverter = void 0;
const chronoshift_1 = require("chronoshift");
const limit_1 = require("../../limit/limit");
const concrete_series_1 = require("../../models/series/concrete-series");
const sort_1 = require("../../models/sort/sort");
const split_1 = require("../../models/split/split");
const general_1 = require("../../utils/general/general");
const PREVIOUS_PREFIX = "_previous__";
const DELTA_PREFIX = "_delta__";
function inferType(type, reference, dimensionName) {
    switch (type) {
        case sort_1.SortType.DIMENSION:
            return sort_1.SortType.DIMENSION;
        case sort_1.SortType.SERIES:
            return sort_1.SortType.SERIES;
        default:
            return reference === dimensionName ? sort_1.SortType.DIMENSION : sort_1.SortType.SERIES;
    }
}
function inferPeriodAndReference({ ref, period }) {
    if (period)
        return { period, reference: ref };
    if (ref.indexOf(PREVIOUS_PREFIX) === 0)
        return { reference: ref.substring(PREVIOUS_PREFIX.length), period: concrete_series_1.SeriesDerivation.PREVIOUS };
    if (ref.indexOf(DELTA_PREFIX) === 0)
        return { reference: ref.substring(DELTA_PREFIX.length), period: concrete_series_1.SeriesDerivation.DELTA };
    return { reference: ref, period: concrete_series_1.SeriesDerivation.CURRENT };
}
function toSort(sort, dimensionName) {
    const { direction } = sort;
    const { reference, period } = inferPeriodAndReference(sort);
    const type = inferType(sort.type, reference, dimensionName);
    switch (type) {
        case sort_1.SortType.DIMENSION:
            return new sort_1.DimensionSort({ reference, direction });
        case sort_1.SortType.SERIES:
            return new sort_1.SeriesSort({ reference, direction, period });
    }
}
function fromSort(sort) {
    const _a = sort.toJS(), { reference: ref } = _a, rest = __rest(_a, ["reference"]);
    //@ts-ignore
    return Object.assign({ ref }, rest);
}
function toLimit(limit) {
    if (limit === null)
        return null;
    if (general_1.isNumber(limit) && general_1.isFiniteNumber(limit))
        return limit;
    return limit_1.AVAILABLE_LIMITS[0];
}
const numberSplitConversion = {
    toSplitCombine(split) {
        const { dimension, limit, sort, granularity } = split;
        return new split_1.Split({
            type: split_1.SplitType.number,
            reference: dimension,
            bucket: granularity,
            sort: sort && toSort(sort, dimension),
            limit: toLimit(limit)
        });
    },
    //@ts-ignore
    fromSplitCombine({ bucket, sort, reference, limit }) {
        if (typeof bucket === "number") {
            return {
                type: split_1.SplitType.number,
                dimension: reference,
                granularity: bucket,
                //@ts-ignore
                sort: sort && fromSort(sort),
                limit
            };
        }
        else {
            throw new Error("");
        }
    }
};
const timeSplitConversion = {
    toSplitCombine(split) {
        const { dimension, limit, sort, granularity } = split;
        return new split_1.Split({
            type: split_1.SplitType.time,
            reference: dimension,
            bucket: chronoshift_1.Duration.fromJS(granularity),
            sort: sort && toSort(sort, dimension),
            limit: toLimit(limit)
        });
    },
    //@ts-ignore
    fromSplitCombine({ limit, sort, reference, bucket }) {
        if (bucket instanceof chronoshift_1.Duration) {
            return {
                type: split_1.SplitType.time,
                dimension: reference,
                granularity: bucket.toJS(),
                //@ts-ignore
                sort: sort && fromSort(sort),
                limit
            };
        }
        else {
            throw new Error("");
        }
    }
};
const stringSplitConversion = {
    toSplitCombine(split) {
        const { dimension, limit, sort } = split;
        return new split_1.Split({
            reference: dimension,
            sort: sort && toSort(sort, dimension),
            limit: toLimit(limit)
        });
    },
    //@ts-ignore
    fromSplitCombine({ limit, sort, reference }) {
        return {
            type: split_1.SplitType.string,
            dimension: reference,
            //@ts-ignore
            sort: sort && fromSort(sort),
            limit
        };
    }
};
const splitConversions = {
    number: numberSplitConversion,
    string: stringSplitConversion,
    time: timeSplitConversion
};
exports.splitConverter = {
    toSplitCombine(split) {
        console.log('--- to split combine');
        console.log(split);
        return splitConversions[split.type].toSplitCombine(split);
    },
    fromSplitCombine(splitCombine) {
        //@ts-ignore
        const { bucket } = splitCombine;
        if (bucket instanceof chronoshift_1.Duration) {
            return timeSplitConversion.fromSplitCombine(splitCombine);
        }
        else if (typeof bucket === "number") {
            return numberSplitConversion.fromSplitCombine(splitCombine);
        }
        else {
            return stringSplitConversion.fromSplitCombine(splitCombine);
        }
    }
};
//# sourceMappingURL=split-definition.js.map