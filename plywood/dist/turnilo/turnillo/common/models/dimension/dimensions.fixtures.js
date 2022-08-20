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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DimensionsFixtures = void 0;
const dimension_group_fixtures_1 = require("./dimension-group.fixtures");
const dimension_fixtures_1 = require("./dimension.fixtures");
class DimensionsFixtures {
    static wikiNames() {
        return ["time", "country", "channel", "comment", "commentLength", "commentLengthOver100", "isRobot", "namespace", "articleName", "page", "page_last_author", "userChars"];
    }
    static wikiTitles() {
        return ["Time", "Country", "Channel", "Comment", "Comment Length", "Comment Length Over 100", "Is Robot", "Namespace", "Article Name", "Page", "Page Author", "User Chars"];
    }
    static wikiJS() {
        return [
            dimension_fixtures_1.DimensionFixtures.wikiTimeJS(),
            {
                kind: "string",
                name: "country",
                title: "Country",
                formula: "$country"
            },
            {
                kind: "string",
                name: "channel",
                title: "Channel",
                formula: "$channel"
            },
            dimension_group_fixtures_1.DimensionGroupFixtures.commentsJS(),
            {
                kind: "string",
                name: "isRobot",
                title: "Is Robot",
                formula: "$isRobot"
            },
            {
                kind: "string",
                name: "namespace",
                title: "Namespace",
                formula: "$namespace"
            },
            {
                kind: "string",
                name: "articleName",
                title: "Article Name",
                formula: "$articleName"
            },
            {
                kind: "string",
                name: "page",
                title: "Page",
                formula: "$page"
            },
            {
                kind: "string",
                name: "page_last_author",
                title: "Page Author",
                formula: "$page.lookup(page_last_author)"
            },
            {
                kind: "string",
                name: "userChars",
                title: "User Chars",
                formula: "$userChars"
            }
        ];
    }
    static twitterJS() {
        return [
            {
                kind: "time",
                name: "time",
                title: "Time",
                formula: "$time"
            },
            {
                kind: "string",
                name: "twitterHandle",
                title: "Twitter Handle",
                formula: "$twitterHandle"
            },
            {
                kind: "number",
                name: "tweetLength",
                title: "Tweet Length",
                formula: "$tweetLength"
            }
        ];
    }
}
exports.DimensionsFixtures = DimensionsFixtures;
//# sourceMappingURL=dimensions.fixtures.js.map