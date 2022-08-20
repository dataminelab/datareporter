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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const immutable_1 = require("immutable");
const nullable_equals_1 = __importDefault(require("./nullable-equals"));
//@ts-ignore
class DummyRecord extends immutable_1.Record({ dummy: 1 }) {
}
const dummy = (dummy) => new DummyRecord({ dummy });
describe("nullable equals", () => {
    describe("should return true", () => {
        it("for both nulls", () => {
            chai_1.expect(nullable_equals_1.default(null, null)).to.be.true;
        });
        it("for same value", () => {
            const val = dummy(1);
            chai_1.expect(nullable_equals_1.default(val, val)).to.be.true;
        });
        it("for identical values", () => {
            chai_1.expect(nullable_equals_1.default(dummy(1), dummy(1))).to.be.true;
        });
    });
    describe("should return false", () => {
        it("if only first is null", () => {
            chai_1.expect(nullable_equals_1.default(null, dummy(1))).to.be.false;
        });
        it("if only second is null", () => {
            chai_1.expect(nullable_equals_1.default(dummy(1), null)).to.be.false;
        });
        it("for different values", () => {
            chai_1.expect(nullable_equals_1.default(dummy(1), dummy(2))).to.be.false;
            chai_1.expect(nullable_equals_1.default(dummy(25), dummy(80))).to.be.false;
        });
    });
});
//# sourceMappingURL=nullable-equals.mocha.js.map