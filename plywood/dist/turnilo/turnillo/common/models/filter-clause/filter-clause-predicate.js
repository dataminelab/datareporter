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
exports.clausePredicate = void 0;
const functional_1 = require("../../utils/functional/functional");
const filter_clause_1 = require("./filter-clause");
//@ts-ignore
function clausePredicate({ action, values, not }) {
    switch (action) {
        case filter_clause_1.StringFilterAction.IN:
            //@ts-ignore
            const predicate = (str) => values.has(str);
            return not ? functional_1.complement(predicate) : predicate;
        case filter_clause_1.StringFilterAction.MATCH:
            //@ts-ignore
            const regExp = new RegExp(values.first());
            return str => regExp.test(str);
        case filter_clause_1.StringFilterAction.CONTAINS:
            //@ts-ignore
            return str => str.includes(values.first());
    }
}
exports.clausePredicate = clausePredicate;
//# sourceMappingURL=filter-clause-predicate.js.map