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
const table_1 = require("../../../visualization-manifests/table/table");
const totals_1 = require("../../../visualization-manifests/totals/totals");
const essence_fixture_1 = require("../../test/essence.fixture");
const view_definition_4_fixture_1 = require("../view-definition-4.fixture");
const utils_1 = require("./utils");
describe("Visualization", () => {
    const mockViewDefinitionWithVis = (visualization, visualizationSettings = null) => view_definition_4_fixture_1.mockViewDefinition({ visualization, visualizationSettings });
    const mockEssenceWithVis = (visualization, visualizationSettings = null) => essence_fixture_1.mockEssence({ visualization, visualizationSettings });
    describe("Totals", () => {
        it("reads totals visualization", () => {
            utils_1.assertConversionToEssence(mockViewDefinitionWithVis("totals"), mockEssenceWithVis(totals_1.TOTALS_MANIFEST));
        });
    });
    describe("Table", () => {
        const manifest = table_1.TABLE_MANIFEST;
        it("reads table visualization and use default settings", () => {
            utils_1.assertConversionToEssence(mockViewDefinitionWithVis("table"), 
            //@ts-ignore
            mockEssenceWithVis(manifest, manifest.visualizationSettings.defaults));
        });
        it("reads table visualization and converts settings", () => {
            const settings = { collapseRows: true };
            const convertedSettings = manifest.visualizationSettings.converter.read(settings);
            utils_1.assertConversionToEssence(mockViewDefinitionWithVis("table", settings), 
            //@ts-ignore
            mockEssenceWithVis(manifest, convertedSettings));
        });
    });
});
//# sourceMappingURL=visualization-conversions.mocha.js.map