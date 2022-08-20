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
exports.SuccessUrlShortener = exports.SuccessUrlShortenerJS = exports.FailUrlShortener = exports.FailUrlShortenerJS = void 0;
const url_shortener_1 = require("./url-shortener");
exports.FailUrlShortenerJS = "return Promise.reject(new Error('error message'));";
exports.FailUrlShortener = new url_shortener_1.UrlShortener(exports.FailUrlShortenerJS);
exports.SuccessUrlShortenerJS = "return Promise.resolve('http://foobar');";
exports.SuccessUrlShortener = new url_shortener_1.UrlShortener(exports.SuccessUrlShortenerJS);
//# sourceMappingURL=url-shortener.fixtures.js.map