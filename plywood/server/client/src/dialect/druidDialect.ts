/*
 * Copyright 2015-2020 Imply Data, Inc.
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

import { Duration, Timezone } from 'chronoshift';
import { PlyType } from '../types';
import { SQLDialect } from './baseDialect';

export class DruidDialect extends SQLDialect {
  static TIME_BUCKETING: Record<string, string> = {
    PT1S: "'yyyy-MM-dd HH:mm:ss''Z'",
    PT1M: "'yyyy-MM-dd HH:mm:00''Z'",
    PT1H: "'yyyy-MM-dd HH:00:00''Z'", // '%Y-%m-%d %H:00:00Z',
    P1D: "'yyyy-MM-dd 00:00:00''Z'", // '%Y-%m-%d 00:00:00Z',
    P1M: "'yyyy-MM-01 00:00:00''Z'", // '%Y-%m-01 00:00:00Z',
    P1Y: "'yyyy-01-01 00:00:00''Z'", // '%Y-01-01 00:00:00Z',
    P1W: "'yyyy-MM-dd 00:00:00''Z'", // '%Y-%m-%d 00:00:00Z',
    P3M: "'yyyy-MM-dd 00:00:00''Z'", // '%Y-%m-%d 00:00:00Z',
  };

  static TIME_PART_TO_FUNCTION: Record<string, string> = {
    SECOND_OF_MINUTE: "TIME_EXTRACT($$,'SECOND',##)",
    SECOND_OF_HOUR: "(TIME_EXTRACT($$,'MINUTE',##)*60+TIME_EXTRACT($$,'SECOND',##))",
    SECOND_OF_DAY:
      "((TIME_EXTRACT($$,'HOUR',##)*60+TIME_EXTRACT($$,'MINUTE',##))*60+TIME_EXTRACT($$,'SECOND',##))",
    SECOND_OF_WEEK:
      "(((MOD(CAST((TIME_EXTRACT($$,'DOW',##)+6) AS int),7)*24)+TIME_EXTRACT($$,'HOUR',##)*60+TIME_EXTRACT($$,'MINUTE',##))*60+TIME_EXTRACT($$,'SECOND',##))",
    SECOND_OF_MONTH:
      "((((TIME_EXTRACT($$,'DAY',##)-1)*24)+TIME_EXTRACT($$,'HOUR',##)*60+TIME_EXTRACT($$,'MINUTE',##))*60+TIME_EXTRACT($$,'SECOND',##))",
    SECOND_OF_YEAR:
      "((((TIME_EXTRACT($$,'DOY',##)-1)*24)+TIME_EXTRACT($$,'HOUR',##)*60+TIME_EXTRACT($$,'MINUTE',##))*60+TIME_EXTRACT($$,'SECOND',##))",

    MINUTE_OF_HOUR: "TIME_EXTRACT($$,'MINUTE',##)",
    MINUTE_OF_DAY: "TIME_EXTRACT($$,'HOUR',##)*60+TIME_EXTRACT($$,'MINUTE',##)",
    MINUTE_OF_WEEK:
      "(MOD(CAST((TIME_EXTRACT($$,'DOW',##)+6) AS int),7)*24)+TIME_EXTRACT($$,'HOUR',##)*60+TIME_EXTRACT($$,'MINUTE',##)",
    MINUTE_OF_MONTH:
      "((TIME_EXTRACT($$,'DAY',##)-1)*24)+TIME_EXTRACT($$,'HOUR',##)*60+TIME_EXTRACT($$,'MINUTE',##)",
    MINUTE_OF_YEAR:
      "((TIME_EXTRACT($$,'DOY',##)-1)*24)+TIME_EXTRACT($$,'HOUR',##)*60+TIME_EXTRACT($$,'MINUTE',##)",

    HOUR_OF_DAY: "TIME_EXTRACT($$,'HOUR',##)",
    HOUR_OF_WEEK:
      "(MOD(CAST((TIME_EXTRACT($$,'DOW',##)+6) AS int),7)*24+TIME_EXTRACT($$,'HOUR',##))",
    HOUR_OF_MONTH: "((TIME_EXTRACT($$,'DAY',##)-1)*24+TIME_EXTRACT($$,'HOUR',##))",
    HOUR_OF_YEAR: "((TIME_EXTRACT($$,'DOY',##)-1)*24+TIME_EXTRACT($$,'HOUR',##))",

    DAY_OF_WEEK: "MOD(CAST((TIME_EXTRACT($$,'DOW',##)+6) AS int),7)+1",
    DAY_OF_MONTH: "TIME_EXTRACT($$,'DAY',##)",
    DAY_OF_YEAR: "TIME_EXTRACT($$,'DOY',##)",

    //WEEK_OF_MONTH: ???,
    WEEK_OF_YEAR: "TIME_EXTRACT($$,'WEEK',##)",

    MONTH_OF_YEAR: "TIME_EXTRACT($$,'MONTH',##)",
    YEAR: "TIME_EXTRACT($$,'YEAR',##)",
  };

  static CAST_TO_FUNCTION: Record<string, Record<string, string>> = {
    TIME: {
      NUMBER: 'MILLIS_TO_TIMESTAMP(CAST($$ AS BIGINT))',
    },
    NUMBER: {
      TIME: 'CAST($$ AS BIGINT)',
      STRING: 'CAST($$ AS FLOAT)',
    },
    STRING: {
      NUMBER: 'CAST($$ AS VARCHAR)',
    },
  };

  constructor() {
    super();
  }

  public dateToSQLDateString(date: Date): string {
    return date
      .toISOString()
      .replace('T', ' ')
      .replace('Z', '')
      .replace(/\.000$/, '');
  }

  public floatDivision(numerator: string, denominator: string): string {
    return `(${numerator}*1.0/${denominator})`;
  }

  public constantGroupBy(): string {
    return "GROUP BY ''";
  }

  public timeToSQL(date: Date): string {
    if (!date) return this.nullConstant();
    return `TIMESTAMP '${this.dateToSQLDateString(date)}'`;
  }

  public concatExpression(a: string, b: string): string {
    return `(${a}||${b})`;
  }

  public containsExpression(a: string, b: string): string {
    return `POSITION(${a} IN ${b})>0`;
  }

  public substrExpression(a: string, position: number, length: number): string {
    return `SUBSTRING(${a},${position + 1},${length})`;
  }

  public isNotDistinctFromExpression(a: string, b: string): string {
    const nullConst = this.nullConstant();
    if (a === nullConst) return `${b} IS ${nullConst}`;
    if (b === nullConst) return `${a} IS ${nullConst}`;
    return `(${a}=${b})`;
  }

  public castExpression(inputType: PlyType, operand: string, cast: string): string {
    let castFunction = DruidDialect.CAST_TO_FUNCTION[cast][inputType];
    if (!castFunction)
      throw new Error(`unsupported cast from ${inputType} to ${cast} in Druid dialect`);
    return castFunction.replace(/\$\$/g, operand);
  }

  private operandAsTimestamp(operand: string): string {
    return operand.includes('__time') ? operand : `TIME_PARSE(${operand})`;
  }
  /*
    This query returns "Year or Year" and "Quarter or Year" and "Month or Year" and "Week or Year" and ...
    */
  public timeFLoorOverTimeExpression(operand: string, duration: Duration, timezone: Timezone): string {
    // TODO: implement
    const timeFloor = this.timeFloorExpression(operand, duration, timezone);
    const timeFloorPrev = this.timeFloorExpression(
      this.timeShiftExpression(operand, duration, -1, timezone),
      duration,
      timezone,
    );
    return `SUM(${operand}) FILTER(WHERE ${timeFloor} <= "__time" AND "__time" < ${timeFloorPrev})`;
  }

  public timeFloorExpression(operand: string, duration: Duration, timezone: Timezone): string {
    let bucketFormat = DruidDialect.TIME_BUCKETING[duration.toString()];
    if (!bucketFormat) throw new Error(`unsupported duration '${duration}'`);
    return `TIME_FORMAT(TIME_FLOOR(${this.operandAsTimestamp(operand)}, ${this.escapeLiteral(
      duration.toString(),
    )}, NULL, ${this.escapeLiteral(timezone.toString())}), ${bucketFormat})`;
  }

  public timeBucketExpression(operand: string, duration: Duration, timezone: Timezone): string {
    return this.timeFloorExpression(operand, duration, timezone);
  }

  public timePartExpression(operand: string, part: string, timezone: Timezone): string {
    let timePartFunction = DruidDialect.TIME_PART_TO_FUNCTION[part];
    if (!timePartFunction) throw new Error(`unsupported part ${part} in Druid dialect`);
    return timePartFunction
      .replace(/\$\$/g, this.operandAsTimestamp(operand))
      .replace(/##/g, this.escapeLiteral(timezone.toString()));
  }

  public timeShiftExpression(
    operand: string,
    duration: Duration,
    step: int,
    timezone: Timezone,
  ): string {
    return `TIME_SHIFT(${this.operandAsTimestamp(operand)}, ${this.escapeLiteral(
      duration.toString(),
    )}, ${step}, ${this.escapeLiteral(timezone.toString())})`;
  }

  public extractExpression(operand: string, regexp: string): string {
    return `REGEXP_EXTRACT(${operand}, ${this.escapeLiteral(regexp)}, 1)`;
  }

  public regexpExpression(expression: string, regexp: string): string {
    return `REGEXP_LIKE(${expression}, ${this.escapeLiteral(regexp)})`;
  }

  public indexOfExpression(str: string, substr: string): string {
    return `POSITION(${substr} IN ${str}) - 1`;
  }

  public quantileExpression(str: string, quantile: string): string {
    return `APPROX_QUANTILE_DS(${str}, ${quantile})`;
  }

  public logExpression(base: string, operand: string): string {
    if (base === String(Math.E)) return `LN(${operand})`;
    if (base === '10') return `LOG10(${operand})`;
    return `LN(${operand})/LN(${base})`;
  }

  public lookupExpression(base: string, lookup: string): string {
    return `LOOKUP(${base}, ${this.escapeLiteral(lookup)})`;
  }
}
