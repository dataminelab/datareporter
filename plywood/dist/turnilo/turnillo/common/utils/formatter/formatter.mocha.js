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
const chai_1 = require("chai");
const chronoshift_1 = require("chronoshift");
const sinon = __importStar(require("sinon"));
const dimension_fixtures_1 = require("../../models/dimension/dimension.fixtures");
const TimeModule = __importStar(require("../time/time"));
const formatter_1 = require("./formatter");
const formatter_fixtures_1 = require("./formatter.fixtures");
describe("General", () => {
    describe("formatFilterClause", () => {
        const latestDurationTests = [
            { duration: "PT1H", label: "Latest hour" },
            { duration: "PT6H", label: "Latest 6 hours" },
            { duration: "P1D", label: "Latest day" },
            { duration: "P7D", label: "Latest 7 days" },
            { duration: "P30D", label: "Latest 30 days" }
        ];
        latestDurationTests.forEach(({ duration, label }) => {
            it(`formats latest ${duration} as "${label}"`, () => {
                const timeFilterLatest = formatter_fixtures_1.FormatterFixtures.latestDuration(duration);
                chai_1.expect(formatter_1.formatFilterClause(dimension_fixtures_1.DimensionFixtures.time(), timeFilterLatest, chronoshift_1.Timezone.UTC)).to.equal(label);
            });
        });
        const durationTests = [
            { duration: "P1D", previousLabel: "Previous day", currentLabel: "Current day" },
            { duration: "P1W", previousLabel: "Previous week", currentLabel: "Current week" },
            { duration: "P1M", previousLabel: "Previous month", currentLabel: "Current month" },
            { duration: "P3M", previousLabel: "Previous quarter", currentLabel: "Current quarter" },
            { duration: "P1Y", previousLabel: "Previous year", currentLabel: "Current year" }
        ];
        durationTests.forEach(({ duration, previousLabel: label }) => {
            it(`formats previous ${duration} as "${label}"`, () => {
                const timeFilterPrevious = formatter_fixtures_1.FormatterFixtures.previousDuration(duration);
                chai_1.expect(formatter_1.formatFilterClause(dimension_fixtures_1.DimensionFixtures.time(), timeFilterPrevious, chronoshift_1.Timezone.UTC)).to.equal(label);
            });
        });
        durationTests.forEach(({ duration, currentLabel: label }) => {
            it(`formats current ${duration} as "${label}"`, () => {
                const timeFilterCurrent = formatter_fixtures_1.FormatterFixtures.currentDuration(duration);
                chai_1.expect(formatter_1.formatFilterClause(dimension_fixtures_1.DimensionFixtures.time(), timeFilterCurrent, chronoshift_1.Timezone.UTC)).to.equal(label);
            });
        });
        it("should use formatTimeRange for formatting range in FixedTimeFilter", () => {
            const formatTimeRange = sinon.spy(TimeModule, "formatTimeRange");
            const start = new Date("2016-11-11");
            const end = new Date("2016-12-01");
            const filterClause = formatter_fixtures_1.FormatterFixtures.fixedTimeFilter(start, end);
            formatter_1.formatFilterClause(dimension_fixtures_1.DimensionFixtures.time(), filterClause, chronoshift_1.Timezone.UTC);
            chai_1.expect(formatTimeRange.calledWith({ start, end }, chronoshift_1.Timezone.UTC)).to.equal(true);
        });
        it("formats number", () => {
            chai_1.expect(formatter_1.formatFilterClause(dimension_fixtures_1.DimensionFixtures.number(), formatter_fixtures_1.FormatterFixtures.numberFilter(), chronoshift_1.Timezone.UTC)).to.equal("Numeric: 1 to 3");
        });
        it("formats string", () => {
            chai_1.expect(formatter_1.formatFilterClause(dimension_fixtures_1.DimensionFixtures.countryString(), formatter_fixtures_1.FormatterFixtures.stringFilterShort(), chronoshift_1.Timezone.UTC)).to.equal("important countries: iceland");
        });
    });
});
//# sourceMappingURL=formatter.mocha.js.map