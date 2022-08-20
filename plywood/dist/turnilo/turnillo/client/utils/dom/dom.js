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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.classNames = exports.clamp = exports.roundToHalfPx = exports.roundToPx = exports.getYFromEvent = exports.getXFromEvent = exports.transformStyle = exports.uniqueId = exports.rightKey = exports.leftKey = exports.escapeKey = exports.enterKey = exports.setDragData = exports.setDragGhost = exports.findParentWithClass = exports.isInside = void 0;
const d3 = __importStar(require("d3"));
const general_1 = require("../../../common/utils/general/general");
const DRAG_GHOST_OFFSET_X = -12;
const DRAG_GHOST_OFFSET_Y = -12;
const KEY_CODES = {
    ENTER: 13,
    ESCAPE: 27,
    LEFT: 37,
    RIGHT: 39
};
function convertDOMStringListToArray(list) {
    var length = list.length;
    var array = [];
    for (var i = 0; i < length; i++) {
        array.push(list.item(i));
    }
    return array;
}
function isInside(child, parent) {
    var altParent;
    while (child) {
        if (child === parent)
            return true;
        var dataset = child.dataset;
        if (dataset && dataset["parent"] && (altParent = document.getElementById(dataset["parent"]))) {
            child = altParent;
        }
        else {
            child = child.parentElement;
        }
    }
    return false;
}
exports.isInside = isInside;
function findParentWithClass(child, className) {
    while (child) {
        if (child.classList.contains(className))
            return child;
        child = child.parentNode;
    }
    return null;
}
exports.findParentWithClass = findParentWithClass;
function setDragGhost(dataTransfer, text) {
    // Not all browsers support setDragImage. Guess which ones do not ;-)
    if (dataTransfer.setDragImage === undefined) {
        return;
    }
    // Thanks to http://www.kryogenix.org/code/browser/custom-drag-image.html
    var dragGhost = d3.select(document.body).append("div")
        .attr("class", "drag-ghost")
        .text(text);
    dataTransfer.setDragImage(dragGhost.node(), DRAG_GHOST_OFFSET_X, DRAG_GHOST_OFFSET_Y);
    // Remove the host after a ms because it is no longer needed
    setTimeout(() => {
        dragGhost.remove();
    }, 1);
}
exports.setDragGhost = setDragGhost;
const setDragData = (dataTransfer, format, data) => {
    try {
        dataTransfer.setData(format, data);
    }
    catch (e) {
        dataTransfer.setData("text", data);
    }
};
exports.setDragData = setDragData;
function enterKey(e) {
    return e.which === KEY_CODES.ENTER;
}
exports.enterKey = enterKey;
function escapeKey(e) {
    return e.which === KEY_CODES.ESCAPE;
}
exports.escapeKey = escapeKey;
function leftKey(e) {
    return e.which === KEY_CODES.LEFT;
}
exports.leftKey = leftKey;
function rightKey(e) {
    return e.which === KEY_CODES.RIGHT;
}
exports.rightKey = rightKey;
var lastID = 0;
function uniqueId(prefix) {
    lastID++;
    return prefix + lastID;
}
exports.uniqueId = uniqueId;
function transformStyle(x, y) {
    var xStr = String(x);
    var yStr = String(y);
    if (xStr !== "0")
        xStr += "px";
    if (yStr !== "0")
        yStr += "px";
    var transform = `translate(${xStr},${yStr})`;
    return {
        transform,
        WebkitTransform: transform,
        MsTransform: transform
    };
}
exports.transformStyle = transformStyle;
function getXFromEvent(e) {
    return e.clientX || e.pageX;
}
exports.getXFromEvent = getXFromEvent;
function getYFromEvent(e) {
    return e.clientY || e.pageY;
}
exports.getYFromEvent = getYFromEvent;
function roundToPx(n) {
    return Math.round(n);
}
exports.roundToPx = roundToPx;
function roundToHalfPx(n) {
    return Math.round(n - 0.5) + 0.5;
}
exports.roundToHalfPx = roundToHalfPx;
function clamp(n, min, max) {
    return Math.min(Math.max(n, min), max);
}
exports.clamp = clamp;
function classNames(...args) {
    var classes = [];
    for (var arg of args) {
        if (!arg)
            continue;
        var argType = typeof arg;
        if (argType === "string") {
            classes.push(arg);
        }
        else if (argType === "object") {
            for (var key in arg) {
                if (general_1.hasOwnProperty(arg, key) && arg[key])
                    classes.push(key);
            }
        }
    }
    return classes.join(" ");
}
exports.classNames = classNames;
//# sourceMappingURL=dom.js.map