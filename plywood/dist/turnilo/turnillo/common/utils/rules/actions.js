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
exports.Actions = void 0;
const splits_1 = require("../../models/splits/splits");
const visualization_manifest_1 = require("../../models/visualization-manifest/visualization-manifest");
const resolutions_1 = require("./resolutions");
class Actions {
    static ready(score = 10) {
        return () => visualization_manifest_1.Resolve.ready(score);
    }
    static manualDimensionSelection(message) {
        return ({ dataCube }) => {
            return visualization_manifest_1.Resolve.manual(visualization_manifest_1.HIGH_PRIORITY_ACTION, message, resolutions_1.Resolutions.someDimensions(dataCube));
        };
    }
    static removeExcessiveSplits(visualizationName = "Visualization") {
        return ({ splits, dataCube }) => {
            //@ts-ignore
            const newSplits = splits.splits.take(dataCube.getMaxSplits());
            //@ts-ignore
            const excessiveSplits = splits.splits
                .skip(dataCube.getMaxSplits())
                .map(split => dataCube.getDimension(split.reference).title);
            return visualization_manifest_1.Resolve.manual(visualization_manifest_1.NORMAL_PRIORITY_ACTION, `${visualizationName} supports only ${dataCube.getMaxSplits()} splits`, [
                {
                    description: `Remove excessive splits: ${excessiveSplits.toArray().join(", ")}`,
                    adjustment: {
                        splits: splits_1.Splits.fromSplits(newSplits.toArray())
                    }
                }
            ]);
        };
    }
    static manualMeasuresSelection() {
        return ({ dataCube }) => {
            const selectDefault = resolutions_1.Resolutions.defaultSelectedMeasures(dataCube);
            const resolutions = selectDefault.length > 0 ? selectDefault : resolutions_1.Resolutions.firstMeasure(dataCube);
            return visualization_manifest_1.Resolve.manual(visualization_manifest_1.NORMAL_PRIORITY_ACTION, "At least one of the measures should be selected", resolutions);
        };
    }
}
exports.Actions = Actions;
//# sourceMappingURL=actions.js.map