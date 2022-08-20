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
exports.Predicates = void 0;
class Predicates {
    static noSplits() {
        return ({ splits }) => splits.length() === 0;
    }
    static numberOfSplitsIsNot(expected) {
        return ({ splits }) => splits.length() !== expected;
    }
    static numberOfSeriesIsNot(expected) {
        return ({ series }) => series.count() !== expected;
    }
    static areExactSplitKinds(...selectors) {
        return ({ splits, dataCube }) => {
            //@ts-ignore
            const kinds = splits.splits.map((split) => dataCube.getDimension(split.reference).kind).toArray();
            return Predicates.strictCompare(selectors, kinds);
        };
    }
    static strictCompare(selectors, kinds) {
        if (selectors.length !== kinds.length)
            return false;
        return selectors.every((selector, i) => Predicates.testKind(kinds[i], selector));
    }
    static testKind(kind, selector) {
        if (selector === "*") {
            return true;
        }
        var bareSelector = selector.replace(/^!/, "");
        // This can be enriched later, right now it's just a 1-1 match
        var result = kind === bareSelector;
        if (selector.charAt(0) === "!") {
            return !result;
        }
        return result;
    }
    static haveAtLeastSplitKinds(...kinds) {
        return ({ splits, dataCube }) => {
            //@ts-ignore
            let getKind = (split) => dataCube.getDimension(split.reference).kind;
            //@ts-ignore
            const actualKinds = splits.splits.map(getKind);
            return kinds.every(kind => actualKinds.indexOf(kind) > -1);
        };
    }
    static supportedSplitsCount() {
        return ({ splits, dataCube }) => dataCube.getMaxSplits() < splits.length();
    }
    static noSelectedMeasures() {
        return ({ series }) => series.isEmpty();
    }
}
exports.Predicates = Predicates;
//# sourceMappingURL=predicates.js.map