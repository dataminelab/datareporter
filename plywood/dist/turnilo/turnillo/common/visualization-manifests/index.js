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
exports.manifestByName = exports.MANIFESTS = void 0;
const immutable_class_1 = require("immutable-class");
const bar_chart_1 = require("./bar-chart/bar-chart");
const heat_map_1 = require("./heat-map/heat-map");
const line_chart_1 = require("./line-chart/line-chart");
const table_1 = require("./table/table");
const totals_1 = require("./totals/totals");
exports.MANIFESTS = [
    totals_1.TOTALS_MANIFEST,
    //@ts-ignore
    table_1.TABLE_MANIFEST,
    //@ts-ignore
    line_chart_1.LINE_CHART_MANIFEST,
    bar_chart_1.BAR_CHART_MANIFEST,
    heat_map_1.HEAT_MAP_MANIFEST
];
function manifestByName(visualizationName) {
    return immutable_class_1.NamedArray.findByName(exports.MANIFESTS, visualizationName);
}
exports.manifestByName = manifestByName;
//# sourceMappingURL=index.js.map