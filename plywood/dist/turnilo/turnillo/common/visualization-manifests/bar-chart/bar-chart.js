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
exports.BAR_CHART_MANIFEST = void 0;
const sort_1 = require("../../models/sort/sort");
const split_1 = require("../../models/split/split");
const splits_1 = require("../../models/splits/splits");
const visualization_manifest_1 = require("../../models/visualization-manifest/visualization-manifest");
const empty_settings_config_1 = require("../../models/visualization-settings/empty-settings-config");
const actions_1 = require("../../utils/rules/actions");
const predicates_1 = require("../../utils/rules/predicates");
const visualization_dependent_evaluator_1 = require("../../utils/rules/visualization-dependent-evaluator");
const rulesEvaluator = visualization_dependent_evaluator_1.visualizationDependentEvaluatorBuilder
    .when(predicates_1.Predicates.noSplits())
    .then(actions_1.Actions.manualDimensionSelection("The Bar Chart requires at least one split"))
    .when(predicates_1.Predicates.areExactSplitKinds("*"))
    .or(predicates_1.Predicates.areExactSplitKinds("*", "*"))
    .then(({ splits, dataCube, isSelectedVisualization }) => {
    let continuousBoost = 0;
    // Auto adjustment
    let autoChanged = false;
    const newSplits = splits.update("splits", splits => splits.map((split) => {
        //@ts-ignore
        const splitDimension = dataCube.getDimension(split.reference);
        //@ts-ignore
        if (splitDimension.canBucketByDefault() && split.sort.reference !== splitDimension.name) {
            split = split.changeSort(new sort_1.DimensionSort({
                reference: splitDimension.name,
                //@ts-ignore
                direction: split.sort.direction
            }));
            autoChanged = true;
        }
        if (splitDimension.kind === "number") {
            continuousBoost = 4;
        }
        //@ts-ignore
        // ToDo: review this
        if (!split.limit && (autoChanged || splitDimension.kind !== "time")) {
            split = split.changeLimit(25);
            autoChanged = true;
        }
        return split;
    }));
    if (autoChanged) {
        //@ts-ignore
        return visualization_manifest_1.Resolve.automatic(5 + continuousBoost, { splits: newSplits });
    }
    return visualization_manifest_1.Resolve.ready(isSelectedVisualization ? 10 : (7 + continuousBoost));
})
    .otherwise(({ dataCube }) => {
    const categoricalDimensions = dataCube.dimensions.filterDimensions(dimension => dimension.kind !== "time");
    return visualization_manifest_1.Resolve.manual(visualization_manifest_1.NORMAL_PRIORITY_ACTION, "The Bar Chart needs one or two splits", categoricalDimensions.slice(0, 2).map((dimension) => {
        return {
            description: `Split on ${dimension.title} instead`,
            adjustment: {
                splits: splits_1.Splits.fromSplit(split_1.Split.fromDimension(dimension))
            }
        };
    }));
})
    .build();
exports.BAR_CHART_MANIFEST = new visualization_manifest_1.VisualizationManifest("bar-chart", "Bar Chart", rulesEvaluator, empty_settings_config_1.emptySettingsConfig);
//# sourceMappingURL=bar-chart.js.map