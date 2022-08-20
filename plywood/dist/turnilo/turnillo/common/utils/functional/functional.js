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
exports.debounceWithPromise = exports.range = exports.or = exports.complement = exports.threadConditionally = exports.threadNullable = exports.thread = exports.mapTruthy = exports.concatTruthy = exports.flatMap = exports.zip = exports.cons = exports.compose = exports.constant = exports.identity = exports.noop = void 0;
const general_1 = require("../general/general");
function noop(...args) {
}
exports.noop = noop;
const identity = (x) => x;
exports.identity = identity;
const constant = (val) => () => val;
exports.constant = constant;
const compose = (f, g) => (x) => g(f(x));
exports.compose = compose;
function cons(coll, element) {
    return coll.concat([element]);
}
exports.cons = cons;
function zip(xs, ys) {
    const length = Math.min(xs.length, ys.length);
    return xs.slice(0, length).map((x, idx) => {
        const y = ys[idx];
        return [x, y];
    });
}
exports.zip = zip;
function flatMap(coll, mapper) {
    return [].concat(...coll.map(mapper));
}
exports.flatMap = flatMap;
function concatTruthy(...elements) {
    return elements.reduce((result, element) => general_1.isTruthy(element) ? cons(result, element) : result, []);
}
exports.concatTruthy = concatTruthy;
function mapTruthy(coll, f) {
    return coll.reduce((result, element, idx) => {
        const mapped = f(element, idx);
        return general_1.isTruthy(mapped) ? cons(result, mapped) : result;
    }, []);
}
exports.mapTruthy = mapTruthy;
function thread(x, ...fns) {
    return fns.reduce((x, f) => f(x), x);
}
exports.thread = thread;
function threadNullable(x, ...fns) {
    return fns.reduce((x, f) => general_1.isTruthy(x) ? f(x) : x, x);
}
exports.threadNullable = threadNullable;
const isCallable = (f) => typeof f === "function";
function threadConditionally(x, ...fns) {
    return fns.reduce((x, f) => isCallable(f) ? f(x) : x, x);
}
exports.threadConditionally = threadConditionally;
function complement(p) {
    return (x) => !p(x);
}
exports.complement = complement;
function or(...ps) {
    return (value) => ps.reduce((acc, p) => p(value) || acc, false);
}
exports.or = or;
function range(from, to) {
    const result = [];
    let n = from;
    while (n < to) {
        result.push(n);
        n += 1;
    }
    return result;
}
exports.range = range;
// TODO: fix to use infer on arguments tuple https://stackoverflow.com/a/50014868/1089761
function debounceWithPromise(fn, ms) {
    let timeoutId;
    const debouncedFn = function (...args) {
        let resolve;
        const promise = new Promise(pResolve => {
            resolve = pResolve;
        });
        const callLater = () => {
            timeoutId = undefined;
            resolve(fn(...args));
        };
        if (timeoutId !== undefined) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(callLater, ms);
        return promise;
    };
    debouncedFn.cancel = () => timeoutId && clearTimeout(timeoutId);
    return debouncedFn;
}
exports.debounceWithPromise = debounceWithPromise;
//# sourceMappingURL=functional.js.map