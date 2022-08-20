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
const duration_1 = require("./duration");
describe("Chronoshift Duration", () => {
    describe("isValidDuration", () => {
        it("should return false for invalid durations", () => {
            chai_1.expect(duration_1.isValidDuration(null), "<null>").to.be.false;
            chai_1.expect(duration_1.isValidDuration(""), "empty string").to.be.false;
            chai_1.expect(duration_1.isValidDuration("1234"), "number").to.be.false;
            chai_1.expect(duration_1.isValidDuration("1D"), "duration without leading P").to.be.false;
            chai_1.expect(duration_1.isValidDuration("P1H"), "hour duration without T").to.be.false;
        });
        it("should return true for valid durations", () => {
            chai_1.expect(duration_1.isValidDuration("PT1H"), "one hour").to.be.true;
            chai_1.expect(duration_1.isValidDuration("P2D"), "two days").to.be.true;
            chai_1.expect(duration_1.isValidDuration("P3W"), "three weeks").to.be.true;
            chai_1.expect(duration_1.isValidDuration("P2M"), "two months").to.be.true;
            chai_1.expect(duration_1.isValidDuration("P5Y"), "five years").to.be.true;
        });
    });
    describe("isFloorableDuration", () => {
        it("should return false for invalid durations", () => {
            chai_1.expect(duration_1.isFloorableDuration(null), "<null>").to.be.false;
            chai_1.expect(duration_1.isFloorableDuration(""), "empty string").to.be.false;
            chai_1.expect(duration_1.isFloorableDuration("1234"), "number").to.be.false;
            chai_1.expect(duration_1.isFloorableDuration("1D"), "duration without leading P").to.be.false;
            chai_1.expect(duration_1.isFloorableDuration("P1H"), "hour duration without T").to.be.false;
        });
        it("should return false for not floorable durations", () => {
            chai_1.expect(duration_1.isFloorableDuration("PT5H"), "five hours").to.be.false;
            chai_1.expect(duration_1.isFloorableDuration("P2D"), "two days").to.be.false;
            chai_1.expect(duration_1.isFloorableDuration("P3D"), "three days").to.be.false;
            chai_1.expect(duration_1.isFloorableDuration("P5M"), "five months").to.be.false;
            chai_1.expect(duration_1.isFloorableDuration("P3W"), "three weeks").to.be.false;
        });
        it("should return true for floorable durations", () => {
            chai_1.expect(duration_1.isFloorableDuration("PT1H"), "one hour").to.be.true;
            chai_1.expect(duration_1.isFloorableDuration("PT2H"), "two hours").to.be.true;
            chai_1.expect(duration_1.isFloorableDuration("P2M"), "two months").to.be.true;
            chai_1.expect(duration_1.isFloorableDuration("P5Y"), "five years").to.be.true;
        });
    });
});
//# sourceMappingURL=duration.mocha.js.map