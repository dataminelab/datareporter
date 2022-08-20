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
exports.EMPTY_FILTER = exports.Filter = exports.FilterMode = void 0;
const immutable_1 = require("immutable");
const datareporter_plywood_1 = require("datareporter-plywood");
const filter_clause_1 = require("../filter-clause/filter-clause");
var FilterMode;
(function (FilterMode) {
    FilterMode["EXCLUDE"] = "exclude";
    FilterMode["INCLUDE"] = "include";
    FilterMode["REGEX"] = "regex";
    FilterMode["CONTAINS"] = "contains";
})(FilterMode = exports.FilterMode || (exports.FilterMode = {}));
const defaultFilter = { clauses: immutable_1.List([]) };
//@ts-ignore
class Filter extends immutable_1.Record(defaultFilter) {
    static fromClause(clause) {
        return this.fromClauses([clause]);
    }
    static fromClauses(clauses) {
        if (!clauses)
            throw new Error("must have clause");
        return new Filter({ clauses: immutable_1.List(clauses) });
    }
    static fromJS(definition) {
        return new Filter({
            clauses: immutable_1.List(definition.clauses.map(def => filter_clause_1.fromJS(def)))
        });
    }
    updateClauses(updater) {
        //@ts-ignore
        return this.update("clauses", updater);
    }
    toString() {
        //@ts-ignore
        return this.clauses.map(clause => clause.toString()).join(" and ");
    }
    replaceByIndex(index, newClause) {
        if (this.length() === index) {
            return this.insertByIndex(index, newClause);
        }
        return this.updateClauses((clauses) => {
            const newClauseIndex = clauses.findIndex(clause => clause.equals(newClause));
            if (newClauseIndex === -1)
                return clauses.set(index, newClause);
            const oldClause = clauses.get(index);
            return clauses
                .set(index, newClause)
                .set(newClauseIndex, oldClause);
        });
    }
    insertByIndex(index, newClause) {
        //@ts-ignore
        return this.updateClauses((clauses) => clauses
            .insert(index, newClause)
            .filterNot((c, i) => c.equals(newClause) && i !== index));
    }
    empty() {
        //@ts-ignore
        return this.clauses.count() === 0;
    }
    single() {
        //@ts-ignore
        return this.clauses.count() === 1;
    }
    length() {
        //@ts-ignore
        return this.clauses.count();
    }
    toExpression(dataCube) {
        //@ts-ignore
        const clauses = this.clauses.toArray().map(clause => filter_clause_1.toExpression(clause, dataCube.getDimension(clause.reference)));
        switch (clauses.length) {
            case 0:
                return datareporter_plywood_1.Expression.TRUE;
            case 1:
                return clauses[0];
            default:
                return datareporter_plywood_1.Expression.and(clauses);
        }
    }
    isRelative() {
        //@ts-ignore
        return this.clauses.some(clause => clause instanceof filter_clause_1.RelativeTimeFilterClause);
    }
    getSpecificFilter(now, maxTime, timezone) {
        if (!this.isRelative())
            return this;
        return this.updateClauses(clauses => 
        //@ts-ignore
        clauses.map(clause => {
            if (clause instanceof filter_clause_1.RelativeTimeFilterClause) {
                return clause.evaluate(now, maxTime, timezone);
            }
            return clause;
        }));
    }
    indexOfClause(reference) {
        //@ts-ignore
        return this.clauses.findIndex(clause => clause.reference === reference);
    }
    clauseForReference(reference) {
        //@ts-ignore
        return this.clauses.find(clause => clause.reference === reference);
    }
    addClause(clause) {
        return this.updateClauses(clauses => clauses.push(clause));
    }
    removeClause(reference) {
        const index = this.indexOfClause(reference);
        if (index === -1)
            return this;
        return this.updateClauses(clauses => clauses.delete(index));
    }
    filteredOn(reference) {
        return this.indexOfClause(reference) !== -1;
    }
    getClauseForDimension({ name }) {
        //@ts-ignore
        return this.clauses.find(clause => clause.reference === name);
    }
    getModeForDimension({ name }) {
        //@ts-ignore
        const dimensionClauses = this.clauses.filter(clause => clause.reference === name);
        if (dimensionClauses.size > 0) {
            if (dimensionClauses.every(clause => 
            //@ts-ignore
            clause instanceof filter_clause_1.StringFilterClause && clause.action === filter_clause_1.StringFilterAction.MATCH)) {
                return FilterMode.REGEX;
            }
            if (dimensionClauses.every(clause => 
            //@ts-ignore
            clause instanceof filter_clause_1.StringFilterClause && clause.action === filter_clause_1.StringFilterAction.CONTAINS)) {
                return FilterMode.CONTAINS;
            }
            if (dimensionClauses.every((clause) => clause.not)) {
                return FilterMode.EXCLUDE;
            }
            return FilterMode.INCLUDE;
        }
        return undefined;
    }
    setClause(newClause) {
        //@ts-ignore
        const idx = this.clauses.findIndex(clause => clause.reference === newClause.reference);
        //@ts-ignore
        return this.updateClauses(clauses => idx === -1 ? clauses.concat([newClause]) : clauses.set(idx, newClause));
    }
    mergeClauses(clauses) {
        //@ts-ignore
        return clauses.reduce((filter, deltaClause) => filter.setClause(deltaClause), this);
    }
    constrainToDimensions(dimensions) {
        return this.updateClauses(clauses => 
        //@ts-ignore
        clauses.filter(clause => dimensions.getDimensionByName(clause.reference)));
    }
    setExclusionForDimension(exclusion, { name }) {
        return this.updateClauses(clauses => {
            //@ts-ignore
            const idx = clauses.findIndex(clause => clause.reference === name);
            if (idx === -1)
                return clauses;
            return clauses.setIn([idx, "not"], exclusion);
        });
    }
}
exports.Filter = Filter;
exports.EMPTY_FILTER = new Filter({});
//# sourceMappingURL=filter.js.map