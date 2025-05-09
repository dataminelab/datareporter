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

import { Duration } from "chronoshift";
import { Record } from "immutable";
// @ts-ignore
import { Expression, NumberBucketExpression, TimeBucketExpression } from "reporter-plywood";
import { isTruthy } from "../../utils/general/general";
import nullableEquals from "../../utils/immutable-utils/nullable-equals";
import { Dimension } from "../dimension/dimension";
import { DimensionSort, Sort } from "../sort/sort";
import { TimeShiftEnv, TimeShiftEnvType } from "../time-shift/time-shift-env";

export enum SplitType {
  number = "number",
  string = "string",
  time = "time"
}

export type Bucket = number | Duration;

export interface SplitValue {
  type: SplitType;
  reference: string;
  // TODO: capture better in type
  bucket: Bucket;
  sort: Sort;
  limit: number;
}

const defaultSplit: SplitValue = {
  type: SplitType.string,
  reference: null,
  bucket: null,
  sort: new DimensionSort({ reference: null }),
  limit: null
};

export function bucketToAction(bucket: Bucket): Expression {
  return bucket instanceof Duration
    ? new TimeBucketExpression({ duration: bucket })
    : new NumberBucketExpression({ size: bucket });
}

function applyTimeShift(type: SplitType, expression: Expression, env: TimeShiftEnv): Expression {
  if (env.type === TimeShiftEnvType.WITH_PREVIOUS && type === SplitType.time) {
    return env.currentFilter.then(expression).fallback(expression.timeShift(env.shift));
  }
  return expression;
}
//@ts-ignore
export function toExpression({ bucket, type }: Split, { expression }: Dimension, env: TimeShiftEnv): Expression {
  const expWithShift = applyTimeShift(type, expression, env);
  if (!bucket) return expWithShift;
  return expWithShift.performAction(bucketToAction(bucket));
}

export function kindToType(kind: string): SplitType {
  switch (kind) {
    case "time":
      return SplitType.time;
    case "number":
      return SplitType.number;
    default:
      return SplitType.string;
  }
}
//@ts-ignore
export class Split extends Record<SplitValue>(defaultSplit) {

  static fromDimension({ name, kind }: Dimension): Split {
    return new Split({ reference: name, type: kindToType(kind) });
  }

  public toString(): string {
    //@ts-ignore
    return `[SplitCombine: ${this.reference}]`;
  }

  public toKey(): string {
    //@ts-ignore
    return this.reference;
  }

  public changeBucket(bucket: Bucket): Split {
    //@ts-ignore
    return this.set("bucket", bucket);
  }

  public changeSort(sort: Sort): Split {
    //@ts-ignore
    return this.set("sort", sort);
  }

  public changeLimit(limit: number): Split {
    //@ts-ignore
    return this.set("limit", limit);
  }

  public getTitle(dimension: Dimension): string {
    return (dimension ? dimension.title : "?") + this.getBucketTitle();
  }

  public getBucketTitle(): string {
    //@ts-ignore
    const { bucket } = this;
    if (!isTruthy(bucket)) {
      return "";
    }
    if (bucket instanceof Duration) {
      return ` (${bucket.getDescription(true)})`;
    }
    return ` (by ${bucket})`;
  }

  public equals(other: any): boolean {
    //@ts-ignore
    if (this.type !== SplitType.time) return super.equals(other);
    return other instanceof Split &&
      //@ts-ignore
      this.type === other.type &&
      //@ts-ignore
      this.reference === other.reference &&
      //@ts-ignore
      this.sort.equals(other.sort) &&
      //@ts-ignore
      this.limit === other.limit &&
      //@ts-ignore
      nullableEquals(this.bucket as Duration, other.bucket as Duration);
  }
}
