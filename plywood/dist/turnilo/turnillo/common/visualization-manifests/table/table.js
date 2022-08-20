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
exports.TABLE_MANIFEST = void 0;
const visualization_manifest_1 = require("../../models/visualization-manifest/visualization-manifest");
const actions_1 = require("../../utils/rules/actions");
const predicates_1 = require("../../utils/rules/predicates");
const visualization_dependent_evaluator_1 = require("../../utils/rules/visualization-dependent-evaluator");
const settings_1 = require("./settings");
const rulesEvaluator = visualization_dependent_evaluator_1.visualizationDependentEvaluatorBuilder
    .when(predicates_1.Predicates.noSplits())
    .then(actions_1.Actions.manualDimensionSelection("The Table requires at least one split"))
    .when(predicates_1.Predicates.supportedSplitsCount())
    .then(actions_1.Actions.removeExcessiveSplits("Table"))
    .otherwise(({ splits, dataCube, isSelectedVisualization }) => {
    let autoChanged = false;
    const newSplits = splits.update("splits", splits => splits.map((split, i) => {
        const splitDimension = dataCube.getDimension(split.reference);
        // ToDo: review this
        if (!split.limit && splitDimension.kind !== "time") {
            split = split.changeLimit(i ? 5 : 50);
            autoChanged = true;
        }
        return split;
    }));
    //@ts-ignore
    return autoChanged ? visualization_manifest_1.Resolve.automatic(6, { splits: newSplits }) : visualization_manifest_1.Resolve.ready(isSelectedVisualization ? 10 : 6);
})
    .build();
exports.TABLE_MANIFEST = new visualization_manifest_1.VisualizationManifest("table", "Table", rulesEvaluator, settings_1.settings);
//# sourceMappingURL=table.js.map