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
exports.TOTALS_MANIFEST = void 0;
const splits_1 = require("../../models/splits/splits");
const visualization_manifest_1 = require("../../models/visualization-manifest/visualization-manifest");
const empty_settings_config_1 = require("../../models/visualization-settings/empty-settings-config");
const predicates_1 = require("../../utils/rules/predicates");
const visualization_dependent_evaluator_1 = require("../../utils/rules/visualization-dependent-evaluator");
const rulesEvaluator = visualization_dependent_evaluator_1.visualizationDependentEvaluatorBuilder
    .when(predicates_1.Predicates.noSplits())
    .then(() => visualization_manifest_1.Resolve.ready(10))
    .otherwise(() => visualization_manifest_1.Resolve.automatic(3, { splits: splits_1.EMPTY_SPLITS }))
    .build();
exports.TOTALS_MANIFEST = new visualization_manifest_1.VisualizationManifest("totals", "Totals", rulesEvaluator, empty_settings_config_1.emptySettingsConfig);
//# sourceMappingURL=totals.js.map