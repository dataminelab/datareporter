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
exports.ViewDefinitionConverter2 = void 0;
const chronoshift_1 = require("chronoshift");
const immutable_1 = require("immutable");
const datareporter_plywood_1 = require("datareporter-plywood");
const date_range_1 = require("../../models/date-range/date-range");
const essence_1 = require("../../models/essence/essence");
const filter_clause_1 = require("../../models/filter-clause/filter-clause");
const filter_1 = require("../../models/filter/filter");
const series_list_1 = require("../../models/series-list/series-list");
const sort_1 = require("../../models/sort/sort");
const split_1 = require("../../models/split/split");
const splits_1 = require("../../models/splits/splits");
const time_shift_1 = require("../../models/time-shift/time-shift");
const visualization_manifests_1 = require("../../visualization-manifests");
class ViewDefinitionConverter2 {
    constructor() {
        this.version = 2;
    }
    fromViewDefinition(definition, dataCube) {
        const visualization = visualization_manifests_1.manifestByName(definition.visualization);
        const visualizationSettings = visualization.visualizationSettings.defaults;
        const measureNames = definition.multiMeasureMode ? definition.selectedMeasures : [definition.singleMeasure];
        const series = series_list_1.SeriesList.fromMeasures(dataCube.measures.getMeasuresByNames(measureNames));
        const timezone = definition.timezone && chronoshift_1.Timezone.fromJS(definition.timezone);
        const filter = filter_1.Filter.fromClauses(filterJSConverter(definition.filter, dataCube));
        const pinnedDimensions = immutable_1.OrderedSet(definition.pinnedDimensions);
        const splits = splits_1.Splits.fromSplits(splitJSConverter(definition.splits, dataCube));
        const timeShift = time_shift_1.TimeShift.empty();
        const pinnedSort = definition.pinnedSort;
        return new essence_1.Essence({
            dataCube,
            visualization,
            visualizationSettings,
            timezone,
            filter,
            timeShift,
            splits,
            pinnedDimensions,
            series,
            pinnedSort
        });
    }
    toViewDefinition(essence) {
        throw new Error("toViewDefinition is not supported in Version 2");
    }
}
exports.ViewDefinitionConverter2 = ViewDefinitionConverter2;
function isBooleanFilterSelection(selection) {
    return selection instanceof datareporter_plywood_1.LiteralExpression && selection.type === "SET/BOOLEAN";
}
function isNumberFilterSelection(selection) {
    return selection instanceof datareporter_plywood_1.LiteralExpression && selection.type === "SET/NUMBER_RANGE";
}
function isFixedTimeRangeSelection(selection) {
    return selection instanceof datareporter_plywood_1.LiteralExpression && selection.type === "TIME_RANGE";
}
function isRelativeTimeRangeSelection(selection) {
    return selection instanceof datareporter_plywood_1.TimeRangeExpression || selection instanceof datareporter_plywood_1.TimeBucketExpression;
}
function filterJSConverter(filter, dataCube) {
    const filterExpression = datareporter_plywood_1.Expression.fromJSLoose(filter);
    if (filterExpression instanceof datareporter_plywood_1.LiteralExpression && filterExpression.simple)
        return [];
    if (filterExpression instanceof datareporter_plywood_1.AndExpression) {
        return filterExpression.getExpressionList().map(exp => convertFilterExpression(exp, dataCube));
    }
    else {
        return [convertFilterExpression(filterExpression, dataCube)];
    }
}
var SupportedAction;
(function (SupportedAction) {
    SupportedAction["overlap"] = "overlap";
    SupportedAction["contains"] = "contains";
    SupportedAction["match"] = "match";
})(SupportedAction || (SupportedAction = {}));
function readBooleanFilterClause(selection, dimension, not) {
    const { name: reference } = dimension;
    return new filter_clause_1.BooleanFilterClause({ reference, values: immutable_1.Set(selection.value.elements), not });
}
function readNumberFilterClause(selection, dimension, not) {
    const { name: reference } = dimension;
    if (isNumberFilterSelection(selection) && selection.value instanceof datareporter_plywood_1.Set) {
        const values = immutable_1.List(selection.value.elements.map((range) => new filter_clause_1.NumberRange(range)));
        return new filter_clause_1.NumberFilterClause({ reference, not, values });
    }
    else {
        throw new Error(`Number filterClause expected, found: ${selection}. Dimension: ${reference}`);
    }
}
function readFixedTimeFilter(selection, dimension) {
    const { name: reference } = dimension;
    return new filter_clause_1.FixedTimeFilterClause({ reference, values: immutable_1.List.of(new date_range_1.DateRange(selection.value)) });
}
function readRelativeTimeFilterClause({ step, duration, operand }, dimension) {
    const { name: reference } = dimension;
    if (operand instanceof datareporter_plywood_1.TimeFloorExpression) {
        return new filter_clause_1.RelativeTimeFilterClause({
            reference,
            duration: duration.multiply(Math.abs(step)),
            period: filter_clause_1.TimeFilterPeriod.PREVIOUS
        });
    }
    return new filter_clause_1.RelativeTimeFilterClause({
        reference,
        period: step ? filter_clause_1.TimeFilterPeriod.LATEST : filter_clause_1.TimeFilterPeriod.CURRENT,
        duration: step ? duration.multiply(Math.abs(step)) : duration
    });
}
function readStringFilterClause(selection, dimension, exclude) {
    const action = expressionAction(selection);
    const { name: reference } = dimension;
    switch (action) {
        case SupportedAction.contains:
            return new filter_clause_1.StringFilterClause({
                reference,
                action: filter_clause_1.StringFilterAction.CONTAINS,
                values: immutable_1.Set.of(selection.expression.value),
                not: exclude
            });
        case SupportedAction.match:
            return new filter_clause_1.StringFilterClause({
                reference,
                action: filter_clause_1.StringFilterAction.MATCH,
                values: immutable_1.Set.of(selection.regexp),
                not: exclude
            });
        case SupportedAction.overlap:
        case undefined:
        default:
            return new filter_clause_1.StringFilterClause({
                reference,
                action: filter_clause_1.StringFilterAction.IN,
                values: immutable_1.Set(selection.expression.value.elements),
                not: exclude
            });
    }
}
function extractExclude(expression) {
    if (expression instanceof datareporter_plywood_1.NotExpression) {
        return { exclude: true, expression: expression.operand };
    }
    return { exclude: false, expression };
}
function expressionAction(expression) {
    if (expression instanceof datareporter_plywood_1.InExpression || expression instanceof datareporter_plywood_1.OverlapExpression || expression instanceof datareporter_plywood_1.ContainsExpression) {
        return expression.op;
    }
    if (expression instanceof datareporter_plywood_1.MatchExpression) {
        return SupportedAction.match;
    }
    throw new Error(`Unrecognized Supported Action for expression ${expression}`);
}
function convertFilterExpression(filter, dataCube) {
    const { expression, exclude } = extractExclude(filter);
    const dimension = dataCube.getDimensionByExpression(expression.operand);
    if (isBooleanFilterSelection(expression.expression)) {
        return readBooleanFilterClause(expression.expression, dimension, exclude);
    }
    else if (isNumberFilterSelection(expression.expression)) {
        return readNumberFilterClause(expression.expression, dimension, exclude);
    }
    else if (isFixedTimeRangeSelection(expression.expression)) {
        return readFixedTimeFilter(expression.expression, dimension);
    }
    else if (isRelativeTimeRangeSelection(expression.expression)) {
        return readRelativeTimeFilterClause(expression.expression, dimension);
    }
    else {
        return readStringFilterClause(expression, dimension, exclude);
    }
}
// Handle change in plywood internal representation around 0.14.0
function limitValue(limitAction) {
    return limitAction.value || limitAction.limit;
}
// Handle change in plywood internal representation around 0.14.0
function isTimeBucket(action) {
    return action.op === "timeBucket" || action.action === "timeBucket";
}
function createSort(sortAction, dataCube) {
    if (!sortAction)
        return null;
    const reference = sortAction.expression.name;
    const direction = sortAction.direction;
    if (dataCube.getDimension(sortAction.expression.name)) {
        return new sort_1.DimensionSort({ reference, direction });
    }
    return new sort_1.SeriesSort({ reference, direction });
}
function convertSplit(split, dataCube) {
    const { sortAction, limitAction, bucketAction } = split;
    const expression = datareporter_plywood_1.Expression.fromJS(split.expression);
    const dimension = dataCube.getDimensionByExpression(expression);
    const reference = dimension.name;
    const sort = createSort(sortAction, dataCube);
    const type = split_1.kindToType(dimension.kind);
    const limit = limitAction && limitValue(limitAction);
    const bucket = bucketAction && (isTimeBucket(bucketAction) ? chronoshift_1.Duration.fromJS(bucketAction.duration) : bucketAction.size);
    return new split_1.Split({ type, reference, sort, limit, bucket });
}
function splitJSConverter(splits, dataCube) {
    return splits.map(split => convertSplit(split, dataCube));
}
exports.default = splitJSConverter;
//# sourceMappingURL=view-definition-converter-2.js.map