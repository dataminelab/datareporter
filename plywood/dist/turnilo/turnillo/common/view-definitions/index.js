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
exports.version2Visualizations = exports.defaultDefinitionUrlEncoder = exports.defaultDefinitionConverter = exports.definitionUrlEncoders = exports.definitionConverters = exports.LEGACY_VIEW_DEFINITION_VERSION = exports.DEFAULT_VIEW_DEFINITION_VERSION = void 0;
const view_definition_converter_2_1 = require("./version-2/view-definition-converter-2");
const view_definition_hash_encoder2_1 = require("./version-2/view-definition-hash-encoder2");
const view_definition_converter_3_1 = require("./version-3/view-definition-converter-3");
const view_definition_hash_encoder3_1 = require("./version-3/view-definition-hash-encoder3");
const view_definition_converter_4_1 = require("./version-4/view-definition-converter-4");
exports.DEFAULT_VIEW_DEFINITION_VERSION = "4";
exports.LEGACY_VIEW_DEFINITION_VERSION = "2";
exports.definitionConverters = {
    2: new view_definition_converter_2_1.ViewDefinitionConverter2(),
    3: new view_definition_converter_3_1.ViewDefinitionConverter3(),
    4: new view_definition_converter_4_1.ViewDefinitionConverter4()
};
exports.definitionUrlEncoders = {
    2: new view_definition_hash_encoder2_1.ViewDefinitionHashEncoder2(),
    3: new view_definition_hash_encoder3_1.ViewDefinitionHashEncoder3(),
    4: new view_definition_hash_encoder3_1.ViewDefinitionHashEncoder3()
};
exports.defaultDefinitionConverter = exports.definitionConverters[exports.DEFAULT_VIEW_DEFINITION_VERSION];
exports.defaultDefinitionUrlEncoder = exports.definitionUrlEncoders[exports.DEFAULT_VIEW_DEFINITION_VERSION];
exports.version2Visualizations = new Set([
    "totals",
    "table",
    "line-chart",
    "bar-chart"
]);
//# sourceMappingURL=index.js.map