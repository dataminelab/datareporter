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
exports.EMPTY_SERIES = exports.SeriesList = void 0;
const immutable_1 = require("immutable");
const general_1 = require("../../utils/general/general");
const concreteArithmeticOperation_1 = require("../expression/concreteArithmeticOperation");
const expression_series_1 = require("../series/expression-series");
const measure_series_1 = require("../series/measure-series");
const series_1 = require("../series/series");
const defaultSeriesList = { series: immutable_1.List([]) };
//@ts-ignore
class SeriesList extends immutable_1.Record(defaultSeriesList) {
    static fromMeasureNames(names) {
        return new SeriesList({ series: immutable_1.List(names.map(reference => new measure_series_1.MeasureSeries({ reference }))) });
    }
    static fromMeasures(measures) {
        const series = immutable_1.List(measures.map(series_1.fromMeasure));
        return new SeriesList({ series });
    }
    static fromJS(seriesDefs, measures) {
        const series = immutable_1.List(seriesDefs.map(def => {
            const measure = measures.getMeasureByName(def.reference);
            return series_1.fromJS(def, measure);
        }));
        return new SeriesList({ series });
    }
    static fromSeries(series) {
        return new SeriesList({ series: immutable_1.List(series) });
    }
    static validSeries(series, measures) {
        //@ts-ignore
        if (series instanceof expression_series_1.ExpressionSeries && series.expression instanceof concreteArithmeticOperation_1.ArithmeticExpression) {
            //@ts-ignore
            return measures.hasMeasureByName(series.reference) && measures.hasMeasureByName(series.expression.reference);
        }
        //@ts-ignore
        return measures.hasMeasureByName(series.reference);
    }
    addSeries(newSeries) {
        //@ts-ignore
        const { series } = this;
        return this.insertByIndex(series.count(), newSeries);
    }
    removeSeries(series) {
        //@ts-ignore
        return this.updateSeries(list => list.filter(s => s.key() !== series.key()));
    }
    replaceSeries(original, newSeries) {
        //@ts-ignore
        return this.updateSeries(series => {
            const idx = series.findIndex(s => s.equals(original));
            if (idx === -1)
                throw new Error(`Couldn't replace series because couldn't find original: ${original}`);
            return series.set(idx, newSeries);
        });
    }
    replaceByIndex(index, replace) {
        //@ts-ignore
        const { series } = this;
        if (series.count() === index) {
            return this.insertByIndex(index, replace);
        }
        //@ts-ignore
        return this.updateSeries(series => {
            const newSeriesIndex = series.findIndex(split => split.equals(replace));
            if (newSeriesIndex === -1)
                return series.set(index, replace);
            const oldSplit = series.get(index);
            return series
                .set(index, replace)
                .set(newSeriesIndex, oldSplit);
        });
    }
    insertByIndex(index, insert) {
        //@ts-ignore
        return this.updateSeries(list => 
        //@ts-ignore
        list
            .insert(index, insert)
            .filterNot((series, idx) => series.equals(insert) && idx !== index));
    }
    hasMeasureSeries(reference) {
        const series = this.getSeries(reference);
        return series && series instanceof measure_series_1.MeasureSeries;
    }
    hasMeasure({ name }) {
        return this.hasMeasureSeries(name);
    }
    getSeries(reference) {
        //@ts-ignore
        return this.series.find(series => series.reference === reference);
    }
    constrainToMeasures(measures) {
        //@ts-ignore
        return this.updateSeries(list => list.filter(series => SeriesList.validSeries(series, measures)));
    }
    count() {
        //@ts-ignore
        return this.series.count();
    }
    isEmpty() {
        //@ts-ignore
        return this.series.isEmpty();
    }
    updateSeries(updater) {
        return this.update("series", updater);
    }
    hasSeries(series) {
        //@ts-ignore
        return this.series.find(s => s.equals(series)) !== undefined;
    }
    hasSeriesWithKey(key) {
        return general_1.isTruthy(this.getSeriesWithKey(key));
    }
    getSeriesWithKey(key) {
        //@ts-ignore
        return this.series.find(series => series.key() === key);
    }
    takeFirst() {
        //@ts-ignore
        return this.updateSeries(series => series.take(1));
    }
    getExpressionSeriesFor(reference) {
        //@ts-ignore
        return this.series.filter(series => series.reference === reference && series instanceof expression_series_1.ExpressionSeries);
    }
}
exports.SeriesList = SeriesList;
exports.EMPTY_SERIES = new SeriesList({ series: immutable_1.List([]) });
//# sourceMappingURL=series-list.js.map