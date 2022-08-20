"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
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
const datareporter_plywood_1 = require("datareporter-plywood");
const some_1 = __importDefault(require("./some"));
const isRefExp = (e) => e instanceof datareporter_plywood_1.RefExpression;
describe("Plywood Expression.some", () => {
    it("should return true for top-level value satisfies predicate", () => {
        chai_1.expect(some_1.default(datareporter_plywood_1.$("main"), isRefExp)).to.be.true;
    });
    it("should return true for nested value satisfies predicate", () => {
        chai_1.expect(some_1.default(datareporter_plywood_1.$("main").multiply(2), isRefExp)).to.be.true;
    });
    it("should return false when nothing satisfies predicate", () => {
        const isCountDistinct = (e) => e instanceof datareporter_plywood_1.CountDistinctExpression;
        chai_1.expect(some_1.default(datareporter_plywood_1.$("main").multiply(2), isCountDistinct)).to.be.false;
    });
});
//# sourceMappingURL=some.mocha.js.map