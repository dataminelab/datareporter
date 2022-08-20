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
const chronoshift_1 = require("chronoshift");
const essence_fixture_1 = require("../../test/essence.fixture");
const view_definition_4_fixture_1 = require("../view-definition-4.fixture");
const utils_1 = require("./utils");
describe("Timezone", () => {
    it("reads UTC timezone from string", () => {
        utils_1.assertConversionToEssence(view_definition_4_fixture_1.mockViewDefinition({ timezone: "Etc/UTC" }), essence_fixture_1.mockEssence({ timezone: chronoshift_1.Timezone.UTC }));
    });
    it("reads Europe/Warsaw timezone from string", () => {
        utils_1.assertConversionToEssence(view_definition_4_fixture_1.mockViewDefinition({ timezone: "Europe/Warsaw" }), essence_fixture_1.mockEssence({ timezone: chronoshift_1.Timezone.fromJS("Europe/Warsaw") }));
    });
    it.skip("defaults to UTC timezone for non recognized timezone", () => {
        utils_1.assertConversionToEssence(view_definition_4_fixture_1.mockViewDefinition({ timezone: "Foobar/Qvux" }), essence_fixture_1.mockEssence({ timezone: chronoshift_1.Timezone.UTC }));
    });
    it.skip("defaults to UTC timezone", () => {
        utils_1.assertConversionToEssence(view_definition_4_fixture_1.mockViewDefinition({ timezone: null }), essence_fixture_1.mockEssence({ timezone: chronoshift_1.Timezone.UTC }));
    });
});
//# sourceMappingURL=timezone-conversions.mocha.js.map