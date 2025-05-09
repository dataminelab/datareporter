/*
 * Copyright 2017-2018 Allegro.pl
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

import { Duration, Timezone } from "chronoshift";
import * as d3 from "d3";
import { Dataset, PlywoodRange, Range } from "plywood";
import { Dimension } from "../../../../common/models/dimension/dimension";
import { Essence } from "../../../../common/models/essence/essence";
import { ContinuousDimensionKind } from "../../../../common/models/granularity/granularity";
import { Split } from "../../../../common/models/split/split";
import { Timekeeper } from "../../../../common/models/timekeeper/timekeeper";
import { union } from "../../../../common/utils/plywood/range";
import { toPlywoodRange } from "../../../utils/highlight-clause/highlight-clause";
import { ContinuousRange, ContinuousScale } from "./continuous-types";
import { getContinuousDimension, getContinuousSplit } from "./splits";
// This function is responsible for aligning d3 types with our domain types.
export function createContinuousScale(essence: Essence, domainRange: PlywoodRange, width: number): ContinuousScale {
  const continuousDimension = getContinuousDimension(essence);
  const kind = continuousDimension.kind as ContinuousDimensionKind;
  const range = [0, width];
  switch (kind) {
    case "number": {
      const domain = [domainRange.start, domainRange.end] as [number, number];
      return (d3.scaleLinear().clamp(true) as unknown as ContinuousScale).domain(domain).range(range);
    }
    case "time": {
      const domain = [domainRange.start, domainRange.end] as [Date, Date];
      return (d3.scaleTime().clamp(true) as unknown as ContinuousScale).domain(domain).range(range);
    }
  }
}

function includeMaxTimeBucket(filterRange: PlywoodRange, maxTime: Date, continuousSplit: Split, timezone: Timezone) {
  const continuousBucket = continuousSplit.bucket;
  /*
    Special treatment for realtime data:
    Max time could be inside last bucket of time filter.
  */
  if (maxTime && continuousBucket instanceof Duration) {
    const filterRangeEnd = filterRange.end as Date;
    const filterRangeEndFloored = continuousBucket.floor(filterRangeEnd, timezone);
    const filterRangeEndCeiled = continuousBucket.shift(filterRangeEndFloored, timezone);
    if (filterRangeEndFloored < maxTime && maxTime < filterRangeEndCeiled) {
      return Range.fromJS({ start: filterRange.start, end: filterRangeEndCeiled });
    }
  }
  return filterRange;
}

function getFilterRange(essence: Essence, timekeeper: Timekeeper): PlywoodRange | null {
  const continuousSplit = getContinuousSplit(essence);
  const effectiveFilter = essence.getEffectiveFilter(timekeeper);
  const continuousFilterClause = effectiveFilter.clauseForReference(continuousSplit.reference);
  if (!continuousFilterClause) return null;
  const filterRange = toPlywoodRange(continuousFilterClause);
  const maxTime = essence.dataCube.getMaxTime(timekeeper);
  return includeMaxTimeBucket(filterRange, maxTime, continuousSplit, essence.timezone);
}

function safeRangeSum(a: PlywoodRange | null, b: PlywoodRange | null): PlywoodRange {
  return (a && b) ? a.extend(b) : (a || b);
}

function getDatasetXRange(dataset: Dataset, continuousDimension: Dimension): PlywoodRange | null {
  const continuousDimensionKey = continuousDimension.name;
  const flatDataset = dataset.flatten()
    .data
    .map(datum => datum[continuousDimensionKey] as PlywoodRange);
  if (typeof flatDataset[0] === "object") {
    return flatDataset
      .reduce(safeRangeSum, null);
  } else if (typeof flatDataset[0] === "string") {
    // ["21-05-2022:HH:MM:SS", ...]
    //@ts-ignore
    var start = new Date(flatDataset[0]);
    //@ts-ignore
    var end = new Date(flatDataset[0]);
    flatDataset.map(datum => {
      let currentDate = new Date(datum.toString());
      if (currentDate < start) {
        start = currentDate;
      }
      if (currentDate > end) {
        end = currentDate;
      }
    });
    return Range.fromJS({ start: start, end: end });
  } else {
    return null;
  }
}

export function calculateXRange(essence: Essence, timekeeper: Timekeeper, dataset: Dataset): ContinuousRange | null {
  const continuousDimension = getContinuousDimension(essence);
  const filterRange = getFilterRange(essence, timekeeper);
  const datasetRange = getDatasetXRange(dataset, continuousDimension);
  return union(filterRange, datasetRange) as ContinuousRange;
}
