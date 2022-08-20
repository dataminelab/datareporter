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
const chai_1 = require("chai");
const chronoshift_1 = require("chronoshift");
const moment_timezone_1 = require("moment-timezone");
const time_1 = require("./time");
describe("Time", () => {
    it("calculates date equality properly", () => {
        chai_1.expect(time_1.datesEqual(null, new Date()), "null and not null").to.equal(false);
        chai_1.expect(time_1.datesEqual(null, null), "null and null").to.equal(true);
        chai_1.expect(time_1.datesEqual(new Date("1995-02-24T00:00:00.000Z"), new Date("1995-02-24T00:00:00.000Z")), "equal dates").to.equal(true);
        chai_1.expect(time_1.datesEqual(new Date("1995-02-24T00:00:00.000Z"), new Date("1995-02-24T00:02:00.000Z")), "not equal dates").to.equal(false);
    });
    const TZ_KATHMANDU = new chronoshift_1.Timezone("Asia/Kathmandu"); // +5.8;
    const TZ_TIJUANA = new chronoshift_1.Timezone("America/Tijuana"); // -8.0
    const TZ_Kiritimati = new chronoshift_1.Timezone("Pacific/Kiritimati"); // +14.0
    it("get walltime day returns day according to walltime", () => {
        const date = new Date("1995-03-09T00:00:00.000Z");
        chai_1.expect(time_1.getDayInMonth(date, TZ_TIJUANA), "tijuana walltime").to.equal(8);
        chai_1.expect(time_1.getDayInMonth(date, TZ_KATHMANDU), "kathmandu walltime").to.equal(9);
        chai_1.expect(time_1.getDayInMonth(date, TZ_Kiritimati), "kiritimati walltime").to.equal(9);
    });
    it("get walltime month returns full month and year according to walltime", () => {
        const date = new Date("1965-02-02T13:00:00.000Z");
        chai_1.expect(time_1.formatYearMonth(date, TZ_TIJUANA), "basic tijuana").to.equal("February 1965");
        chai_1.expect(time_1.formatYearMonth(date, TZ_KATHMANDU), "basic kathmandu").to.equal("February 1965");
        chai_1.expect(time_1.formatYearMonth(date, TZ_Kiritimati), "basic kiritimati").to.equal("February 1965");
    });
    it("get walltime month returns full month and year according to walltime on year boundaries", () => {
        const date = new Date("1999-12-31T20:15:00.000Z");
        chai_1.expect(time_1.formatYearMonth(date, TZ_TIJUANA), "y2k tijuana").to.equal("December 1999");
        chai_1.expect(time_1.formatYearMonth(date, TZ_KATHMANDU), "y2k kathmandu").to.equal("January 2000");
        chai_1.expect(time_1.formatYearMonth(date, TZ_Kiritimati), "y2k kiritimati").to.equal("January 2000");
    });
    describe("scaleTicksFormatter", () => {
        const createScale = (...dates) => {
            return {
                ticks: () => dates
            };
        };
        it("should hide year when just year is the same in all ticks", () => {
            const scale = createScale(moment_timezone_1.tz("2019-01-02 12:34", "UTC").toDate(), moment_timezone_1.tz("2019-02-01 10:00", "UTC").toDate());
            const formatter = time_1.scaleTicksFormat(scale);
            chai_1.expect(formatter).to.be.eq("D MMM H:mm");
        });
        it("should hide hour when just hour is the same in all ticks", () => {
            const scale = createScale(moment_timezone_1.tz("2018-12-01 18:00", "UTC").toDate(), moment_timezone_1.tz("2019-01-10 18:00", "UTC").toDate());
            const formatter = time_1.scaleTicksFormat(scale);
            chai_1.expect(formatter).to.be.eq("D MMM YY");
        });
        it("should show full date when just date is the same in all ticks (degenerate case)", () => {
            const scale = createScale(moment_timezone_1.tz("2018-01-01", "UTC").toDate(), moment_timezone_1.tz("2019-01-01 10:00", "UTC").toDate());
            const formatter = time_1.scaleTicksFormat(scale);
            chai_1.expect(formatter).to.be.eq("D MMM YY H:mm");
        });
        it("should show just hour when only hour is different in some ticks", () => {
            const scale = createScale(moment_timezone_1.tz("2019-01-01 12:34", "UTC").toDate(), moment_timezone_1.tz("2019-01-01 15:00", "UTC").toDate());
            const formatter = time_1.scaleTicksFormat(scale);
            chai_1.expect(formatter).to.be.eq("H:mm");
        });
        it("should show just date when only date is different in some ticks", () => {
            const scale = createScale(moment_timezone_1.tz("2019-01-01 10:00", "UTC").toDate(), moment_timezone_1.tz("2019-01-10 10:00", "UTC").toDate());
            const formatter = time_1.scaleTicksFormat(scale);
            chai_1.expect(formatter).to.be.eq("D MMM");
        });
        it("should show year when just year is different in some ticks", () => {
            const scale = createScale(new Date("2018-01-01"), new Date("2019-01-01"));
            const formatter = time_1.scaleTicksFormat(scale);
            chai_1.expect(formatter).to.be.eq("YYYY");
        });
        it("should show full date and hour when everything is the same in all ticks (degenerate case)", () => {
            const scale = createScale(new Date("2019-01-01"), new Date("2019-01-01"));
            const formatter = time_1.scaleTicksFormat(scale);
            chai_1.expect(formatter).to.be.eq("D MMM YY H:mm");
        });
        it("should show full date and hour when everything is different in some ticks", () => {
            const scale = createScale(new Date("2018-12-31T23:00"), new Date("2019-01-01:T01:00"));
            const formatter = time_1.scaleTicksFormat(scale);
            chai_1.expect(formatter).to.be.eq("D MMM YY H:mm");
        });
        it("should show full format when not enough ticks", () => {
            const scale = createScale(new Date("2019-01-01T:00:01"));
            const formatter = time_1.scaleTicksFormat(scale);
            chai_1.expect(formatter).to.be.eq("D MMM YY H:mm");
        });
    });
    describe("formatDatesInTimeRange", () => {
        function coerceToYear(date, year) {
            date.setFullYear(year);
            return date;
        }
        function coerceToCurrentYear(date) {
            const currentYear = new Date().getFullYear();
            return coerceToYear(date, currentYear);
        }
        describe("should display year correctly", () => {
            it("should use long format for different years", () => {
                const range = {
                    start: new Date("1997-02-21T11:00Z"),
                    end: new Date("1999-05-30T16:21Z")
                };
                chai_1.expect(time_1.formatDatesInTimeRange(range, chronoshift_1.Timezone.UTC)).to.be.deep.eq(["21 Feb 1997 11:00", "30 May 1999 16:21"]);
            });
            it("should use long format for same year but not current", () => {
                const range = {
                    start: new Date("1997-02-21T11:00Z"),
                    end: new Date("1997-05-30T16:21Z")
                };
                chai_1.expect(time_1.formatDatesInTimeRange(range, chronoshift_1.Timezone.UTC)).to.be.deep.eq(["21 Feb 1997 11:00", "30 May 1997 16:21"]);
            });
            it("should use long format when just one date in current year", () => {
                const range = {
                    start: new Date("1997-02-21T11:00Z"),
                    end: coerceToCurrentYear(new Date("2019-05-30T16:21Z"))
                };
                const currentYear = new Date().getFullYear();
                chai_1.expect(time_1.formatDatesInTimeRange(range, chronoshift_1.Timezone.UTC)).to.be.deep.eq(["21 Feb 1997 11:00", `30 May ${currentYear} 16:21`]);
            });
            it("should omit year for both current years", () => {
                const start = coerceToCurrentYear(new Date("2019-02-21T11:00Z"));
                const end = coerceToCurrentYear(new Date("2019-05-30T16:21Z"));
                const range = { start, end };
                chai_1.expect(time_1.formatDatesInTimeRange(range, chronoshift_1.Timezone.UTC)).to.be.deep.eq(["21 Feb 11:00", "30 May 16:21"]);
            });
        });
        describe("should handle full day ranges", () => {
            it("should show one date with year when not current year", () => {
                const range = {
                    start: new Date("1999-02-21Z"),
                    end: new Date("1999-02-22Z")
                };
                chai_1.expect(time_1.formatDatesInTimeRange(range, chronoshift_1.Timezone.UTC)).to.be.deep.eq(["21 Feb 1999"]);
            });
            it("should show one short date for current year", () => {
                const range = {
                    start: coerceToCurrentYear(new Date("2019-02-21Z")),
                    end: coerceToCurrentYear(new Date("2019-02-22Z"))
                };
                chai_1.expect(time_1.formatDatesInTimeRange(range, chronoshift_1.Timezone.UTC)).to.be.deep.eq(["21 Feb"]);
            });
        });
        describe("should omit hour and subtract day if range is multiple days", () => {
            it("should show just dates with year when not current year", () => {
                const range = {
                    start: new Date("1997-02-21Z"),
                    end: new Date("1999-05-30Z")
                };
                chai_1.expect(time_1.formatDatesInTimeRange(range, chronoshift_1.Timezone.UTC)).to.be.deep.eq(["21 Feb 1997", "29 May 1999"]);
            });
            it("should show just days and months without year when current year", () => {
                const range = {
                    start: coerceToCurrentYear(new Date("2019-02-21Z")),
                    end: coerceToCurrentYear(new Date("2019-05-30Z"))
                };
                chai_1.expect(time_1.formatDatesInTimeRange(range, chronoshift_1.Timezone.UTC)).to.be.deep.eq(["21 Feb", "29 May"]);
            });
            it("should show just days and months without year for whole current year", () => {
                const currentYear = new Date().getFullYear();
                const nextYear = currentYear + 1;
                const range = {
                    start: new Date(Date.UTC(currentYear, 0, 1, 0, 0, 0)),
                    end: new Date(Date.UTC(nextYear, 0, 1, 0, 0, 0))
                };
                chai_1.expect(time_1.formatDatesInTimeRange(range, chronoshift_1.Timezone.UTC)).to.be.deep.eq(["1 Jan", "31 Dec"]);
            });
        });
    });
});
//# sourceMappingURL=time.mocha.js.map