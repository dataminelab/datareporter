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
const time_shift_1 = require("../../../models/time-shift/time-shift");
const essence_fixture_1 = require("../../test/essence.fixture");
const view_definition_4_fixture_1 = require("../view-definition-4.fixture");
const utils_1 = require("./utils");
describe("TimeShift", () => {
    it("defaults to empty time shift when no time shift given", () => {
        utils_1.assertConversionToEssence(
        // not really mocks
        view_definition_4_fixture_1.mockViewDefinition({ timeShift: undefined }), essence_fixture_1.mockEssence({ timeShift: time_shift_1.TimeShift.empty() }));
    });
    it.skip("reads time shift from duration string", () => {
        // TODO: timeshift comparison doesn't work because of incompatibility between immutable.equal and imply libs insisting on overriting valueOf
        utils_1.assertConversionToEssence(view_definition_4_fixture_1.mockViewDefinition({ timeShift: "P3D" }), essence_fixture_1.mockEssence({ timeShift: time_shift_1.TimeShift.fromJS("P3D") }));
    });
    it("constrains to empty if shifted period overlaps with time filter period", () => {
        utils_1.assertConversionToEssence(view_definition_4_fixture_1.mockViewDefinition({ timeShift: "PT3H" }), essence_fixture_1.mockEssence({ timeShift: time_shift_1.TimeShift.empty() }));
    });
});
//# sourceMappingURL=time-shift-conversions.mocha.js.map