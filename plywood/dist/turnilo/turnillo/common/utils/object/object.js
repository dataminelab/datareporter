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
exports.omitFalsyValues = exports.extend = void 0;
const general_1 = require("../general/general");
function extend(source, target) {
    for (let key in source) {
        target[key] = source[key];
    }
    return target;
}
exports.extend = extend;
function omitFalsyValues(obj) {
    return Object.keys(obj).reduce((res, key) => {
        if (general_1.isTruthy(obj[key])) {
            res[key] = obj[key];
        }
        return res;
    }, {});
}
exports.omitFalsyValues = omitFalsyValues;
//# sourceMappingURL=object.js.map