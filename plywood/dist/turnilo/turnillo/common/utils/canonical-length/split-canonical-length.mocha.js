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
const chronoshift_1 = require("chronoshift");
const data_cube_fixtures_1 = require("../../models/data-cube/data-cube.fixtures");
const split_fixtures_1 = require("../../models/split/split.fixtures");
const split_canonical_length_1 = __importDefault(require("./split-canonical-length"));
const dataCube = data_cube_fixtures_1.DataCubeFixtures.wiki();
const timeSplitName = dataCube.timeAttribute.name;
describe("Split canonical length", () => {
    it("returns null for non-time split", () => {
        const stringSplit = split_fixtures_1.stringSplitCombine("foobar");
        chai_1.expect(split_canonical_length_1.default(stringSplit, dataCube)).to.be.null;
    });
    it("returns bucket canonical length for time split with hour granularity", () => {
        const timeSplit = split_fixtures_1.timeSplitCombine(timeSplitName, "PT1H");
        chai_1.expect(split_canonical_length_1.default(timeSplit, dataCube)).to.equal(chronoshift_1.hour.canonicalLength);
    });
    it("returns bucket canonical length for time split with month granularity", () => {
        const timeSplit = split_fixtures_1.timeSplitCombine(timeSplitName, "P1M");
        chai_1.expect(split_canonical_length_1.default(timeSplit, dataCube)).to.equal(chronoshift_1.month.canonicalLength);
    });
});
//# sourceMappingURL=split-canonical-length.mocha.js.map