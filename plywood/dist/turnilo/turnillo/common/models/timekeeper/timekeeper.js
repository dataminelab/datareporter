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
exports.Timekeeper = void 0;
const immutable_class_1 = require("immutable-class");
const time_tag_1 = require("../time-tag/time-tag");
class Timekeeper extends immutable_class_1.BaseImmutable {
    constructor(parameters) {
        super(parameters);
    }
    static isTimekeeper(candidate) {
        return candidate instanceof Timekeeper;
    }
    static globalNow() {
        return new Date();
    }
    static fromJS(parameters) {
        return new Timekeeper(immutable_class_1.BaseImmutable.jsToValue(Timekeeper.PROPERTIES, parameters));
    }
    now() {
        return this.nowOverride || Timekeeper.globalNow();
    }
    getTime(name) {
        var timeTag = immutable_class_1.NamedArray.findByName(this.timeTags, name);
        if (!timeTag || timeTag.special === "realtime")
            return this.now();
        return timeTag.time || this.now();
    }
    updateTime(name, time) {
        var value = this.valueOf();
        var tag = immutable_class_1.NamedArray.findByName(value.timeTags, name);
        if (!tag)
            return this;
        value.timeTags = immutable_class_1.NamedArray.overrideByName(value.timeTags, tag.changeTime(time, this.now()));
        return new Timekeeper(value);
    }
    addTimeTagFor(name) {
        var value = this.valueOf();
        value.timeTags = value.timeTags.concat(new time_tag_1.TimeTag({ name }));
        return new Timekeeper(value);
    }
    removeTimeTagFor(name) {
        var value = this.valueOf();
        value.timeTags = value.timeTags.filter(tag => tag.name !== name);
        return new Timekeeper(value);
    }
}
exports.Timekeeper = Timekeeper;
Timekeeper.PROPERTIES = [
    { name: "timeTags", type: immutable_class_1.PropertyType.ARRAY, immutableClassArray: time_tag_1.TimeTag },
    { name: "nowOverride", type: immutable_class_1.PropertyType.DATE, defaultValue: null }
];
immutable_class_1.BaseImmutable.finalize(Timekeeper);
Timekeeper.EMPTY = new Timekeeper({ timeTags: [] });
//# sourceMappingURL=timekeeper.js.map