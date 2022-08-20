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
exports.ViewDefinitionConverter4 = void 0;
const chronoshift_1 = require("chronoshift");
const immutable_1 = require("immutable");
const essence_1 = require("../../models/essence/essence");
const filter_1 = require("../../models/filter/filter");
const splits_1 = require("../../models/splits/splits");
const time_shift_1 = require("../../models/time-shift/time-shift");
const visualization_manifests_1 = require("../../visualization-manifests");
const filter_definition_1 = require("./filter-definition");
const series_definition_1 = require("./series-definition");
const split_definition_1 = require("./split-definition");
const visualization_settings_converter_1 = require("./visualization-settings-converter");
class ViewDefinitionConverter4 {
    constructor() {
        this.version = 4;
    }
    fromViewDefinition(definition, dataCube) {
        const timezone = chronoshift_1.Timezone.fromJS(definition.timezone);
        const visualization = visualization_manifests_1.manifestByName(definition.visualization);
        const visualizationSettings = visualization_settings_converter_1.fromViewDefinition(visualization, definition.visualizationSettings);
        const timeShift = definition.timeShift ? time_shift_1.TimeShift.fromJS(definition.timeShift) : time_shift_1.TimeShift.empty();
        const filter = filter_1.Filter.fromClauses(definition.filters.map(fc => filter_definition_1.filterDefinitionConverter.toFilterClause(fc, dataCube)));
        const splitDefinitions = immutable_1.List(definition.splits);
        const splits = new splits_1.Splits({ splits: splitDefinitions.map(split_definition_1.splitConverter.toSplitCombine) });
        const pinnedDimensions = immutable_1.OrderedSet(definition.pinnedDimensions || []);
        const pinnedSort = definition.pinnedSort;
        const series = series_definition_1.seriesDefinitionConverter.toEssenceSeries(definition.series, dataCube.measures);
        return new essence_1.Essence({
            dataCube,
            visualization,
            visualizationSettings,
            timezone,
            filter,
            timeShift,
            splits,
            pinnedDimensions,
            series,
            pinnedSort
        });
    }
    toViewDefinition(essence) {
        return {
            //@ts-ignore
            visualization: essence.visualization.name,
            //@ts-ignore
            visualizationSettings: visualization_settings_converter_1.toViewDefinition(essence.visualization, essence.visualizationSettings),
            //@ts-ignore
            timezone: essence.timezone.toJS(),
            //@ts-ignore
            filters: essence.filter.clauses.map(fc => filter_definition_1.filterDefinitionConverter.fromFilterClause(fc)).toArray(),
            //@ts-ignore
            splits: essence.splits.splits.map(split_definition_1.splitConverter.fromSplitCombine).toArray(),
            //@ts-ignore
            series: series_definition_1.seriesDefinitionConverter.fromEssenceSeries(essence.series),
            //@ts-ignore
            pinnedDimensions: essence.pinnedDimensions.toArray(),
            //@ts-ignore
            pinnedSort: essence.pinnedSort,
            //@ts-ignore
            timeShift: essence.hasComparison() ? essence.timeShift.toJS() : undefined
        };
    }
}
exports.ViewDefinitionConverter4 = ViewDefinitionConverter4;
//# sourceMappingURL=view-definition-converter-4.js.map