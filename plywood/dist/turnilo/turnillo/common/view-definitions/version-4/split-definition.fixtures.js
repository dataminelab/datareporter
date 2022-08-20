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
exports.numberSplitDefinition = exports.timeSplitDefinition = exports.stringSplitDefinition = void 0;
const concrete_series_1 = require("../../models/series/concrete-series");
const sort_1 = require("../../models/sort/sort");
const split_1 = require("../../models/split/split");
function stringSplitDefinition(dimension, { limit = 50, sort: { direction = sort_1.SortDirection.ascending, period = concrete_series_1.SeriesDerivation.CURRENT, reference = dimension } = {} } = {}) {
    return {
        type: split_1.SplitType.string,
        dimension,
        sort: {
            ref: reference,
            direction,
            period,
            type: reference === dimension ? sort_1.SortType.DIMENSION : sort_1.SortType.SERIES
        },
        limit
    };
}
exports.stringSplitDefinition = stringSplitDefinition;
function timeSplitDefinition(dimension, granularity, { limit = 50, sort: { direction = sort_1.SortDirection.ascending, period = concrete_series_1.SeriesDerivation.CURRENT, reference = dimension } = {} } = {}) {
    return {
        granularity,
        type: split_1.SplitType.time,
        dimension,
        sort: {
            ref: reference,
            direction,
            period,
            type: reference === dimension ? sort_1.SortType.DIMENSION : sort_1.SortType.SERIES
        },
        limit
    };
}
exports.timeSplitDefinition = timeSplitDefinition;
function numberSplitDefinition(dimension, granularity, { limit = 50, sort: { direction = sort_1.SortDirection.ascending, period = concrete_series_1.SeriesDerivation.CURRENT, reference = dimension } = {} } = {}) {
    return {
        granularity,
        type: split_1.SplitType.number,
        dimension,
        sort: {
            ref: reference,
            direction,
            period,
            type: reference === dimension ? sort_1.SortType.DIMENSION : sort_1.SortType.SERIES
        },
        limit
    };
}
exports.numberSplitDefinition = numberSplitDefinition;
//# sourceMappingURL=split-definition.fixtures.js.map