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
const datareporter_plywood_1 = require("datareporter-plywood");
const range_1 = require("./range");
describe("Plywood Range", () => {
    describe("union", () => {
        it("should calculate correct union", () => {
            const a = datareporter_plywood_1.Range.fromJS({ start: 1, end: 3 });
            const b = datareporter_plywood_1.Range.fromJS({ start: 3, end: 5 });
            chai_1.expect(range_1.union(a, b)).to.be.deep.equal(datareporter_plywood_1.Range.fromJS({ start: 1, end: 5 }));
        });
        it("should calculate correct union for overlaps", () => {
            const a = datareporter_plywood_1.Range.fromJS({ start: 1, end: 3 });
            const b = datareporter_plywood_1.Range.fromJS({ start: 2, end: 4 });
            chai_1.expect(range_1.union(a, b)).to.be.deep.equal(datareporter_plywood_1.Range.fromJS({ start: 1, end: 4 }));
        });
        it("should handle first non range", () => {
            const range = datareporter_plywood_1.Range.fromJS({ start: 2, end: 4 });
            chai_1.expect(range_1.union(null, range)).to.be.deep.equal(range);
            chai_1.expect(range_1.union(undefined, range)).to.be.deep.equal(range);
            chai_1.expect(range_1.union({}, range)).to.be.deep.equal(range);
        });
        it("should handle second non range", () => {
            const range = datareporter_plywood_1.Range.fromJS({ start: 2, end: 4 });
            chai_1.expect(range_1.union(range, null)).to.be.deep.equal(range);
            chai_1.expect(range_1.union(range, undefined)).to.be.deep.equal(range);
            chai_1.expect(range_1.union(range, {})).to.be.deep.equal(range);
        });
        it("should return null when no ranges", () => {
            chai_1.expect(range_1.union(undefined, null)).to.be.null;
            chai_1.expect(range_1.union(undefined, undefined)).to.be.null;
            chai_1.expect(range_1.union(null, {})).to.be.null;
            chai_1.expect(range_1.union({}, null)).to.be.null;
            chai_1.expect(range_1.union({}, undefined)).to.be.null;
        });
    });
});
//# sourceMappingURL=range.mocha.js.map