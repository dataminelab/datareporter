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
exports.dimensions = exports.timeDimension = void 0;
const dimension_1 = require("../../models/dimension/dimension");
exports.timeDimension = dimension("time", "time");
exports.dimensions = [
    exports.timeDimension,
    dimension("numeric", "number"),
    dimension("string_a", "string"),
    dimension("string_b", "string"),
    dimension("boolean", "boolean")
];
function dimension(name, kind, opts = {}) {
    return new dimension_1.Dimension(Object.assign({ name,
        kind }, opts));
}
//# sourceMappingURL=dimension.js.map