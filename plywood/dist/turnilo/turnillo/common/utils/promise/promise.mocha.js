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
const sinon_1 = require("sinon");
const test_utils_1 = require("../../../client/utils/test-utils");
const promise_1 = require("./promise");
describe("Promise utils", () => {
    describe("timeout", () => {
        it("should reject after defined timeout in ms", () => __awaiter(void 0, void 0, void 0, function* () {
            const successSpy = sinon_1.spy();
            const failureSpy = sinon_1.spy();
            promise_1.timeout(10).then(successSpy).catch(failureSpy);
            chai_1.expect(successSpy.called).to.be.false;
            chai_1.expect(failureSpy.called).to.be.false;
            yield test_utils_1.sleep(10);
            chai_1.expect(successSpy.called).to.be.false;
            chai_1.expect(failureSpy.called).to.be.true;
        }));
    });
    describe("Deferred", () => {
        it("should resolve with method", () => __awaiter(void 0, void 0, void 0, function* () {
            const onResolve = sinon_1.spy();
            const deferred = new promise_1.Deferred();
            const promise = deferred.promise;
            promise.then(onResolve);
            deferred.resolve("resolve");
            yield promise;
            chai_1.expect(onResolve.calledOnce).to.be.true;
            chai_1.expect(onResolve.calledWith("resolve")).to.be.true;
        }));
        it("should reject with method", () => __awaiter(void 0, void 0, void 0, function* () {
            const onReject = sinon_1.spy();
            const deferred = new promise_1.Deferred();
            const promise = deferred.promise;
            promise.catch(onReject);
            deferred.reject("reject");
            try {
                yield promise;
            }
            catch (_a) {
                // empty catch for promise rejection
            }
            chai_1.expect(onReject.calledOnce).to.be.true;
            chai_1.expect(onReject.calledWith("reject")).to.be.true;
        }));
    });
});
//# sourceMappingURL=promise.mocha.js.map