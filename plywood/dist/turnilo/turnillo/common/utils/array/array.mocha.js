"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
const chai_1 = require("chai");
const array_1 = require("./array");
describe("shallowArrayEquals", () => {
    it("should return false when A is falsy", () => {
        chai_1.expect(array_1.shallowEqualArrays(null, [])).to.be.false;
    });
    it("should return false when B is falsy", () => {
        chai_1.expect(array_1.shallowEqualArrays([], undefined)).to.be.false;
    });
    it("should return true when arrays are the same reference", () => {
        const a = ["foobar"];
        chai_1.expect(array_1.shallowEqualArrays(a, a)).to.be.true;
    });
    it("should return true when both empty", () => {
        chai_1.expect(array_1.shallowEqualArrays([], [])).to.be.true;
    });
    it("should return false when have different length", () => {
        chai_1.expect(array_1.shallowEqualArrays([1, 1], [1, 1, 1])).to.be.false;
    });
    it("should return false when have different elements", () => {
        chai_1.expect(array_1.shallowEqualArrays([1, 2, 3], [1, 2, 4])).to.be.false;
    });
    it("should return true when all elements are the same", () => {
        chai_1.expect(array_1.shallowEqualArrays([1, "foobar", true], [1, "foobar", true])).to.be.true;
    });
});
describe("insert", () => {
    it("inserts element at the begining", () => {
        chai_1.expect(array_1.insert([3, 7, 9], 0, 66)).to.be.deep.eq([66, 3, 7, 9]);
    });
    it("inserts element at the end", () => {
        chai_1.expect(array_1.insert([3, 7, 9], 4, 66)).to.be.deep.eq([3, 7, 9, 66]);
    });
    it("inserts element in the middle", () => {
        chai_1.expect(array_1.insert([3, 7, 9], 2, 66)).to.be.deep.eq([3, 7, 66, 9]);
    });
});
//# sourceMappingURL=array.mocha.js.map