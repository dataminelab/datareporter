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
exports.hashToObject = exports.hashToArray = exports.objectToHash = exports.arrayToHash = void 0;
const lz_string_1 = require("lz-string");
function arrayToHash(array) {
    const concatenated = array
        .map(element => JSON.stringify(element || null))
        .join(",");
    return lz_string_1.compressToBase64(concatenated);
}
exports.arrayToHash = arrayToHash;
function objectToHash(anyObject) {
    return lz_string_1.compressToBase64(JSON.stringify(anyObject));
}
exports.objectToHash = objectToHash;
function hashToArray(hash) {
    const decompressed = lz_string_1.decompressFromBase64(hash);
    const jsArray = JSON.parse("[" + decompressed + "]");
    if (!Array.isArray(jsArray)) {
        throw new Error("Decoded hash should be an array.");
    }
    return jsArray;
}
exports.hashToArray = hashToArray;
function hashToObject(hash) {
    const jsObject = JSON.parse(lz_string_1.decompressFromBase64(hash));
    if (!jsObject || jsObject.constructor !== Object) {
        throw new Error("Decoded hash should be an object.");
    }
    return jsObject;
}
exports.hashToObject = hashToObject;
//# sourceMappingURL=hash-conversions.js.map