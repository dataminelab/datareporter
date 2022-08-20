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
exports.seriesDefinitionConverter = void 0;
const series_list_1 = require("../../models/series-list/series-list");
exports.seriesDefinitionConverter = {
    //@ts-ignore
    fromEssenceSeries: (seriesList) => 
    //@ts-ignore
    seriesList.series.toArray().map(series => series.toJS()),
    toEssenceSeries: (seriesDefs, measures) => series_list_1.SeriesList.fromJS(seriesDefs, measures)
};
//# sourceMappingURL=series-definition.js.map