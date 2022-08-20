"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const chai_1 = require("chai");
const chronoshift_1 = require("chronoshift");
const immutable_1 = require("immutable");
//@ts-ignore
const essence_fixtures_1 = require("../../models/essence/essence.fixtures");
const filter_clause_1 = require("../../models/filter-clause/filter-clause");
//@ts-ignore
const filter_clause_fixtures_1 = require("../../models/filter-clause/filter-clause.fixtures");
const filter_1 = require("../../models/filter/filter");
const timekeeper_fixtures_1 = require("../../models/timekeeper/timekeeper.fixtures");
const time_filter_canonical_length_1 = __importDefault(require("./time-filter-canonical-length"));
const timekeeper = timekeeper_fixtures_1.TimekeeperFixtures.fixed();
describe("Time filter canonical length", () => {
    it("returns canonical length of time filter for one day", () => {
        const essence = essence_fixtures_1.EssenceFixtures.wikiTable();
        chai_1.expect(time_filter_canonical_length_1.default(essence, timekeeper)).to.equal(chronoshift_1.day.canonicalLength);
    });
    it("returns canonical length of time filter for one month", () => {
        const essence = essence_fixtures_1.EssenceFixtures.wikiTable();
        const oneMonthTimeClause = filter_clause_fixtures_1.timePeriod("time", "P1M", filter_clause_1.TimeFilterPeriod.CURRENT);
        const oneMonthFilter = new filter_1.Filter({ clauses: immutable_1.List.of(oneMonthTimeClause) });
        const essenceWithOneMonthFilter = essence.changeFilter(oneMonthFilter);
        chai_1.expect(time_filter_canonical_length_1.default(essenceWithOneMonthFilter, timekeeper)).to.equal(chronoshift_1.month.canonicalLength);
    });
});
//# sourceMappingURL=time-filter-canonical-length.mocha.js.map