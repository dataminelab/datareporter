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
exports.assertEqlEssenceWithoutVisResolve = exports.assertEqlEssence = void 0;
const chai_1 = require("chai");
function assertEqlEssence(actual, expected) {
    try {
        chai_1.expect(actual.equals(expected)).to.be.true;
    }
    catch (e) {
        chai_1.expect(actual.toJS()).to.deep.equal(expected.toJS());
        throw e;
    }
}
exports.assertEqlEssence = assertEqlEssence;
function assertEqlEssenceWithoutVisResolve(actual, expected) {
    //@ts-ignore
    assertEqlEssence(actual.set("visResolve", null), expected.set("visResolve", null));
}
exports.assertEqlEssenceWithoutVisResolve = assertEqlEssenceWithoutVisResolve;
//# sourceMappingURL=assertions.js.map