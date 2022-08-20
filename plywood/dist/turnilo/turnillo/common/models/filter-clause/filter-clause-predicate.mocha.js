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
const chai_1 = require("chai");
const immutable_1 = require("immutable");
const filter_clause_1 = require("./filter-clause");
const filter_clause_predicate_1 = require("./filter-clause-predicate");
describe("Clause Predicate", () => {
    describe("StringFilterClause", () => {
        const input = ["foo", "bar", "baz", "qvux", "spam", "eggs"];
        it("Include", () => {
            const clause = new filter_clause_1.StringFilterClause({ action: filter_clause_1.StringFilterAction.IN, values: immutable_1.Set.of("bar", "baz") });
            const predicate = filter_clause_predicate_1.clausePredicate(clause);
            chai_1.expect(input.filter(predicate)).to.be.deep.eq(["bar", "baz"]);
        });
        it("Exclude", () => {
            const clause = new filter_clause_1.StringFilterClause({ action: filter_clause_1.StringFilterAction.IN, not: true, values: immutable_1.Set.of("bar", "baz") });
            const predicate = filter_clause_predicate_1.clausePredicate(clause);
            chai_1.expect(input.filter(predicate)).to.be.deep.eq(["foo", "qvux", "spam", "eggs"]);
        });
        it("Contains", () => {
            const clause = new filter_clause_1.StringFilterClause({ action: filter_clause_1.StringFilterAction.CONTAINS, values: immutable_1.Set.of("a") });
            const predicate = filter_clause_predicate_1.clausePredicate(clause);
            chai_1.expect(input.filter(predicate)).to.be.deep.eq(["bar", "baz", "spam"]);
        });
        it("Regular Expression", () => {
            const clause = new filter_clause_1.StringFilterClause({ action: filter_clause_1.StringFilterAction.MATCH, values: immutable_1.Set.of("a(r|z)") });
            const predicate = filter_clause_predicate_1.clausePredicate(clause);
            chai_1.expect(input.filter(predicate)).to.be.deep.eq(["bar", "baz"]);
        });
    });
});
//# sourceMappingURL=filter-clause-predicate.mocha.js.map