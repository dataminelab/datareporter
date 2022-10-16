import { DataCube, DataCubeJS } from "../turnillo/common/models/data-cube/data-cube";
import { urlHashConverter } from "../turnillo/common/utils/url-hash-converter/url-hash-converter";
import { $, Expression, LimitExpression, ply, RefExpression } from "reporter-plywood";
import { Timekeeper } from "../turnillo/common/models/timekeeper/timekeeper";
import { List } from "immutable";
import { Dimension } from "../turnillo/common/models/dimension/dimension";
import { Essence } from "../turnillo/common/models/essence/essence";
import { toExpression } from "../turnillo/common/models/filter-clause/filter-clause";
import { Filter } from "../turnillo/common/models/filter/filter";
import { ConcreteSeries } from "../turnillo/common/models/series/concrete-series";
import { Sort } from "../turnillo/common/models/sort/sort";
import { SplitType, Split, bucketToAction } from "../turnillo/common/models/split/split";
import { TimeShiftEnv, TimeShiftEnvType } from "../turnillo/common/models/time-shift/time-shift-env";
import splitCanonicalLength from "../turnillo/common/utils/canonical-length/split-canonical-length";
import timeFilterCanonicalLength from "../turnillo/common/utils/canonical-length/time-filter-canonical-length";
import { thread } from "../turnillo/common/utils/functional/functional";
import produce from "immer"
import { MeasureJS } from "../turnillo/common/models/measure/measure";

const SPLIT = "SPLIT";
const CANONICAL_LENGTH_ID = "MillisecondsInInterval";


export const hashToExpression = (hash: string, dataCubeInput: DataCubeJS) => {

    const segmentName: string | undefined = dataCubeInput.name;

    if (!segmentName) {
        throw new Error("Name is required");
    }

    const preparedDataCube = produce(dataCubeInput, draftState => {
        draftState.measures = dataCubeInput.measures.map((m: MeasureJS) => {
            const formula = m.formula.replace('$main', `$${segmentName}`)
            return { ...m, formula }
        })
    });

    const $main = $(segmentName);

    const myDataCube: DataCube = DataCube.fromJS(preparedDataCube);
    const preparedHash = `4/${hash}`;
    const essence = urlHashConverter.essenceFromHash(preparedHash, myDataCube);

    //@ts-ignore
    const { splits, dataCube } = essence;

    if (splits.length() > dataCube.getMaxSplits()) {
        throw new Error(`Too many splits in query. DataCube "${dataCube.name}" supports only ${dataCube.getMaxSplits()} splits`);
    }


    // To do, find out what is time keeper

    const timeKeeper = Timekeeper.fromJS({
        timeTags: [],
    });

    const hasComparison = essence.hasComparison();
    const mainFilter = essence.getEffectiveFilter(timeKeeper, { combineWithPrevious: hasComparison });

    const mainExp: Expression = ply()
        .apply(segmentName, $main.filter(mainFilter.toExpression(dataCube)))
        .apply(CANONICAL_LENGTH_ID, timeFilterCanonicalLength(essence, timeKeeper));

    const timeShiftEnv: TimeShiftEnv = essence.getTimeShiftEnv(timeKeeper);


    const queryWithMeasures = applySeries(essence.getConcreteSeries(), timeShiftEnv)(mainExp);
    const res: Expression = splits.length() > 0
        ? queryWithMeasures
            .apply(SPLIT, applySplit(0, essence, timeShiftEnv, $main))
        : queryWithMeasures

    return res.toJS();
}

function applyLimit(limit: number, dimension: Dimension) {
    return (query: Expression) => {
        if (limit) {
            return query.performAction(new LimitExpression({ value: limit }));
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
function applySeries(series: List<ConcreteSeries>, timeShiftEnv: TimeShiftEnv, nestingLevel = 0) {

    return (query: Expression) => {
        return series.reduce((query, series) => {
            return query.performAction(series.plywoodExpression(nestingLevel, timeShiftEnv));
        }, query);
    };
}

function applyTimeShift(type: SplitType, expression: Expression, env: TimeShiftEnv): Expression {
    if (env.type === TimeShiftEnvType.WITH_PREVIOUS && type === SplitType.time) {
        return env.currentFilter.then(expression).fallback(expression.timeShift(env.shift));
    }
    return expression;
}

//@ts-ignore
function splitToExpression({ bucket, type }: Split, { expression }: Dimension, env: TimeShiftEnv): Expression {
    const expWithShift = applyTimeShift(type, expression, env);
    if (!bucket) return expWithShift;
    return expWithShift.performAction(bucketToAction(bucket));
}


function applyDimensionFilter(dimension: Dimension, filter: Filter) {
    return (query: Expression) => {
        if (!dimension.multiValue) return query;
        const filterClause = filter.clauseForReference(dimension.name);
        if (!filterClause) return query;
        return query.filter(toExpression(filterClause, dimension));
    };
}
function applyCanonicalLengthForTimeSplit(split: Split, dataCube: DataCube) {
    return (exp: Expression) => {
        const canonicalLength = splitCanonicalLength(split, dataCube);
        if (!canonicalLength) return exp;
        return exp.apply(CANONICAL_LENGTH_ID, canonicalLength);
    };
}
function applySort(sort: Sort) {
    return (query: Expression) => query.performAction(sort.toExpression());
}

function applySplit(index: number, essence: Essence, timeShiftEnv: TimeShiftEnv, $main: RefExpression): Expression {
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

    return thread(
        $main.split(currentSplit, dimension.name),
        //@ts-ignore
        applyDimensionFilter(dimension, essence.filter),
        applyCanonicalLengthForTimeSplit(split, dataCube),
        applySeries(essence.getConcreteSeries(), timeShiftEnv, nestingLevel),
        applySort(sort),
        applyLimit(limit, dimension),
        applySubSplit(nestingLevel, essence, timeShiftEnv, $main)
    );
}

function applySubSplit(nestingLevel: number, essence: Essence, timeShiftEnv: TimeShiftEnv, $main: RefExpression) {
    return (query: Expression) => {
        //@ts-ignore
        if (nestingLevel >= essence.splits.length()) return query;
        return query.apply(SPLIT, applySplit(nestingLevel, essence, timeShiftEnv, $main));
    };
}
