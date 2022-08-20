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
exports.stringFilterOptionsQuery = void 0;
const datareporter_plywood_1 = require("datareporter-plywood");
function stringFilterOptionsQuery({ essence, timekeeper, limit, dimension, searchText }) {
    //@ts-ignore
    const { dataCube } = essence;
    const nativeCount = dataCube.getMeasure("count");
    const $main = datareporter_plywood_1.$("main");
    const measureExpression = nativeCount ? nativeCount.expression : $main.count();
    const filter = essence.getEffectiveFilter(timekeeper, { unfilterDimension: dimension }).toExpression(dataCube);
    const filterWithSearch = searchText ? filter.and(dimension.expression.contains(datareporter_plywood_1.r(searchText), "ignoreCase")) : filter;
    return $main
        .filter(filterWithSearch)
        .split(dimension.expression, dimension.name)
        .apply("MEASURE", measureExpression)
        .sort(datareporter_plywood_1.$("MEASURE"), datareporter_plywood_1.SortExpression.DESCENDING)
        .limit(limit);
}
exports.stringFilterOptionsQuery = stringFilterOptionsQuery;
//# sourceMappingURL=selectable-string-filter-query.js.map