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
exports.DimensionFixtures = void 0;
const dimension_1 = require("./dimension");
class DimensionFixtures {
    static get COUNTRY_STRING_JS() {
        return {
            name: "country",
            title: "important countries",
            formula: "$country",
            kind: "string"
        };
    }
    static get COUNTRY_URL_JS() {
        return {
            name: "country",
            title: "important countries",
            formula: "$country",
            kind: "string",
            url: "https://www.country.com/%s" // country.com redirects to a CMT.com. Could've been worse.
        };
    }
    static get TIME_JS() {
        return {
            name: "time",
            title: "time",
            formula: "$time",
            kind: "time",
            url: "http://www.time.com/%s"
        };
    }
    static get NUMBER_JS() {
        return {
            name: "numeric",
            title: "Numeric",
            formula: "$n",
            kind: "number"
        };
    }
    static wikiTimeJS() {
        return {
            name: "time",
            title: "Time",
            formula: "$time",
            kind: "time"
        };
    }
    static wikiCommentLengthJS() {
        return {
            name: "commentLength",
            title: "Comment Length",
            formula: "$commentLength",
            kind: "number"
        };
    }
    static wikiTime() {
        return new dimension_1.Dimension({
            name: "time",
            title: "Time",
            formula: "$time",
            kind: "time"
        });
    }
    static wikiIsRobot() {
        return new dimension_1.Dimension({
            name: "isRobot",
            title: "Is Robot",
            formula: "$isRobot",
            kind: "boolean"
        });
    }
    static wikiChannel() {
        return new dimension_1.Dimension({
            name: "channel",
            title: "Channel",
            formula: "$channel"
        });
    }
    static countryString() {
        return dimension_1.Dimension.fromJS(DimensionFixtures.COUNTRY_STRING_JS);
    }
    static countryURL() {
        return dimension_1.Dimension.fromJS(DimensionFixtures.COUNTRY_URL_JS);
    }
    static time() {
        return dimension_1.Dimension.fromJS(DimensionFixtures.TIME_JS);
    }
    static number() {
        return dimension_1.Dimension.fromJS(DimensionFixtures.NUMBER_JS);
    }
    static wikiCommentLength() {
        return dimension_1.Dimension.fromJS(DimensionFixtures.wikiCommentLengthJS());
    }
}
exports.DimensionFixtures = DimensionFixtures;
//# sourceMappingURL=dimension.fixtures.js.map