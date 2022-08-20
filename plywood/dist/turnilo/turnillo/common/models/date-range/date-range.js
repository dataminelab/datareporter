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
exports.DateRange = void 0;
const immutable_1 = require("immutable");
const datareporter_plywood_1 = require("datareporter-plywood");
const defaultDateRange = { start: null, end: null };
//@ts-ignore
const plywoodRange = ({ start, end }) => datareporter_plywood_1.Range.fromJS({ start, end, bounds: "()" });
//@ts-ignore
class DateRange extends immutable_1.Record(defaultDateRange) {
    intersects(other) {
        return other instanceof DateRange && plywoodRange(this).intersects(plywoodRange(other));
    }
    shift(duration, timezone) {
        //@ts-ignore
        return this
            //@ts-ignore
            .set("start", duration.shift(this.start, timezone, -1))
            //@ts-ignore
            .set("end", duration.shift(this.end, timezone, -1));
    }
}
exports.DateRange = DateRange;
//# sourceMappingURL=date-range.js.map