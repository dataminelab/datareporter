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
exports.VisualizationManifest = exports.Resolve = exports.LOWEST_PRIORITY_ACTION = exports.NORMAL_PRIORITY_ACTION = exports.HIGH_PRIORITY_ACTION = void 0;
exports.HIGH_PRIORITY_ACTION = 4;
exports.NORMAL_PRIORITY_ACTION = 3;
exports.LOWEST_PRIORITY_ACTION = 0;
class Resolve {
    constructor(score, state, adjustment, message, resolutions) {
        this.score = Math.max(1, Math.min(10, score));
        this.state = state;
        this.adjustment = adjustment;
        this.message = message;
        this.resolutions = resolutions;
    }
    // static READY: Resolve;
    static compare(r1, r2) {
        return r2.score - r1.score;
    }
    static automatic(score, adjustment) {
        return new Resolve(score, "automatic", adjustment, null, null);
    }
    static manual(score, message, resolutions) {
        return new Resolve(score, "manual", null, message, resolutions);
    }
    static ready(score) {
        return new Resolve(score, "ready", null, null, null);
    }
    toString() {
        return this.state;
    }
    valueOf() {
        return this.state;
    }
    isReady() {
        return this.state === "ready";
    }
    isAutomatic() {
        return this.state === "automatic";
    }
    isManual() {
        return this.state === "manual";
    }
}
exports.Resolve = Resolve;
Resolve.NEVER = new Resolve(-1, "never", null, null, null);
class VisualizationManifest {
    constructor(name, title, evaluateRules, visualizationSettings) {
        this.name = name;
        this.title = title;
        this.evaluateRules = evaluateRules;
        this.visualizationSettings = visualizationSettings;
    }
}
exports.VisualizationManifest = VisualizationManifest;
//# sourceMappingURL=visualization-manifest.js.map