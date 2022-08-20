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
exports.LINE_CHART_MANIFEST = void 0;
const immutable_1 = require("immutable");
const dom_1 = require("../../../client/utils/dom/dom");
const limit_1 = require("../../limit/limit");
const colors_1 = require("../../models/colors/colors");
const sort_1 = require("../../models/sort/sort");
const split_1 = require("../../models/split/split");
const splits_1 = require("../../models/splits/splits");
const visualization_manifest_1 = require("../../models/visualization-manifest/visualization-manifest");
const predicates_1 = require("../../utils/rules/predicates");
const visualization_dependent_evaluator_1 = require("../../utils/rules/visualization-dependent-evaluator");
const settings_1 = require("./settings");
const COLORS_COUNT = colors_1.NORMAL_COLORS.length;
const rulesEvaluator = visualization_dependent_evaluator_1.visualizationDependentEvaluatorBuilder
    .when(({ dataCube }) => !(dataCube.getDimensionsByKind("time").length || dataCube.getDimensionsByKind("number").length))
    .then(() => visualization_manifest_1.Resolve.NEVER)
    .when(predicates_1.Predicates.noSplits())
    .then(({ dataCube }) => {
    const continuousDimensions = dataCube.getDimensionsByKind("time").concat(dataCube.getDimensionsByKind("number"));
    return visualization_manifest_1.Resolve.manual(visualization_manifest_1.NORMAL_PRIORITY_ACTION, "This visualization requires a continuous dimension split", continuousDimensions.map(continuousDimension => {
        return {
            description: `Add a split on ${continuousDimension.title}`,
            adjustment: {
                splits: splits_1.Splits.fromSplit(split_1.Split.fromDimension(continuousDimension))
            }
        };
    }));
})
    .when(predicates_1.Predicates.areExactSplitKinds("time"))
    .or(predicates_1.Predicates.areExactSplitKinds("number"))
    .then(({ splits, dataCube, isSelectedVisualization }) => {
    let score = 4;
    let continuousSplit = splits.getSplit(0);
    //@ts-ignore
    const continuousDimension = dataCube.getDimension(continuousSplit.reference);
    const sortStrategy = continuousDimension.sortStrategy;
    let sort = null;
    if (sortStrategy && sortStrategy !== "self") {
        sort = new sort_1.DimensionSort({
            reference: sortStrategy,
            direction: sort_1.SortDirection.ascending
        });
    }
    else {
        sort = new sort_1.DimensionSort({
            reference: continuousDimension.name,
            direction: sort_1.SortDirection.ascending
        });
    }
    let autoChanged = false;
    //@ts-ignore
    // Fix time sort
    if (!sort.equals(continuousSplit.sort)) {
        continuousSplit = continuousSplit.changeSort(sort);
        autoChanged = true;
    }
    //@ts-ignore
    // Fix time limit
    if (continuousSplit.limit && continuousDimension.kind === "time") {
        continuousSplit = continuousSplit.changeLimit(null);
        autoChanged = true;
    }
    if (continuousDimension.kind === "time")
        score += 3;
    if (!autoChanged)
        return visualization_manifest_1.Resolve.ready(isSelectedVisualization ? 10 : score);
    return visualization_manifest_1.Resolve.automatic(score, { splits: new splits_1.Splits({ splits: immutable_1.List([continuousSplit]) }) });
})
    .when(predicates_1.Predicates.areExactSplitKinds("time", "*"))
    .then(({ splits, dataCube }) => {
    let timeSplit = splits.getSplit(0);
    //@ts-ignore
    const timeDimension = dataCube.getDimension(timeSplit.reference);
    const sort = new sort_1.DimensionSort({
        reference: timeDimension.name,
        direction: sort_1.SortDirection.ascending
    });
    // Fix time sort
    //@ts-ignore
    if (!sort.equals(timeSplit.sort)) {
        timeSplit = timeSplit.changeSort(sort);
    }
    // Fix time limit
    //@ts-ignore
    if (timeSplit.limit) {
        timeSplit = timeSplit.changeLimit(null);
    }
    const colorSplit = splits.getSplit(1).update("limit", limit => dom_1.clamp(limit, limit_1.AVAILABLE_LIMITS[0], COLORS_COUNT));
    return visualization_manifest_1.Resolve.automatic(8, {
        splits: new splits_1.Splits({ splits: immutable_1.List([colorSplit, timeSplit]) })
    });
})
    .when(predicates_1.Predicates.areExactSplitKinds("*", "time"))
    .or(predicates_1.Predicates.areExactSplitKinds("*", "number"))
    .then(({ splits, dataCube }) => {
    let timeSplit = splits.getSplit(1);
    //@ts-ignore
    const timeDimension = dataCube.getDimension(timeSplit.reference);
    let autoChanged = false;
    const sort = new sort_1.DimensionSort({
        reference: timeDimension.name,
        direction: sort_1.SortDirection.ascending
    });
    //@ts-ignore
    // Fix time sort
    if (!sort.equals(timeSplit.sort)) {
        timeSplit = timeSplit.changeSort(sort);
        autoChanged = true;
    }
    //@ts-ignore
    // Fix time limit
    if (timeSplit.limit) {
        timeSplit = timeSplit.changeLimit(null);
        autoChanged = true;
    }
    const colorSplit = splits.getSplit(0).update("limit", limit => {
        if (limit === null || limit > COLORS_COUNT) {
            autoChanged = true;
            return COLORS_COUNT;
        }
        return limit;
    });
    if (!autoChanged)
        return visualization_manifest_1.Resolve.ready(10);
    return visualization_manifest_1.Resolve.automatic(8, {
        splits: new splits_1.Splits({ splits: immutable_1.List([colorSplit, timeSplit]) })
    });
})
    .when(predicates_1.Predicates.haveAtLeastSplitKinds("time"))
    .then(({ splits, dataCube }) => {
    //@ts-ignore
    let timeSplit = splits.splits.find(split => dataCube.getDimension(split.reference).kind === "time");
    return visualization_manifest_1.Resolve.manual(visualization_manifest_1.NORMAL_PRIORITY_ACTION, "Too many splits on the line chart", [
        {
            description: "Remove all but the time split",
            adjustment: {
                splits: splits_1.Splits.fromSplit(timeSplit)
            }
        }
    ]);
})
    .otherwise(({ dataCube }) => {
    let continuousDimensions = dataCube.getDimensionsByKind("time").concat(dataCube.getDimensionsByKind("number"));
    return visualization_manifest_1.Resolve.manual(visualization_manifest_1.NORMAL_PRIORITY_ACTION, "The Line Chart needs one continuous dimension split", continuousDimensions.map(continuousDimension => {
        return {
            description: `Split on ${continuousDimension.title} instead`,
            adjustment: {
                splits: splits_1.Splits.fromSplit(split_1.Split.fromDimension(continuousDimension))
            }
        };
    }));
})
    .build();
exports.LINE_CHART_MANIFEST = new visualization_manifest_1.VisualizationManifest("line-chart", "Line Chart", rulesEvaluator, settings_1.settings);
//# sourceMappingURL=line-chart.js.map