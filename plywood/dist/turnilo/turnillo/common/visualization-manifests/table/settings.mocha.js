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
const chai_1 = require("chai");
const immutable_1 = require("immutable");
const settings_1 = require("./settings");
describe("TableSettings", () => {
    describe("defaults", () => {
        const defaults = settings_1.settings.defaults;
        it("should create record", () => {
            chai_1.expect(defaults).to.be.instanceOf(immutable_1.Record);
        });
        it("should have collapseRows prop", () => {
            chai_1.expect(defaults.has("collapseRows")).to.be.true;
        });
        it("should have collapseRows value to be false", () => {
            chai_1.expect(defaults.get("collapseRows", null)).to.be.false;
        });
    });
    describe("defaults", () => {
        const { print, read } = settings_1.settings.converter;
        const makeSettings = (collapseRows) => 
        //@ts-ignore
        new (immutable_1.Record({ collapseRows: false }))({ collapseRows });
        describe("print", () => {
            it("should print settings as object", () => {
                //@ts-ignore
                chai_1.expect(print(makeSettings(true))).to.deep.equal({ collapseRows: true });
            });
        });
        describe("read", () => {
            describe("should read settings as immutable record", () => {
                const record = read({ collapseRows: true });
                it("should read record", () => {
                    chai_1.expect(record).to.be.instanceOf(immutable_1.Record);
                });
                it("should have collapseRows prop", () => {
                    chai_1.expect(record.has("collapseRows")).to.be.true;
                });
                it("should have collapseRows value to be true", () => {
                    chai_1.expect(record.get("collapseRows", null)).to.be.true;
                });
            });
        });
    });
});
//# sourceMappingURL=settings.mocha.js.map