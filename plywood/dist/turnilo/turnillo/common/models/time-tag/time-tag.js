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
exports.TimeTag = void 0;
const immutable_class_1 = require("immutable-class");
class TimeTag extends immutable_class_1.BaseImmutable {
    constructor(parameters) {
        super(parameters);
        if (this.time && !this.updated)
            this.updated = this.time;
    }
    static isTimeTag(candidate) {
        return candidate instanceof TimeTag;
    }
    static fromJS(parameters) {
        return new TimeTag(immutable_class_1.BaseImmutable.jsToValue(TimeTag.PROPERTIES, parameters));
    }
    changeTime(time, now) {
        var value = this.valueOf();
        value.time = time;
        value.updated = now;
        return new TimeTag(value);
    }
}
exports.TimeTag = TimeTag;
TimeTag.PROPERTIES = [
    { name: "name" },
    { name: "time", type: immutable_class_1.PropertyType.DATE, defaultValue: null },
    { name: "updated", type: immutable_class_1.PropertyType.DATE, defaultValue: null },
    { name: "spacial", defaultValue: null }
];
immutable_class_1.BaseImmutable.finalize(TimeTag);
//# sourceMappingURL=time-tag.js.map