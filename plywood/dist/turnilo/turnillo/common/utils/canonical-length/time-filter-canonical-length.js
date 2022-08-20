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
const chronoshift_1 = require("chronoshift");
function timeFilterCanonicalLength(essence, timekeeper) {
    const currentTimeFilter = essence.currentTimeFilter(timekeeper);
    //@ts-ignore
    const { start, end } = currentTimeFilter.values.get(0);
    //@ts-ignore
    const currentTimeRange = new chronoshift_1.Duration(start, end, essence.timezone);
    return currentTimeRange.getCanonicalLength();
}
exports.default = timeFilterCanonicalLength;
//# sourceMappingURL=time-filter-canonical-length.js.map