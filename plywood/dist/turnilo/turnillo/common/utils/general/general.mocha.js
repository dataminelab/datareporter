"use strict";
/*
 * Copyright 2015-2016 Imply Data, Inc.
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
const immutable_1 = require("immutable");
const general_1 = require("./general");
describe("General", () => {
    describe("moveInList", () => {
        it("works in simple case 0", () => {
            var list = immutable_1.List("ABCD".split(""));
            chai_1.expect(general_1.moveInList(list, 0, 0).join("")).to.equal("ABCD");
        });
        it("works in simple case 1", () => {
            var list = immutable_1.List("ABCD".split(""));
            chai_1.expect(general_1.moveInList(list, 0, 1).join("")).to.equal("ABCD");
        });
        it("works in simple case 2", () => {
            var list = immutable_1.List("ABCD".split(""));
            chai_1.expect(general_1.moveInList(list, 0, 2).join("")).to.equal("BACD");
        });
        it("works in simple case 3", () => {
            var list = immutable_1.List("ABCD".split(""));
            chai_1.expect(general_1.moveInList(list, 0, 3).join("")).to.equal("BCAD");
        });
        it("works in simple case 4", () => {
            var list = immutable_1.List("ABCD".split(""));
            chai_1.expect(general_1.moveInList(list, 0, 4).join("")).to.equal("BCDA");
        });
    });
    describe("verifyUrlSafeName", () => {
        it("works in good case", () => {
            general_1.verifyUrlSafeName("a_b-c.d~E059");
        });
        it("works in bad case", () => {
            chai_1.expect(() => {
                general_1.verifyUrlSafeName("abcd%po#@$moon is!cool");
            }).to.throw("'abcd%po#@$moon is!cool' is not a URL safe name. Try 'abcd_po_moon_is_cool' instead?");
        });
    });
    describe("makeTitle", () => {
        it("works in simple snake case", () => {
            chai_1.expect(general_1.makeTitle("hello_world")).to.equal("Hello World");
        });
        it("works in simple camel case", () => {
            chai_1.expect(general_1.makeTitle("helloWorld")).to.equal("Hello World");
        });
        it("works with leading and trailing _", () => {
            chai_1.expect(general_1.makeTitle("_hello_world_")).to.equal("Hello World");
        });
        it("works with trailing numbers in the middle", () => {
            chai_1.expect(general_1.makeTitle("hello99_world")).to.equal("Hello99 World");
        });
        it("works with trailing numbers at the end", () => {
            chai_1.expect(general_1.makeTitle("hello_world99")).to.equal("Hello World99");
        });
    });
    describe("inlineVars", () => {
        it("works in simple case", () => {
            var json = {
                "hello": 1,
                "port": "%{PORT}%",
                "fox says %{}%": "%{FOX_SAYS}%"
            };
            var vars = {
                PORT: "1234",
                FOX_SAYS: "Meow"
            };
            chai_1.expect(general_1.inlineVars(json, vars)).to.deep.equal({
                "hello": 1,
                "port": "1234",
                "fox says %{}%": "Meow"
            });
        });
        it("throw error if can not find var", () => {
            var json = {
                "hello": 1,
                "port": "%{PORT}%",
                "fox says %{}%": "%{FOX_SAYS}%"
            };
            var vars = {
                PORT: "1234"
            };
            chai_1.expect(() => general_1.inlineVars(json, vars)).to.throw("could not find variable 'FOX_SAYS'");
        });
    });
    describe("ensureOneOf", () => {
        it("does not thrown an error is one of", () => {
            general_1.ensureOneOf("Honda", ["Honda", "Toyota", "BMW"], "Car");
        });
        it("throw error not one of", () => {
            chai_1.expect(() => {
                general_1.ensureOneOf("United Kingdom", ["Honda", "Toyota", "BMW"], "Car");
            }).to.throw("Car must be on of 'Honda', 'Toyota', 'BMW' (is 'United Kingdom')");
        });
        it("throw error not one of (undefined)", () => {
            chai_1.expect(() => {
                general_1.ensureOneOf(undefined, ["Honda", "Toyota", "BMW"], "Car");
            }).to.throw("Car must be on of 'Honda', 'Toyota', 'BMW' (is not defined)");
        });
    });
    describe("isDecimalInteger", () => {
        it("should return false for invalid numbers", () => {
            chai_1.expect(general_1.isDecimalInteger(null), "<null>").to.be.false;
            chai_1.expect(general_1.isDecimalInteger(""), "empty string").to.be.false;
            chai_1.expect(general_1.isDecimalInteger("foobar"), "foobar").to.be.false;
        });
        it("should return false for floats", () => {
            chai_1.expect(general_1.isDecimalInteger("1.23"), "float").to.be.false;
            chai_1.expect(general_1.isDecimalInteger("1e4"), "scientific notation").to.be.false;
        });
        it("should return false for non decimal numbers", () => {
            chai_1.expect(general_1.isDecimalInteger("0xdeadbeef"), "hex").to.be.false;
            chai_1.expect(general_1.isDecimalInteger("0o1234"), "octal").to.be.false;
            chai_1.expect(general_1.isDecimalInteger("0b010101"), "binary").to.be.false;
        });
        it("should return false for numbers with additional characters", () => {
            chai_1.expect(general_1.isDecimalInteger("1234foobar"), "1234foobar").to.be.false;
        });
    });
    describe("readNumber", () => {
        it("should return number if number passed", () => {
            chai_1.expect(general_1.readNumber(123)).to.equal(123);
        });
        it("should parse string to float", () => {
            chai_1.expect(general_1.readNumber("1"), "integer").to.equal(1);
            chai_1.expect(general_1.readNumber("1.1"), "float").to.equal(1.1);
        });
        it("should return NaN if not a number", () => {
            chai_1.expect(general_1.readNumber("foobar"), "foobar").to.be.NaN;
            chai_1.expect(general_1.readNumber("NaN"), "NaN").to.be.NaN;
            chai_1.expect(general_1.readNumber(null), "<null>").to.be.NaN;
            chai_1.expect(general_1.readNumber(undefined), "<undefined>").to.be.NaN;
        });
    });
});
//# sourceMappingURL=general.mocha.js.map