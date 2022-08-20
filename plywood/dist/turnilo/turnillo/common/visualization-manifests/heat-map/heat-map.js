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
exports.HEAT_MAP_MANIFEST = void 0;
const measure_series_1 = require("../../models/series/measure-series");
const sort_1 = require("../../models/sort/sort");
const split_1 = require("../../models/split/split");
const visualization_manifest_1 = require("../../models/visualization-manifest/visualization-manifest");
const empty_settings_config_1 = require("../../models/visualization-settings/empty-settings-config");
const predicates_1 = require("../../utils/rules/predicates");
const visualization_dependent_evaluator_1 = require("../../utils/rules/visualization-dependent-evaluator");
const rulesEvaluator = visualization_dependent_evaluator_1.visualizationDependentEvaluatorBuilder
    .when(predicates_1.Predicates.numberOfSplitsIsNot(2))
    .then(variables => visualization_manifest_1.Resolve.manual(3, "Heatmap needs exactly 2 splits", 
//@ts-ignore
variables.splits.length() > 2 ? suggestRemovingSplits(variables) : suggestAddingSplits(variables)))
    .when(predicates_1.Predicates.numberOfSeriesIsNot(1))
    .then(variables => visualization_manifest_1.Resolve.manual(3, "Heatmap needs exactly 1 measure", 
//@ts-ignore
variables.series.series.size === 0 ? suggestAddingMeasure(variables) : suggestRemovingMeasures(variables)))
    .otherwise(({ splits, dataCube, series }) => {
    let autoChanged = false;
    const newSplits = splits.update("splits", splits => splits.map((split, i) => {
        const splitDimension = dataCube.getDimension(split.reference);
        const sortStrategy = splitDimension.sortStrategy;
        if (sort_1.isSortEmpty(split.sort)) {
            if (sortStrategy) {
                if (sortStrategy === "self" || split.reference === sortStrategy) {
                    split = split.changeSort(new sort_1.DimensionSort({
                        reference: splitDimension.name,
                        direction: sort_1.SortDirection.descending
                    }));
                }
                else {
                    split = split.changeSort(new sort_1.SeriesSort({
                        reference: sortStrategy,
                        direction: sort_1.SortDirection.descending
                    }));
                }
            }
            else {
                if (split.type === split_1.SplitType.string) {
                    split = split.changeSort(new sort_1.SeriesSort({
                        //@ts-ignore
                        reference: series.series.first().reference,
                        direction: sort_1.SortDirection.descending
                    }));
                }
                else {
                    split = split.changeSort(new sort_1.DimensionSort({
                        reference: splitDimension.name,
                        direction: sort_1.SortDirection.descending
                    }));
                }
                autoChanged = true;
            }
        }
        if (!split.limit && splitDimension.kind !== "time") {
            split = split.changeLimit(25);
            autoChanged = true;
        }
        return split;
    }));
    //@ts-ignore
    return autoChanged ? visualization_manifest_1.Resolve.automatic(10, { splits: newSplits }) : visualization_manifest_1.Resolve.ready(10);
})
    .build();
const suggestRemovingSplits = ({ splits }) => [{
        description: splits.length() === 3 ? "Remove last split" : `Remove last ${splits.length() - 2} splits`,
        adjustment: { splits: splits.slice(0, 2) }
    }];
const suggestAddingSplits = ({ dataCube, splits }) => dataCube.dimensions
    .filterDimensions(dimension => !splits.hasSplitOn(dimension))
    .slice(0, 2)
    .map(dimension => ({
    description: `Add ${dimension.title} split`,
    adjustment: {
        splits: splits.addSplit(split_1.Split.fromDimension(dimension))
    }
}));
const suggestAddingMeasure = ({ dataCube, series }) => [{
        description: `Add measure ${dataCube.measures.first().title}`,
        adjustment: {
            series: series.addSeries(measure_series_1.MeasureSeries.fromMeasure(dataCube.measures.first()))
        }
    }];
const suggestRemovingMeasures = ({ series }) => [{
        description: series.count() === 2 ? "Remove last measure" : `Remove last ${series.count() - 1} measures`,
        adjustment: {
            series: series.takeFirst()
        }
    }];
exports.HEAT_MAP_MANIFEST = new visualization_manifest_1.VisualizationManifest("heatmap", "Heatmap", rulesEvaluator, empty_settings_config_1.emptySettingsConfig);
//# sourceMappingURL=heat-map.js.map