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
exports.combineDateAndTimeIntoMoment = exports.validateISOTime = exports.normalizeISOTime = exports.validateISODate = exports.normalizeISODate = exports.formatISOTime = exports.formatISODate = exports.formatDateTime = exports.formatTimeElapsed = exports.formatYearMonth = exports.getDayInMonth = exports.datesEqual = exports.formatTimeRange = exports.formatStartOfTimeRange = exports.formatDatesInTimeRange = exports.scaleTicksFormatter = exports.scaleTicksFormat = exports.getMoment = void 0;
const moment_timezone_1 = require("moment-timezone");
const ISO_FORMAT_DATE = "YYYY-MM-DD";
const ISO_FORMAT_TIME = "HH:mm";
const FORMAT_FULL_MONTH_WITH_YEAR = "MMMM YYYY";
function getMoment(date, timezone) {
    return moment_timezone_1.tz(date, timezone.toString());
}
exports.getMoment = getMoment;
const FULL_FORMAT = "D MMM YYYY H:mm";
const WITHOUT_YEAR_FORMAT = "D MMM H:mm";
const WITHOUT_HOUR_FORMAT = "D MMM YYYY";
const WITHOUT_YEAR_AND_HOUR_FORMAT = "D MMM";
const SHORT_WITHOUT_HOUR_FORMAT = "D MMM YY";
const SHORT_FULL_FORMAT = "D MMM YY H:mm";
const SHORT_WITHOUT_YEAR_FORMAT = "D MMM H:mm";
const SHORT_WITHOUT_YEAR_AND_HOUR_FORMAT = "D MMM";
const SHORT_WITHOUT_YEAR_AND_DATE_FORMAT = "H:mm";
const SHORT_WITHOUT_DATE_AND_HOUR_FORMAT = "YYYY";
function formatterFromDefinition(definition) {
    return (date) => date.format(definition);
}
function getShortFormat(sameYear, sameDate, sameHour) {
    if (sameYear && sameDate && !sameHour)
        return SHORT_WITHOUT_YEAR_AND_DATE_FORMAT;
    if (!sameYear && sameDate && sameHour)
        return SHORT_WITHOUT_DATE_AND_HOUR_FORMAT;
    if (sameYear && !sameDate && sameHour)
        return SHORT_WITHOUT_YEAR_AND_HOUR_FORMAT;
    if (sameYear && !sameDate && !sameHour)
        return SHORT_WITHOUT_YEAR_FORMAT;
    if (!sameYear && sameHour)
        return SHORT_WITHOUT_HOUR_FORMAT;
    return SHORT_FULL_FORMAT;
}
function hasSameHour(a, b) {
    return a.getHours() === b.getHours() && a.getMinutes() === b.getMinutes();
}
function hasSameDateAndMonth(a, b) {
    return a.getDate() === b.getDate() && a.getMonth() === b.getMonth();
}
function scaleTicksFormat(scale) {
    const ticks = scale.ticks();
    if (ticks.length < 2)
        return SHORT_FULL_FORMAT;
    const [first, ...rest] = ticks;
    const sameYear = rest.every(date => date.getFullYear() === first.getFullYear());
    const sameDayAndMonth = rest.every(date => hasSameDateAndMonth(date, first));
    const sameHour = rest.every(date => hasSameHour(date, first));
    return getShortFormat(sameYear, sameDayAndMonth, sameHour);
}
exports.scaleTicksFormat = scaleTicksFormat;
function scaleTicksFormatter(scale) {
    return formatterFromDefinition(scaleTicksFormat(scale));
}
exports.scaleTicksFormatter = scaleTicksFormatter;
function getLongFormat(omitYear, omitHour) {
    if (omitHour && omitYear)
        return WITHOUT_YEAR_AND_HOUR_FORMAT;
    if (omitYear)
        return WITHOUT_YEAR_FORMAT;
    if (omitHour)
        return WITHOUT_HOUR_FORMAT;
    return FULL_FORMAT;
}
function isCurrentYear(moment, timezone) {
    const nowWallTime = getMoment(new Date(), timezone);
    return nowWallTime.year() === moment.year();
}
function isStartOfTheDay(date) {
    return date.milliseconds() === 0
        && date.seconds() === 0
        && date.minutes() === 0
        && date.hours() === 0;
}
function isOneWholeDay(a, b) {
    return isStartOfTheDay(a) && isStartOfTheDay(b) && b.diff(a, "days") === 1;
}
function formatOneWholeDay(day, timezone) {
    const omitYear = isCurrentYear(day, timezone);
    return day.format(getLongFormat(omitYear, true));
}
function formatDaysRange(start, end, timezone) {
    const dayBeforeEnd = end.subtract(1, "day");
    const omitYear = isCurrentYear(start, timezone) && isCurrentYear(dayBeforeEnd, timezone);
    const format = getLongFormat(omitYear, true);
    return [start.format(format), dayBeforeEnd.format(format)];
}
function formatHoursRange(start, end, timezone) {
    const omitYear = isCurrentYear(start, timezone) && isCurrentYear(end, timezone);
    const format = getLongFormat(omitYear, false);
    return [start.format(format), end.format(format)];
}
function formatDatesInTimeRange({ start, end }, timezone) {
    const startMoment = getMoment(start, timezone);
    const endMoment = getMoment(end, timezone);
    if (isOneWholeDay(startMoment, endMoment)) {
        return [formatOneWholeDay(startMoment, timezone)];
    }
    const hasDayBoundaries = isStartOfTheDay(startMoment) && isStartOfTheDay(endMoment);
    if (hasDayBoundaries) {
        return formatDaysRange(startMoment, endMoment, timezone);
    }
    return formatHoursRange(startMoment, endMoment, timezone);
}
exports.formatDatesInTimeRange = formatDatesInTimeRange;
function formatStartOfTimeRange(range, timezone) {
    return formatDatesInTimeRange(range, timezone)[0];
}
exports.formatStartOfTimeRange = formatStartOfTimeRange;
function formatTimeRange(range, timezone) {
    return formatDatesInTimeRange(range, timezone).join(" - ");
}
exports.formatTimeRange = formatTimeRange;
function datesEqual(d1, d2) {
    if (!Boolean(d1) === Boolean(d2))
        return false;
    if (d1 === d2)
        return true;
    return d1.valueOf() === d2.valueOf();
}
exports.datesEqual = datesEqual;
function getDayInMonth(date, timezone) {
    return getMoment(date, timezone).date();
}
exports.getDayInMonth = getDayInMonth;
function formatYearMonth(date, timezone) {
    return getMoment(date, timezone).format(FORMAT_FULL_MONTH_WITH_YEAR);
}
exports.formatYearMonth = formatYearMonth;
function formatTimeElapsed(date, timezone) {
    return getMoment(date, timezone).fromNow(true);
}
exports.formatTimeElapsed = formatTimeElapsed;
function formatDateTime(date, timezone) {
    return getMoment(date, timezone).format(FULL_FORMAT);
}
exports.formatDateTime = formatDateTime;
function formatISODate(date, timezone) {
    return getMoment(date, timezone).format(ISO_FORMAT_DATE);
}
exports.formatISODate = formatISODate;
function formatISOTime(date, timezone) {
    return getMoment(date, timezone).format(ISO_FORMAT_TIME);
}
exports.formatISOTime = formatISOTime;
const ISO_DATE_DISALLOWED = /[^\d-]/g;
function normalizeISODate(date) {
    return date.replace(ISO_DATE_DISALLOWED, "");
}
exports.normalizeISODate = normalizeISODate;
const ISO_DATE_TEST = /^\d\d\d\d-\d\d-\d\d$/;
function validateISODate(date) {
    return ISO_DATE_TEST.test(date);
}
exports.validateISODate = validateISODate;
const ISO_TIME_DISALLOWED = /[^\d:]/g;
function normalizeISOTime(time) {
    return time.replace(ISO_TIME_DISALLOWED, "");
}
exports.normalizeISOTime = normalizeISOTime;
const ISO_TIME_TEST = /^\d\d:\d\d$/;
function validateISOTime(time) {
    return ISO_TIME_TEST.test(time);
}
exports.validateISOTime = validateISOTime;
function combineDateAndTimeIntoMoment(date, time, timezone) {
    return moment_timezone_1.tz(`${date}T${time}`, timezone.toString());
}
exports.combineDateAndTimeIntoMoment = combineDateAndTimeIntoMoment;
//# sourceMappingURL=time.js.map