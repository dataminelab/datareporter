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
exports.isFloorableDuration = exports.isValidDuration = void 0;
const chronoshift_1 = require("chronoshift");
function isValidDuration(input) {
    try {
        chronoshift_1.Duration.fromJS(input);
        return true;
    }
    catch (_a) {
        return false;
    }
}
exports.isValidDuration = isValidDuration;
function isFloorableDuration(input) {
    try {
        return chronoshift_1.Duration.fromJS(input).isFloorable();
    }
    catch (_a) {
        return false;
    }
}
exports.isFloorableDuration = isFloorableDuration;
//# sourceMappingURL=duration.js.map