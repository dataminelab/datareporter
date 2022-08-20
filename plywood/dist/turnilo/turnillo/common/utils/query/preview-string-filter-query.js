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
exports.previewStringFilterQuery = void 0;
const datareporter_plywood_1 = require("datareporter-plywood");
const filter_1 = require("../../models/filter/filter");
function filterExpression(params) {
    const { dimension, essence, timekeeper, searchText, filterMode } = params;
    //@ts-ignore
    const { dataCube } = essence;
    const filter = essence.getEffectiveFilter(timekeeper, { unfilterDimension: dimension }).toExpression(dataCube);
    if (!searchText)
        return filter;
    switch (filterMode) {
        case filter_1.FilterMode.CONTAINS:
            return filter.and(dimension.expression.contains(datareporter_plywood_1.r(searchText)));
        case filter_1.FilterMode.REGEX:
            return filter.and(dimension.expression.match(searchText));
    }
}
function previewStringFilterQuery(params) {
    const { dimension, essence, limit } = params;
    //@ts-ignore
    const { dataCube } = essence;
    const nativeCount = dataCube.getMeasure("count");
    const measureExpression = nativeCount ? nativeCount.expression : datareporter_plywood_1.$("main").count();
    return datareporter_plywood_1.$("main")
        .filter(filterExpression(params))
        .split(dimension.expression, dimension.name)
        .apply("MEASURE", measureExpression)
        .sort(datareporter_plywood_1.$("MEASURE"), datareporter_plywood_1.SortExpression.DESCENDING)
        .limit(limit);
}
exports.previewStringFilterQuery = previewStringFilterQuery;
//# sourceMappingURL=preview-string-filter-query.js.map