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
exports.assertConversionToEssence = exports.toEssence = void 0;
const assertions_1 = require("../../test/assertions");
const data_cube_fixture_1 = require("../../test/data-cube.fixture");
const view_definition_converter_4_1 = require("../view-definition-converter-4");
const converter = new view_definition_converter_4_1.ViewDefinitionConverter4();
const toEssence = (viewDef) => converter.fromViewDefinition(viewDef, data_cube_fixture_1.dataCube);
exports.toEssence = toEssence;
function assertConversionToEssence(viewDef, essence) {
    assertions_1.assertEqlEssence(exports.toEssence(viewDef), essence);
}
exports.assertConversionToEssence = assertConversionToEssence;
//# sourceMappingURL=utils.js.map