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
exports.ExternalView = void 0;
var check;
class ExternalView {
    constructor(parameters) {
        const { title, linkGenerator } = parameters;
        if (!title)
            throw new Error("External view must have title");
        if (typeof linkGenerator !== "string")
            throw new Error("Must provide link generator function");
        this.title = title;
        this.linkGenerator = linkGenerator;
        var linkGeneratorFnRaw = null;
        try {
            // dataSource is for back compat.
            linkGeneratorFnRaw = new Function("dataCube", "dataSource", "timezone", "filter", "splits", linkGenerator);
        }
        catch (e) {
            throw new Error(`Error constructing link generator function: ${e.message}`);
        }
        this.linkGeneratorFn = (dataCube, timezone, filter, splits) => {
            try {
                return linkGeneratorFnRaw(dataCube, dataCube, timezone, filter, splits);
            }
            catch (e) {
                console.warn(`Error with custom link generating function '${title}': ${e.message} [${linkGenerator}]`);
                return null;
            }
        };
        this.sameWindow = Boolean(parameters.sameWindow);
    }
    static isExternalView(candidate) {
        return candidate instanceof ExternalView;
    }
    static fromJS(parameters) {
        var value = parameters;
        return new ExternalView({
            title: value.title,
            linkGenerator: value.linkGenerator,
            linkGeneratorFn: value.linkGeneratorFn,
            sameWindow: value.sameWindow
        });
    }
    toJS() {
        var js = {
            title: this.title,
            linkGenerator: this.linkGenerator
        };
        if (this.sameWindow === true)
            js.sameWindow = true;
        return js;
    }
    valueOf() {
        var value = {
            title: this.title,
            linkGenerator: this.linkGenerator
        };
        if (this.sameWindow === true)
            value.sameWindow = true;
        return value;
    }
    toJSON() {
        return this.toJS();
    }
    equals(other) {
        return ExternalView.isExternalView(other) &&
            this.title === other.title &&
            this.linkGenerator === other.linkGenerator &&
            this.sameWindow === other.sameWindow;
    }
    toString() {
        return `${this.title}: ${this.linkGenerator}`;
    }
}
exports.ExternalView = ExternalView;
check = ExternalView;
//# sourceMappingURL=external-view.js.map