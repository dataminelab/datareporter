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
exports.getBestBucketUnitForRange = exports.getBestGranularityForRange = exports.getDefaultGranularityForKind = exports.getGranularities = exports.granularityToJS = exports.granularityEquals = exports.formatGranularity = exports.granularityToString = exports.granularityFromJS = exports.NumberHelper = exports.TimeHelper = exports.isGranularityValid = exports.validateGranularity = void 0;
const chronoshift_1 = require("chronoshift");
const constants_1 = require("../../../client/config/constants");
const general_1 = require("../../../common/utils/general/general");
const duration_1 = require("../../utils/plywood/duration");
const MENU_LENGTH = 5;
function validateGranularity(kind, granularity) {
    if (kind === "time") {
        if (!duration_1.isValidDuration(granularity)) {
            return constants_1.STRINGS.invalidDurationFormat;
        }
        if (!duration_1.isFloorableDuration(granularity)) {
            return constants_1.STRINGS.notFloorableDuration;
        }
    }
    if (kind === "number" && !general_1.isDecimalInteger(granularity)) {
        return constants_1.STRINGS.invalidNumberFormat;
    }
    return null;
}
exports.validateGranularity = validateGranularity;
function isGranularityValid(kind, granularity) {
    return validateGranularity(kind, granularity) === null;
}
exports.isGranularityValid = isGranularityValid;
function makeCheckpoint(checkPoint, returnValue) {
    return { checkPoint, returnValue };
}
function makeNumberBuckets(centerAround, count, coarse) {
    let granularities = [];
    let logTen = Math.log(centerAround) / Math.LN10;
    const digits = general_1.getNumberOfWholeDigits(centerAround);
    const decimalBase = 10;
    while (granularities.length <= count) {
        if (!coarse) {
            const halfStep = general_1.toSignificantDigits(5 * Math.pow(decimalBase, logTen - 1), digits);
            granularities.push(halfStep);
        }
        if (granularities.length >= count)
            break;
        const wholeStep = general_1.toSignificantDigits(Math.pow(decimalBase, logTen), digits);
        granularities.push(wholeStep);
        logTen++;
    }
    return granularities;
}
function days(count) {
    return count * chronoshift_1.day.canonicalLength;
}
function hours(count) {
    return count * chronoshift_1.hour.canonicalLength;
}
function minutes(count) {
    return count * chronoshift_1.minute.canonicalLength;
}
class TimeHelper {
}
exports.TimeHelper = TimeHelper;
TimeHelper.dimensionKind = "time";
TimeHelper.minGranularity = chronoshift_1.Duration.fromJS("PT1M");
TimeHelper.defaultGranularity = chronoshift_1.Duration.fromJS("P1D");
TimeHelper.supportedGranularities = (_) => {
    return [
        "PT1S", "PT1M", "PT5M", "PT15M",
        "PT1H", "PT6H", "PT8H", "PT12H",
        "P1D", "P1W", "P1M", "P3M", "P6M",
        "P1Y", "P2Y"
    ].map(duration => chronoshift_1.Duration.fromJS(duration));
};
TimeHelper.checkers = [
    makeCheckpoint(days(95), chronoshift_1.Duration.fromJS("P1W")),
    makeCheckpoint(days(8), chronoshift_1.Duration.fromJS("P1D")),
    makeCheckpoint(hours(8), chronoshift_1.Duration.fromJS("PT1H")),
    makeCheckpoint(hours(3), chronoshift_1.Duration.fromJS("PT5M"))
];
TimeHelper.coarseCheckers = [
    makeCheckpoint(days(95), chronoshift_1.Duration.fromJS("P1M")),
    makeCheckpoint(days(20), chronoshift_1.Duration.fromJS("P1W")),
    makeCheckpoint(days(6), chronoshift_1.Duration.fromJS("P1D")),
    makeCheckpoint(days(2), chronoshift_1.Duration.fromJS("PT12H")),
    makeCheckpoint(hours(23), chronoshift_1.Duration.fromJS("PT6H")),
    makeCheckpoint(hours(3), chronoshift_1.Duration.fromJS("PT1H")),
    makeCheckpoint(minutes(30), chronoshift_1.Duration.fromJS("PT5M"))
];
TimeHelper.defaultGranularities = TimeHelper.checkers.map(c => c.returnValue).concat(TimeHelper.minGranularity).reverse();
TimeHelper.coarseGranularities = TimeHelper.coarseCheckers.map(c => c.returnValue).concat(TimeHelper.minGranularity).reverse();
class NumberHelper {
}
exports.NumberHelper = NumberHelper;
NumberHelper.dimensionKind = "number";
NumberHelper.minGranularity = 1;
NumberHelper.defaultGranularity = 10;
NumberHelper.checkers = [
    makeCheckpoint(5000, 1000),
    makeCheckpoint(500, 100),
    makeCheckpoint(100, 10),
    makeCheckpoint(1, 1),
    makeCheckpoint(0.1, 0.1)
];
NumberHelper.defaultGranularities = NumberHelper.checkers.map((c) => c.returnValue).reverse();
NumberHelper.coarseGranularities = null;
NumberHelper.coarseCheckers = [
    makeCheckpoint(500000, 50000),
    makeCheckpoint(50000, 10000),
    makeCheckpoint(5000, 5000),
    makeCheckpoint(1000, 1000),
    makeCheckpoint(100, 100),
    makeCheckpoint(10, 10),
    makeCheckpoint(1, 1),
    makeCheckpoint(0.1, 0.1)
];
NumberHelper.supportedGranularities = (bucketedBy) => {
    return makeNumberBuckets(getBucketSize(bucketedBy), 10);
};
function getHelperForKind(kind) {
    if (kind === "time")
        return TimeHelper;
    return NumberHelper;
}
function getHelperForRange({ start }) {
    if (start instanceof Date)
        return TimeHelper;
    return NumberHelper;
}
function getBucketSize(input) {
    if (input instanceof chronoshift_1.Duration)
        return input.getCanonicalLength();
    if (typeof input === "number")
        return input;
    throw new Error(`unrecognized granularity: ${input} must be number or Duration`);
}
function startValue({ start }) {
    return start instanceof Date ? start.valueOf() : start;
}
function endValue({ end }) {
    return end instanceof Date ? end.valueOf() : end;
}
function findBestMatch(array, target) {
    const exactMatch = general_1.findExactIndex(array, target, getBucketSize);
    if (exactMatch !== -1) {
        return array[exactMatch];
    }
    const minBiggerIdx = general_1.findFirstBiggerIndex(array, target, getBucketSize);
    if (minBiggerIdx !== -1) {
        return array[minBiggerIdx];
    }
    return array[general_1.findMaxValueIndex(array, getBucketSize)];
}
function generateGranularitySet(allGranularities, bucketedBy) {
    const start = general_1.findFirstBiggerIndex(allGranularities, bucketedBy, getBucketSize);
    const returnGranularities = allGranularities.slice(start, start + MENU_LENGTH);
    // makes sure the bucket is part of the list
    if (general_1.findExactIndex(returnGranularities, bucketedBy, getBucketSize) === -1) {
        return [bucketedBy].concat(returnGranularities.slice(0, returnGranularities.length - 1));
    }
    return returnGranularities;
}
function granularityFromJS(input) {
    if (typeof input === "number")
        return input;
    if (duration_1.isValidDuration(input))
        return chronoshift_1.Duration.fromJS(input);
    throw new Error("input should be number or Duration");
}
exports.granularityFromJS = granularityFromJS;
function granularityToString(input) {
    return input.toString();
}
exports.granularityToString = granularityToString;
function formatGranularity(bucket) {
    if (bucket instanceof chronoshift_1.Duration) {
        return `${bucket.getSingleSpanValue()}${bucket.getSingleSpan().charAt(0).toUpperCase()}`;
    }
    return bucket.toString();
}
exports.formatGranularity = formatGranularity;
function granularityEquals(g1, g2) {
    if (g1 instanceof chronoshift_1.Duration) {
        try {
            return g1.equals(g2);
        }
        catch (_a) {
            return false;
        }
    }
    return g1 === g2;
}
exports.granularityEquals = granularityEquals;
function granularityToJS(input) {
    if (input instanceof chronoshift_1.Duration)
        return input.toJS();
    return input;
}
exports.granularityToJS = granularityToJS;
function getGranularities(kind, bucketedBy, coarse) {
    const kindHelper = getHelperForKind(kind);
    const coarseGranularities = kindHelper.coarseGranularities;
    if (!bucketedBy)
        return coarse && coarseGranularities ? coarseGranularities : kindHelper.defaultGranularities;
    // make list that makes most sense with bucket
    const allGranularities = kindHelper.supportedGranularities(bucketedBy);
    return generateGranularitySet(allGranularities, bucketedBy);
}
exports.getGranularities = getGranularities;
function getDefaultGranularityForKind(kind, bucketedBy, customGranularities) {
    if (bucketedBy)
        return bucketedBy;
    if (customGranularities)
        return customGranularities[2];
    return getHelperForKind(kind).defaultGranularity;
}
exports.getDefaultGranularityForKind = getDefaultGranularityForKind;
function getBestGranularityForRange(inputRange, bigChecker, bucketedBy, customGranularities) {
    return getBestBucketUnitForRange(inputRange, bigChecker, bucketedBy, customGranularities);
}
exports.getBestGranularityForRange = getBestGranularityForRange;
function getBestBucketUnitForRange(inputRange, bigChecker, bucketedBy, customGranularities) {
    const rangeLength = Math.abs(endValue(inputRange) - startValue(inputRange));
    const rangeHelper = getHelperForRange(inputRange);
    const bucketLength = bucketedBy ? getBucketSize(bucketedBy) : 0;
    const checkPoints = bigChecker && rangeHelper.coarseCheckers ? rangeHelper.coarseCheckers : rangeHelper.checkers;
    for (const { checkPoint, returnValue } of checkPoints) {
        if (rangeLength > checkPoint || bucketLength > checkPoint) {
            if (bucketedBy) {
                const granArray = customGranularities || getGranularities(rangeHelper.dimensionKind, bucketedBy);
                const closest = general_1.findBiggerClosestToIdeal(granArray, bucketedBy, returnValue, getBucketSize);
                // this could happen if bucketedBy were very big or if custom granularities are smaller than maker action
                if (closest === null)
                    return rangeHelper.defaultGranularity;
                return closest;
            }
            else {
                if (!customGranularities)
                    return returnValue;
                return findBestMatch(customGranularities, returnValue);
            }
        }
    }
    const minBucket = customGranularities ? customGranularities[general_1.findMinValueIndex(customGranularities, getBucketSize)] : rangeHelper.minGranularity;
    return bucketLength > getBucketSize(minBucket) ? bucketedBy : minBucket;
}
exports.getBestBucketUnitForRange = getBestBucketUnitForRange;
//# sourceMappingURL=granularity.js.map