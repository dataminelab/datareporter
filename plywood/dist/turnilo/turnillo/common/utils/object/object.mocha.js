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
const chai_1 = require("chai");
const object_1 = require("./object");
describe("Object utils", () => {
    describe("omitFalsyValues", () => {
        it("should omit falsy values", () => {
            const input = {
                a: 0,
                b: false,
                c: undefined,
                d: null,
                e: 1,
                f: "str"
            };
            const output = {
                a: 0,
                e: 1,
                f: "str"
            };
            chai_1.expect(object_1.omitFalsyValues(input)).to.be.deep.equal(output);
        });
        it("should handle empty object", () => {
            chai_1.expect(object_1.omitFalsyValues({})).to.be.deep.equal({});
        });
        it("should not modify input object", () => {
            const input = {
                a: null,
                b: undefined,
                c: false,
                d: "str"
            };
            const inputCopy = Object.assign({}, input);
            object_1.omitFalsyValues(input);
            chai_1.expect(input).to.deep.equal(inputCopy);
        });
    });
});
//# sourceMappingURL=object.mocha.js.map