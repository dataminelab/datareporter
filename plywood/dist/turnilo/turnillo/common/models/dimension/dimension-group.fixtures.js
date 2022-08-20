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
exports.DimensionGroupFixtures = void 0;
const dimension_fixtures_1 = require("./dimension.fixtures");
class DimensionGroupFixtures {
    static noTitleJS() {
        return {
            name: "dummyName",
            dimensions: [
                dimension_fixtures_1.DimensionFixtures.wikiTimeJS()
            ]
        };
    }
    static withTitleInferredJS() {
        return {
            name: "dummyName",
            title: "Dummy Name",
            dimensions: [
                dimension_fixtures_1.DimensionFixtures.wikiTimeJS()
            ]
        };
    }
    static noNameJS() {
        return {
            dimensions: [dimension_fixtures_1.DimensionFixtures.wikiTimeJS()]
        };
    }
    static noDimensionsJS() {
        return {
            name: "dummyName"
        };
    }
    static emptyDimensionsJS() {
        return {
            name: "dummyName",
            dimensions: []
        };
    }
    static commentsJS() {
        return {
            name: "comment_group",
            title: "Comment Group",
            dimensions: [
                {
                    kind: "string",
                    name: "comment",
                    title: "Comment",
                    formula: "$comment"
                },
                {
                    kind: "number",
                    name: "commentLength",
                    title: "Comment Length",
                    formula: "$commentLength"
                },
                {
                    kind: "boolean",
                    name: "commentLengthOver100",
                    title: "Comment Length Over 100",
                    formula: "$commentLength > 100"
                }
            ]
        };
    }
}
exports.DimensionGroupFixtures = DimensionGroupFixtures;
//# sourceMappingURL=dimension-group.fixtures.js.map