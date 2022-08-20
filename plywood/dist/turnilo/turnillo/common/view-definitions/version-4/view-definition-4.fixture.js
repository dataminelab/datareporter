"use strict";
/*
 * Copyright 2017-2018 Allegro.pl
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
exports.mockViewDefinition = void 0;
const chronoshift_1 = require("chronoshift");
const totals_1 = require("../../visualization-manifests/totals/totals");
const filter_definition_fixtures_1 = require("./filter-definition.fixtures");
const defaults = {
    filters: [filter_definition_fixtures_1.flooredTimeFilterDefinition("time", -1, "P1D")],
    splits: [],
    series: [{ reference: "count" }, { reference: "sum" }],
    pinnedDimensions: ["string_a"],
    timezone: chronoshift_1.Timezone.UTC.toString(),
    visualization: totals_1.TOTALS_MANIFEST.name
};
function mockViewDefinition(opts = {}) {
    return Object.assign(Object.assign({}, defaults), opts);
}
exports.mockViewDefinition = mockViewDefinition;
//# sourceMappingURL=view-definition-4.fixture.js.map