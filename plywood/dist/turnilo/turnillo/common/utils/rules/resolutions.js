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
exports.Resolutions = void 0;
const immutable_1 = require("immutable");
const series_list_1 = require("../../models/series-list/series-list");
const measure_series_1 = require("../../models/series/measure-series");
const split_1 = require("../../models/split/split");
const splits_1 = require("../../models/splits/splits");
class Resolutions {
}
exports.Resolutions = Resolutions;
Resolutions.someDimensions = (dataCube) => {
    const numberOfSuggestedSplitDimensions = 2;
    const suggestedSplitDimensions = dataCube
        .getDimensionsByKind("string")
        .slice(0, numberOfSuggestedSplitDimensions);
    return suggestedSplitDimensions.map(dimension => {
        return {
            description: `Add a split on ${dimension.title}`,
            adjustment: {
                splits: splits_1.Splits.fromSplit(split_1.Split.fromDimension(dimension))
            }
        };
    });
};
Resolutions.defaultSelectedMeasures = (dataCube) => {
    const defaultSelectedMeasures = dataCube.defaultSelectedMeasures || immutable_1.OrderedSet();
    const measures = defaultSelectedMeasures.map(measureName => dataCube.getMeasure(measureName)).toArray();
    if (measures.length === 0) {
        return [];
    }
    const measureTitles = measures.map(measure => measure.title);
    return [
        {
            description: `Select default measures: ${measureTitles.join(", ")}`,
            adjustment: {
                series: new series_list_1.SeriesList({ series: immutable_1.List(measures.map(measure => measure_series_1.MeasureSeries.fromMeasure(measure))) })
            }
        }
    ];
};
Resolutions.firstMeasure = (dataCube) => {
    const firstMeasure = dataCube.measures.first();
    if (!firstMeasure)
        return [];
    return [
        {
            description: `Select measure: ${firstMeasure.title}`,
            adjustment: {
                series: new series_list_1.SeriesList({ series: immutable_1.List.of(measure_series_1.MeasureSeries.fromMeasure(firstMeasure)) })
            }
        }
    ];
};
//# sourceMappingURL=resolutions.js.map