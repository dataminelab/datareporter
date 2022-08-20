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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinon = __importStar(require("sinon"));
const test_utils_1 = require("../../../client/utils/test-utils");
const functional_1 = require("./functional");
const inc = (x) => x + 1;
const double = (x) => x * 2;
const nil = () => null;
const wrap = (...numbers) => numbers;
describe("Functional utilities", () => {
    describe("constant", () => {
        it("should return function that always returns initial argument", () => {
            const f = functional_1.constant(42);
            chai_1.expect(f()).to.eq(42);
        });
    });
    describe("cons", () => {
        it("should append to empty array", () => {
            chai_1.expect(functional_1.cons([], 1)).to.deep.eq([1]);
        });
        it("should keep nested arrays", () => {
            chai_1.expect(functional_1.cons([], [1])).to.deep.eq([[1]]);
        });
    });
    describe("zip", () => {
        it("should merge arrays with same length", () => {
            chai_1.expect(functional_1.zip([1, 2, 3], ["a", "b", "c"])).to.deep.eq([
                [1, "a"],
                [2, "b"],
                [3, "c"]
            ]);
        });
        it("should merge common subsets of arrays with different length (first array longer)", () => {
            chai_1.expect(functional_1.zip([1, 2, 3, 4], ["a", "b"])).to.deep.eq([
                [1, "a"],
                [2, "b"]
            ]);
        });
        it("should merge common subsets of arrays with different length (second array longer)", () => {
            chai_1.expect(functional_1.zip([1, 2], ["a", "b", "c", "d"])).to.deep.eq([
                [1, "a"],
                [2, "b"]
            ]);
        });
    });
    describe("range", () => {
        it("should return range from 0 to exclusive 3", () => {
            chai_1.expect(functional_1.range(0, 3)).to.deep.eq([0, 1, 2]);
        });
        it("should return range from 5 to exclusive 10", () => {
            chai_1.expect(functional_1.range(5, 10)).to.deep.eq([5, 6, 7, 8, 9]);
        });
    });
    describe("flatMap", () => {
        it("should flatten", () => {
            const result = functional_1.flatMap([1, 3], (i) => wrap(i, inc(i)));
            chai_1.expect(result).to.deep.eq([1, 2, 3, 4]);
        });
        it("should omit empty arrays as values", () => {
            const result = functional_1.flatMap([1, 2, 3, 4], () => []);
            chai_1.expect(result).to.deep.eq([]);
        });
    });
    describe("concatTruthy", () => {
        it("should omit falsy values", () => {
            const result = functional_1.concatTruthy(0, 1, false, 2, 3, null, 4, undefined, 5);
            chai_1.expect(result).to.deep.eq([0, 1, 2, 3, 4, 5]);
        });
    });
    describe("mapTruthy", () => {
        it("should omit falsy values from mapper", () => {
            const result = functional_1.mapTruthy([1, 2, 3, 4, 5], (i) => i % 2 ? i : null);
            chai_1.expect(result).to.deep.eq([1, 3, 5]);
        });
    });
    describe("thread", () => {
        it("should thread value through all functions", () => {
            const result = functional_1.thread(1, inc, double, inc);
            chai_1.expect(result).to.eq(5);
        });
    });
    describe("threadNullable", () => {
        it("should thread value through all function as long all return values are truthy", () => {
            const result = functional_1.threadNullable(1, inc, double, inc);
            chai_1.expect(result).to.eq(5);
        });
        it("should return falsy value if some function in thread returns falsy value", () => {
            const result = functional_1.threadNullable(1, inc, nil, inc, inc);
            chai_1.expect(result).to.eq(null);
        });
    });
    describe("threadConditionally", () => {
        it("should thread value through all function as long all functions are callable", () => {
            const result = functional_1.threadConditionally(1, inc, double, inc);
            chai_1.expect(result).to.eq(5);
        });
        it("should omit falsy values in call chain", () => {
            const result = functional_1.threadConditionally(1, inc, undefined, double, null, inc);
            chai_1.expect(result).to.eq(5);
        });
    });
    describe("complement", () => {
        it("should produce complement predicate", () => {
            const moreThanTen = (x) => x > 10;
            chai_1.expect(moreThanTen(5)).to.be.not.equal(functional_1.complement(moreThanTen)(5));
            chai_1.expect(moreThanTen(15)).to.be.not.equal(functional_1.complement(moreThanTen)(15));
        });
    });
    describe("debounceWithPromise", () => {
        let callSpy;
        beforeEach(() => {
            callSpy = sinon.spy();
        });
        it("should call function once", () => __awaiter(void 0, void 0, void 0, function* () {
            const debounced = functional_1.debounceWithPromise(callSpy, 10);
            debounced();
            debounced();
            debounced();
            chai_1.expect(callSpy.callCount).to.eq(0);
            yield test_utils_1.sleep(10);
            chai_1.expect(callSpy.callCount).to.eq(1);
        }));
        it("should call function with argument of last invocation", () => __awaiter(void 0, void 0, void 0, function* () {
            const debounced = functional_1.debounceWithPromise(callSpy, 10);
            debounced(1);
            debounced(2);
            debounced(3);
            yield test_utils_1.sleep(10);
            chai_1.expect(callSpy.calledWith(3)).to.be.true;
        }));
        it("should call function again after if time passes", () => __awaiter(void 0, void 0, void 0, function* () {
            const debounced = functional_1.debounceWithPromise(callSpy, 10);
            debounced();
            debounced();
            debounced();
            chai_1.expect(callSpy.callCount).to.eq(0);
            yield test_utils_1.sleep(10);
            chai_1.expect(callSpy.callCount).to.eq(1);
            debounced();
            yield test_utils_1.sleep(10);
            chai_1.expect(callSpy.callCount).to.eq(2);
        }));
        it("should not call function after cancelation", () => __awaiter(void 0, void 0, void 0, function* () {
            const debounced = functional_1.debounceWithPromise(callSpy, 10);
            debounced();
            debounced();
            debounced.cancel();
            yield test_utils_1.sleep(10);
            chai_1.expect(callSpy.callCount).to.eq(0);
        }));
        it("should return promise with value", () => __awaiter(void 0, void 0, void 0, function* () {
            const returnVal = 5;
            const debounced = functional_1.debounceWithPromise(() => returnVal, 10);
            const x = yield debounced();
            chai_1.expect(x).to.be.eq(returnVal);
        }));
    });
});
//# sourceMappingURL=functional.mocha.js.map