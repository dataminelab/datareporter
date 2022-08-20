"use strict";
/*
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seriesFormatter = exports.defaultFormatter = exports.measureDefaultFormat = exports.percentFormat = exports.exactFormat = exports.formatFnFactory = exports.customFormat = exports.PERCENT_FORMAT = exports.EXACT_FORMAT = exports.DEFAULT_FORMAT = exports.SeriesFormat = exports.SeriesFormatType = void 0;
const immutable_1 = require("immutable");
const numbro_1 = __importDefault(require("numbro"));
const general_1 = require("../../utils/general/general");
var SeriesFormatType;
(function (SeriesFormatType) {
    SeriesFormatType["DEFAULT"] = "default";
    SeriesFormatType["EXACT"] = "exact";
    SeriesFormatType["PERCENT"] = "percent";
    SeriesFormatType["CUSTOM"] = "custom";
})(SeriesFormatType = exports.SeriesFormatType || (exports.SeriesFormatType = {}));
const defaultFormat = { type: SeriesFormatType.DEFAULT, value: "" };
//@ts-ignore
class SeriesFormat extends immutable_1.Record(defaultFormat) {
    static fromJS(params) {
        return new SeriesFormat(params);
    }
}
exports.SeriesFormat = SeriesFormat;
exports.DEFAULT_FORMAT = new SeriesFormat(defaultFormat);
exports.EXACT_FORMAT = new SeriesFormat({ type: SeriesFormatType.EXACT });
exports.PERCENT_FORMAT = new SeriesFormat({ type: SeriesFormatType.PERCENT });
const customFormat = (value) => new SeriesFormat({ type: SeriesFormatType.CUSTOM, value });
exports.customFormat = customFormat;
function formatFnFactory(format) {
    return (n) => {
        if (!general_1.isNumber(n) || !general_1.isFiniteNumber(n))
            return "-";
        return numbro_1.default(n).format(format);
    };
}
exports.formatFnFactory = formatFnFactory;
exports.exactFormat = "0,0";
const exactFormatter = formatFnFactory(exports.exactFormat);
exports.percentFormat = "0[.]00%";
const percentFormatter = formatFnFactory(exports.percentFormat);
exports.measureDefaultFormat = "0,0.0 a";
exports.defaultFormatter = formatFnFactory(exports.measureDefaultFormat);
function seriesFormatter(format, measure) {
    //@ts-ignore
    switch (format.type) {
        case SeriesFormatType.DEFAULT:
            return measure.formatFn;
        case SeriesFormatType.EXACT:
            return exactFormatter;
        case SeriesFormatType.PERCENT:
            return percentFormatter;
        case SeriesFormatType.CUSTOM:
            //@ts-ignore
            return formatFnFactory(format.value);
    }
}
exports.seriesFormatter = seriesFormatter;
//# sourceMappingURL=series-format.js.map