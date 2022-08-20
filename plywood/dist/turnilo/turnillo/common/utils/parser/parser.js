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
exports.parseData = exports.parseJSON = exports.parseTSV = exports.parseCSV = void 0;
const d3 = __importStar(require("d3"));
function parseCSV(text) {
    return d3.csv.parse(text);
}
exports.parseCSV = parseCSV;
function parseTSV(text) {
    return d3.tsv.parse(text);
}
exports.parseTSV = parseTSV;
function parseJSON(text) {
    text = text.trim();
    var firstChar = text[0];
    if (firstChar[0] === "[") {
        try {
            return JSON.parse(text);
        }
        catch (e) {
            throw new Error("could not parse");
        }
    }
    else if (firstChar[0] === "{") { // Also support line json
        return text.split(/\r?\n/).map((line, i) => {
            try {
                return JSON.parse(line);
            }
            catch (e) {
                throw new Error(`problem in line: ${i}: '${line}'`);
            }
        });
    }
    else {
        throw new Error(`Unsupported start, starts with '${firstChar[0]}'`);
    }
}
exports.parseJSON = parseJSON;
function parseData(text, type) {
    type = type.replace(".", "");
    switch (type) {
        case "csv":
        case "text/csv":
            return parseCSV(text);
        case "tsv":
        case "text/tsv":
        case "text/tab-separated-values":
            return parseTSV(text);
        case "json":
        case "application/json":
            return parseJSON(text);
        default:
            throw new Error(`Unsupported file type '${type}'`);
    }
}
exports.parseData = parseData;
//# sourceMappingURL=parser.js.map