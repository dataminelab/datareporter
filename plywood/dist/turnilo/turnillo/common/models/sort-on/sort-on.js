"use strict";
/*
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
exports.SeriesSortOn = exports.DimensionSortOn = exports.SortOn = void 0;
const concrete_series_1 = require("../series/concrete-series");
const sort_1 = require("../sort/sort");
class SortOn {
    constructor(key, title, period) {
        this.key = key;
        this.title = title;
        this.period = period;
    }
    static fromSort(sort, essence) {
        //@ts-ignore
        const { type, reference } = sort;
        switch (type) {
            case sort_1.SortType.DIMENSION:
                //@ts-ignore
                const dimension = essence.dataCube.getDimension(reference);
                return new DimensionSortOn(dimension);
            case sort_1.SortType.SERIES:
                //@ts-ignore
                const period = sort.period;
                const series = essence.findConcreteSeries(reference);
                return new SeriesSortOn(series, period);
        }
    }
    static getKey(sortOn) {
        return sortOn.key;
    }
    static getTitle(sortOn) {
        return sortOn.title;
    }
    static equals(sortOn, other) {
        if (!sortOn)
            return sortOn === other;
        return sortOn.equals(other);
    }
}
exports.SortOn = SortOn;
class DimensionSortOn extends SortOn {
    constructor(dimension) {
        super(dimension.name, dimension.title);
    }
    equals(other) {
        return other instanceof DimensionSortOn
            && this.key === other.key
            && this.title === other.title;
    }
    toSort(direction) {
        return new sort_1.DimensionSort({ direction, reference: this.key });
    }
}
exports.DimensionSortOn = DimensionSortOn;
class SeriesSortOn extends SortOn {
    constructor(series, period = concrete_series_1.SeriesDerivation.CURRENT) {
        super(series.definition.key(), series.title(period), period);
    }
    equals(other) {
        return other instanceof SeriesSortOn
            && this.key === other.key
            && this.title === other.title
            && this.period === other.period;
    }
    toSort(direction) {
        return new sort_1.SeriesSort({ reference: this.key, direction, period: this.period });
    }
}
exports.SeriesSortOn = SeriesSortOn;
//# sourceMappingURL=sort-on.js.map