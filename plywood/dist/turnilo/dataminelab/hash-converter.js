"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashToExpression = void 0;
const data_cube_1 = require("../turnillo/common/models/data-cube/data-cube");
const url_hash_converter_1 = require("../turnillo/common/utils/url-hash-converter/url-hash-converter");
const datareporter_plywood_1 = require("datareporter-plywood");
const timekeeper_1 = require("../turnillo/common/models/timekeeper/timekeeper");
const filter_clause_1 = require("../turnillo/common/models/filter-clause/filter-clause");
const split_1 = require("../turnillo/common/models/split/split");
const time_shift_env_1 = require("../turnillo/common/models/time-shift/time-shift-env");
const split_canonical_length_1 = __importDefault(require("../turnillo/common/utils/canonical-length/split-canonical-length"));
const time_filter_canonical_length_1 = __importDefault(require("../turnillo/common/utils/canonical-length/time-filter-canonical-length"));
const functional_1 = require("../turnillo/common/utils/functional/functional");
const immer_1 = __importDefault(require("immer"));
const SPLIT = "SPLIT";
const CANONICAL_LENGTH_ID = "MillisecondsInInterval";
const hashToExpression = (hash, dataCubeInput) => {
    const segmentName = dataCubeInput.name;
    if (!segmentName) {
        throw new Error("Name is required");
    }
    const preparedDataCube = immer_1.default(dataCubeInput, draftState => {
        draftState.measures = dataCubeInput.measures.map((m) => {
            const formula = m.formula.replace('$main', `$${segmentName}`);
            return Object.assign(Object.assign({}, m), { formula });
        });
    });
    const $main = datareporter_plywood_1.$(segmentName);
    const myDataCube = data_cube_1.DataCube.fromJS(preparedDataCube);
    const preparedHash = `4/${hash}`;
    const essence = url_hash_converter_1.urlHashConverter.essenceFromHash(preparedHash, myDataCube);
    //@ts-ignore
    const { splits, dataCube } = essence;
    if (splits.length() > dataCube.getMaxSplits()) {
        throw new Error(`Too many splits in query. DataCube "${dataCube.name}" supports only ${dataCube.getMaxSplits()} splits`);
    }
    // To do, find out what is time keeper
    const timeKeeper = timekeeper_1.Timekeeper.fromJS({
        timeTags: [],
    });
    const hasComparison = essence.hasComparison();
    const mainFilter = essence.getEffectiveFilter(timeKeeper, { combineWithPrevious: hasComparison });
    const mainExp = datareporter_plywood_1.ply()
        .apply(segmentName, $main.filter(mainFilter.toExpression(dataCube)))
        .apply(CANONICAL_LENGTH_ID, time_filter_canonical_length_1.default(essence, timeKeeper));
    const timeShiftEnv = essence.getTimeShiftEnv(timeKeeper);
    const queryWithMeasures = applySeries(essence.getConcreteSeries(), timeShiftEnv)(mainExp);
    const res = splits.length() > 0
        ? queryWithMeasures
            .apply(SPLIT, applySplit(0, essence, timeShiftEnv, $main))
        : queryWithMeasures;
    return res.toJS();
};
exports.hashToExpression = hashToExpression;
function applyLimit(limit, dimension) {
    return (query) => {
        if (limit) {
            return query.performAction(new datareporter_plywood_1.LimitExpression({ value: limit }));
        }
        if (dimension.kind === "number") {
            // Hack: Plywood converts groupBys to topN if the limit is below a certain threshold.  Currently sorting on dimension in a groupBy query does not
            // behave as expected and in the future plywood will handle this, but for now add a limit so a topN query is performed.
            // 5000 is just a randomly selected number that's high enough that it's not immediately obvious that there's a limit.
            return query.limit(5000);
        }
        return query;
    };
}
function applySeries(series, timeShiftEnv, nestingLevel = 0) {
    return (query) => {
        return series.reduce((query, series) => {
            return query.performAction(series.plywoodExpression(nestingLevel, timeShiftEnv));
        }, query);
    };
}
function applyTimeShift(type, expression, env) {
    if (env.type === time_shift_env_1.TimeShiftEnvType.WITH_PREVIOUS && type === split_1.SplitType.time) {
        return env.currentFilter.then(expression).fallback(expression.timeShift(env.shift));
    }
    return expression;
}
//@ts-ignore
function splitToExpression({ bucket, type }, { expression }, env) {
    const expWithShift = applyTimeShift(type, expression, env);
    if (!bucket)
        return expWithShift;
    return expWithShift.performAction(split_1.bucketToAction(bucket));
}
function applyDimensionFilter(dimension, filter) {
    return (query) => {
        if (!dimension.multiValue)
            return query;
        const filterClause = filter.clauseForReference(dimension.name);
        if (!filterClause)
            return query;
        return query.filter(filter_clause_1.toExpression(filterClause, dimension));
    };
}
function applyCanonicalLengthForTimeSplit(split, dataCube) {
    return (exp) => {
        const canonicalLength = split_canonical_length_1.default(split, dataCube);
        if (!canonicalLength)
            return exp;
        return exp.apply(CANONICAL_LENGTH_ID, canonicalLength);
    };
}
function applySort(sort) {
    return (query) => query.performAction(sort.toExpression());
}
function applySplit(index, essence, timeShiftEnv, $main) {
    //@ts-ignore
    const { splits, dataCube } = essence;
    const split = splits.getSplit(index);
    const dimension = dataCube.getDimension(split.reference);
    const { sort, limit } = split;
    if (!sort) {
        throw new Error("something went wrong during query generation");
    }
    const nestingLevel = index + 1;
    const currentSplit = splitToExpression(split, dimension, timeShiftEnv);
    return functional_1.thread($main.split(currentSplit, dimension.name), 
    //@ts-ignore
    applyDimensionFilter(dimension, essence.filter), applyCanonicalLengthForTimeSplit(split, dataCube), applySeries(essence.getConcreteSeries(), timeShiftEnv, nestingLevel), applySort(sort), applyLimit(limit, dimension), applySubSplit(nestingLevel, essence, timeShiftEnv, $main));
}
function applySubSplit(nestingLevel, essence, timeShiftEnv, $main) {
    return (query) => {
        //@ts-ignore
        if (nestingLevel >= essence.splits.length())
            return query;
        return query.apply(SPLIT, applySplit(nestingLevel, essence, timeShiftEnv, $main));
    };
}
//# sourceMappingURL=hash-converter.js.map