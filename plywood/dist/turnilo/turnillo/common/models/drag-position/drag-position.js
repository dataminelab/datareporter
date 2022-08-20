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
exports.DragPosition = void 0;
const general_1 = require("../../utils/general/general");
var check;
class DragPosition {
    constructor(parameters) {
        this.insert = general_1.hasOwnProperty(parameters, "insert") ? parameters.insert : null;
        this.replace = general_1.hasOwnProperty(parameters, "replace") ? parameters.replace : null;
        if (this.insert == null && this.replace == null)
            throw new Error("invalid drag position");
    }
    static isDragPosition(candidate) {
        return candidate instanceof DragPosition;
    }
    static calculateFromOffset(offset, numItems, itemWidth, itemGap) {
        if (!numItems) {
            return new DragPosition({
                replace: 0
            });
        }
        if (offset < 0) {
            return new DragPosition({
                insert: 0
            });
        }
        var sectionWidth = itemWidth + itemGap;
        var sectionNumber = Math.floor(offset / sectionWidth);
        if (numItems <= sectionNumber) {
            return new DragPosition({
                replace: numItems
            });
        }
        var offsetWithinSection = offset - sectionWidth * sectionNumber;
        if (offsetWithinSection < itemWidth) {
            return new DragPosition({
                replace: sectionNumber
            });
        }
        else {
            return new DragPosition({
                insert: sectionNumber + 1
            });
        }
    }
    static fromJS(parameters) {
        return new DragPosition(parameters);
    }
    valueOf() {
        return {
            insert: this.insert,
            replace: this.replace
        };
    }
    toJS() {
        var js = {};
        if (this.insert != null)
            js.insert = this.insert;
        if (this.replace != null)
            js.replace = this.replace;
        return js;
    }
    toJSON() {
        return this.toJS();
    }
    toString() {
        if (this.insert != null) {
            return `[insert ${this.insert}]`;
        }
        else {
            return `[replace ${this.replace}]`;
        }
    }
    equals(other) {
        return DragPosition.isDragPosition(other) &&
            this.insert === other.insert &&
            this.replace === other.replace;
    }
    isInsert() {
        return this.insert !== null;
    }
    isReplace() {
        return this.replace !== null;
    }
}
exports.DragPosition = DragPosition;
check = DragPosition;
//# sourceMappingURL=drag-position.js.map