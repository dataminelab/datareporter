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
const immutable_class_tester_1 = require("immutable-class-tester");
const url_shortener_1 = require("./url-shortener");
const url_shortener_fixtures_1 = require("./url-shortener.fixtures");
describe("UrlShortener", () => {
    it("is an immutable class", () => {
        immutable_class_tester_1.testImmutableClass(url_shortener_1.UrlShortener, [
            url_shortener_fixtures_1.SuccessUrlShortenerJS,
            url_shortener_fixtures_1.FailUrlShortenerJS
        ]);
    });
});
//# sourceMappingURL=url-shortener.mocha.js.map