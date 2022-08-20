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
const assertions_1 = require("../../test/assertions");
const essence_fixture_1 = require("../../test/essence.fixture");
const view_definition_4_fixture_1 = require("../view-definition-4.fixture");
const utils_1 = require("./utils");
describe("ViewDefinitionConverter4", () => {
    describe("Base case", () => {
        it("converts base view definition mock to base essence mock", () => {
            const result = utils_1.toEssence(view_definition_4_fixture_1.mockViewDefinition());
            const expected = essence_fixture_1.mockEssence();
            assertions_1.assertEqlEssence(result, expected);
        });
    });
});
//# sourceMappingURL=view-definition-converter-4.mocha.js.map