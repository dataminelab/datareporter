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

import { Timezone } from "chronoshift";
import { List, Record, Set } from "immutable";
import { Unary } from "../../utils/functional/functional";
import { Dimension } from "../dimension/dimension";
import { Dimensions } from "../dimension/dimensions";
import { FixedTimeFilterClause, NumberFilterClause } from "../filter-clause/filter-clause";
import { Filter } from "../filter/filter";
import { getBestBucketUnitForRange, getDefaultGranularityForKind } from "../granularity/granularity";
import { SeriesList } from "../series-list/series-list";
import { DimensionSort, isSortEmpty, Sort, SortType } from "../sort/sort";
import { Split } from "../split/split";
import { Timekeeper } from "../timekeeper/timekeeper";

export interface SplitsValue {
  splits: List<Split>;
}

const defaultSplits: SplitsValue = { splits: List([]) };
//@ts-ignore
export class Splits extends Record<SplitsValue>(defaultSplits) {

  static fromSplit(split: Split): Splits {
    return new Splits({ splits: List([split]) });
  }

  static fromSplits(splits: Split[]): Splits {
    return new Splits({ splits: List(splits) });
  }

  static fromDimensions(dimensions: List<Dimension>): Splits {
    const splits = dimensions.map(dimension => Split.fromDimension(dimension));
    return new Splits({ splits });
  }

  public toString() {
    //@ts-ignore
    return this.splits.map(split => split.toString()).join(",");
  }

  public replaceByIndex(index: number, replace: Split): Splits {
    //@ts-ignore
    const { splits } = this;
    if (splits.count() === index) {
      return this.insertByIndex(index, replace);
    }
    //@ts-ignore
    return this.updateSplits(splits => {
      const newSplitIndex = splits.findIndex(split => split.equals(replace));
      if (newSplitIndex === -1) return splits.set(index, replace);
      const oldSplit = splits.get(index);
      return splits
        .set(index, replace)
        .set(newSplitIndex, oldSplit);
    });
  }

  public insertByIndex(index: number, insert: Split): Splits {
    //@ts-ignore
    return this.updateSplits(splits =>
      //@ts-ignore
      splits
        .insert(index, insert)
        .filterNot((split, idx) => split.equals(insert) && idx !== index));
  }

  public addSplit(split: Split): Splits {
    //@ts-ignore
    const { splits } = this;
    return this.insertByIndex(splits.count(), split);
  }

  public removeSplit(split: Split): Splits {
    //@ts-ignore
    return this.updateSplits(splits => splits.filter(s => s.reference !== split.reference));
  }

  public changeSort(sort: Sort): Splits {
    //@ts-ignore
    return this.updateSplits(splits => splits.map(s => s.changeSort(sort)));
  }

  public setSortToDimension(): Splits {
    //@ts-ignore
    return this.updateSplits(splits =>
      //@ts-ignore
      splits.map(split =>
        //@ts-ignore
        split.changeSort(new DimensionSort({ reference: split.reference }))));
  }

  public length(): number {
    //@ts-ignore
    return this.splits.count();
  }

  public getSplit(index: number): Split {
    //@ts-ignore
    return this.splits.get(index);
  }

  public findSplitForDimension({ name }: Dimension): Split {
    //@ts-ignore
    return this.splits.find(s => s.reference === name);
  }

  public hasSplitOn(dimension: Dimension): boolean {
    return Boolean(this.findSplitForDimension(dimension));
  }

  public replace(search: Split, replace: Split): Splits {
    //@ts-ignore
    return this.updateSplits(splits => splits.map(s => s.equals(search) ? replace : s));
  }

  public removeBucketingFrom(references: Set<string>) {
    //@ts-ignore
    return this.updateSplits(splits => splits.map(split => {
      //@ts-ignore
      if (!split.bucket || !references.has(split.reference)) return split;
      return split.changeBucket(null);
    }));
  }

  public updateWithFilter(filter: Filter, dimensions: Dimensions): Splits {
    const specificFilter = filter.getSpecificFilter(Timekeeper.globalNow(), Timekeeper.globalNow(), Timezone.UTC);
    //@ts-ignore
    return this.updateSplits(splits => splits.map(split => {
      //@ts-ignore
      const { bucket, reference } = split;
      if (bucket) return split;

      const splitDimension = dimensions.getDimensionByName(reference);
      const splitKind = splitDimension.kind;
      if (!splitDimension || !(splitKind === "time" || splitKind === "number") || !splitDimension.canBucketByDefault()) {
        return split;
      }
      if (splitKind === "time") {
        //@ts-ignore
        const clause = specificFilter.clauses.find(clause => clause instanceof FixedTimeFilterClause) as FixedTimeFilterClause;
        return split.changeBucket(clause
          //@ts-ignore
          ? getBestBucketUnitForRange(clause.values.first(), false, splitDimension.bucketedBy, splitDimension.granularities)
          : getDefaultGranularityForKind("time", splitDimension.bucketedBy, splitDimension.granularities)
        );

      } else if (splitKind === "number") {
        //@ts-ignore
        const clause = specificFilter.clauses.find(clause => clause instanceof NumberFilterClause) as NumberFilterClause;
        return split.changeBucket(clause
          //@ts-ignore
          ? getBestBucketUnitForRange(clause.values.first(), false, splitDimension.bucketedBy, splitDimension.granularities)
          : getDefaultGranularityForKind("number", splitDimension.bucketedBy, splitDimension.granularities)
        );

      }


      throw new Error("unknown extent type");
    }));
  }

  public constrainToDimensionsAndSeries(dimensions: Dimensions, series: SeriesList): Splits {
    function validSplit(split: Split): boolean {
      //@ts-ignore
      if (!dimensions.getDimensionByName(split.reference)) return false;
      //@ts-ignore
      if (isSortEmpty(split.sort)) return true;
      //@ts-ignore
      const sortRef = split.sort.reference;
      //@ts-ignore
      return dimensions.containsDimensionWithName(sortRef) || series.hasSeriesWithKey(sortRef);
    }

    //@ts-ignore
    return this.updateSplits(splits => splits.filter(validSplit));
  }

  public changeSortIfOnMeasure(fromMeasure: string, toMeasure: string): Splits {
    //@ts-ignore
    return this.updateSplits(splits => splits.map(split => {
      const { sort } = split;
      //@ts-ignore
      if (!sort || sort.reference !== fromMeasure) return split;
      return split.setIn(["sort", "reference"], toMeasure);
    }));
  }

  public getCommonSort(): Sort {
    //@ts-ignore
    const { splits } = this;
    if (splits.count() === 0) return null;
    const commonSort = splits.get(0).sort;
    return splits.every(({ sort }) => sort.equals(commonSort)) ? commonSort : null;
  }

  private updateSplits(updater: Unary<List<Split>, List<Split>>) {
    return this.update("splits", updater);
  }

  public slice(from: number, to?: number) {
    //@ts-ignore
    return this.updateSplits(splits => splits.slice(from, to));
  }
}

export const EMPTY_SPLITS = new Splits({ splits: List([]) });
