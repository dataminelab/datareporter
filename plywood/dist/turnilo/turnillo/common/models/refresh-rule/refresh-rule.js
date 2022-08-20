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
exports.RefreshRule = void 0;
var check;
class RefreshRule {
    constructor(parameters) {
        var rule = parameters.rule;
        if (rule !== RefreshRule.FIXED && rule !== RefreshRule.QUERY && rule !== RefreshRule.REALTIME) {
            throw new Error(`rule must be on of: ${RefreshRule.FIXED}, ${RefreshRule.QUERY}, or ${RefreshRule.REALTIME}`);
        }
        this.rule = rule;
        this.time = parameters.time;
    }
    static isRefreshRule(candidate) {
        return candidate instanceof RefreshRule;
    }
    static query() {
        return new RefreshRule({
            rule: RefreshRule.QUERY
        });
    }
    static fromJS(parameters) {
        var value = {
            rule: parameters.rule
        };
        if (parameters.time) {
            value.time = new Date(parameters.time);
        }
        return new RefreshRule(value);
    }
    valueOf() {
        var value = {
            rule: this.rule
        };
        if (this.time) {
            value.time = this.time;
        }
        return value;
    }
    toJS() {
        var js = {
            rule: this.rule
        };
        if (this.time) {
            js.time = this.time;
        }
        return js;
    }
    toJSON() {
        return this.toJS();
    }
    toString() {
        return `[RefreshRule: ${this.rule}]`;
    }
    equals(other) {
        return RefreshRule.isRefreshRule(other) &&
            this.rule === other.rule &&
            (!this.time || this.time.valueOf() === other.time.valueOf());
    }
    isFixed() {
        return this.rule === RefreshRule.FIXED;
    }
    isQuery() {
        return this.rule === RefreshRule.QUERY;
    }
    isRealtime() {
        return this.rule === RefreshRule.REALTIME;
    }
}
exports.RefreshRule = RefreshRule;
RefreshRule.FIXED = "fixed";
RefreshRule.QUERY = "query";
RefreshRule.REALTIME = "realtime";
check = RefreshRule;
//# sourceMappingURL=refresh-rule.js.map