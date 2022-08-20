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
exports.generateUniqueName = exports.pad = exports.firstUp = exports.NUM_REGEX = exports.IP_REGEX = void 0;
// Shamelessly stolen from http://stackoverflow.com/a/10006499
// (well, traded for an upvote)
exports.IP_REGEX = /^(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))$/;
exports.NUM_REGEX = /^\d+$/;
function firstUp(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : undefined;
}
exports.firstUp = firstUp;
function pad(n, padding = 3) {
    var str = String(n);
    if (str.length > padding)
        return str;
    while (str.length < padding)
        str = "0" + str;
    return str;
}
exports.pad = pad;
function generateUniqueName(prefix, isUnique) {
    var i = 0;
    var name = prefix + pad(i);
    while (!isUnique(name)) {
        name = prefix + pad(++i);
    }
    return name;
}
exports.generateUniqueName = generateUniqueName;
//# sourceMappingURL=string.js.map