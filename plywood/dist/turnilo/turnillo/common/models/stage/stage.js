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
exports.Stage = void 0;
var check;
class Stage {
    constructor(parameters) {
        this.x = parameters.x;
        this.y = parameters.y;
        this.width = parameters.width;
        this.height = parameters.height;
    }
    static isStage(candidate) {
        return candidate instanceof Stage;
    }
    static fromJS(parameters) {
        return new Stage({
            x: parameters.x,
            y: parameters.y,
            width: parameters.width,
            height: parameters.height
        });
    }
    static fromClientRect(rect) {
        return new Stage({
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height
        });
    }
    static fromSize(width, height) {
        return new Stage({
            x: 0,
            y: 0,
            width,
            height
        });
    }
    valueOf() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    toJS() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    toJSON() {
        return this.toJS();
    }
    sizeOnlyValue() {
        return {
            x: 0,
            y: 0,
            width: this.width,
            height: this.height
        };
    }
    toString() {
        return `[stage: ${this.width}x${this.height}}]`;
    }
    equals(other) {
        return Stage.isStage(other) &&
            this.x === other.x &&
            this.y === other.y &&
            this.width === other.width &&
            this.height === other.height;
    }
    getTransform() {
        return `translate(${this.x},${this.y})`;
    }
    getViewBox(widthOffset = 0, heightOffset = 0) {
        return `0 0 ${this.width + widthOffset} ${this.height + this.y + heightOffset}`;
    }
    getLeftTop() {
        return {
            left: this.x,
            top: this.y
        };
    }
    getWidthHeight(widthOffset = 0, heightOffset = 0) {
        return {
            width: this.width + widthOffset,
            height: this.height + this.y + heightOffset
        };
    }
    getLeftTopWidthHeight() {
        return {
            left: this.x,
            top: this.y,
            width: this.width,
            height: this.height
        };
    }
    changeY(y) {
        var value = this.valueOf();
        value.y = y;
        return Stage.fromJS(value);
    }
    changeHeight(height) {
        var value = this.valueOf();
        value.height = height;
        return Stage.fromJS(value);
    }
    within(param) {
        var value = this.sizeOnlyValue();
        var { left, right, top, bottom } = param;
        if (left) {
            value.x = left;
            value.width -= left;
        }
        if (right) {
            value.width -= right;
        }
        if (top) {
            value.y = top;
            value.height -= top;
        }
        if (bottom) {
            value.height -= bottom;
        }
        return new Stage(value);
    }
}
exports.Stage = Stage;
check = Stage;
//# sourceMappingURL=stage.js.map