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
exports.visualizationIndependentEvaluator = void 0;
const actions_1 = require("./actions");
const predicates_1 = require("./predicates");
const rules_evaluator_builder_1 = require("./rules-evaluator-builder");
exports.visualizationIndependentEvaluator = rules_evaluator_builder_1.RulesEvaluatorBuilder.empty()
    .when(predicates_1.Predicates.noSelectedMeasures())
    .then(actions_1.Actions.manualMeasuresSelection())
    .otherwise(actions_1.Actions.ready())
    .build();
//# sourceMappingURL=visualization-independent-evaluator.js.map