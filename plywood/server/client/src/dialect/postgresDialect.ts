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

export class PostgresDialect extends SQLDialect {
  static TIME_BUCKETING: Record<string, string> = {
    PT1S: 'second',
    PT1M: 'minute',
    PT1H: 'hour',
    P1D: 'day',
    P1W: 'week',
    P1M: 'month',
    P3M: 'quarter',
    P1Y: 'year',
  };

  static TIME_PART_TO_FUNCTION: Record<string, string> = {
    SECOND_OF_MINUTE: "DATE_PART('second',$$)",
    SECOND_OF_HOUR: "(DATE_PART('minute',$$)*60+DATE_PART('second',$$))",
    SECOND_OF_DAY: "((DATE_PART('hour',$$)*60+DATE_PART('minute',$$))*60+DATE_PART('second',$$))",
    SECOND_OF_WEEK:
      "((((CAST((DATE_PART('dow',$$)+6) AS int)%7)*24)+DATE_PART('hour',$$)*60+DATE_PART('minute',$$))*60+DATE_PART('second',$$))",
    SECOND_OF_MONTH:
      "((((DATE_PART('day',$$)-1)*24)+DATE_PART('hour',$$)*60+DATE_PART('minute',$$))*60+DATE_PART('second',$$))",
    SECOND_OF_YEAR:
      "((((DATE_PART('doy',$$)-1)*24)+DATE_PART('hour',$$)*60+DATE_PART('minute',$$))*60+DATE_PART('second',$$))",

    MINUTE_OF_HOUR: "DATE_PART('minute',$$)",
    MINUTE_OF_DAY: "DATE_PART('hour',$$)*60+DATE_PART('minute',$$)",
    MINUTE_OF_WEEK:
      "((CAST((DATE_PART('dow',$$)+6) AS int)%7)*24)+DATE_PART('hour',$$)*60+DATE_PART('minute',$$)",
    MINUTE_OF_MONTH: "((DATE_PART('day',$$)-1)*24)+DATE_PART('hour',$$)*60+DATE_PART('minute',$$)",
    MINUTE_OF_YEAR: "((DATE_PART('doy',$$)-1)*24)+DATE_PART('hour',$$)*60+DATE_PART('minute',$$)",

    HOUR_OF_DAY: "DATE_PART('hour',$$)",
    HOUR_OF_WEEK: "((CAST((DATE_PART('dow',$$)+6) AS int)%7)*24+DATE_PART('hour',$$))",
    HOUR_OF_MONTH: "((DATE_PART('day',$$)-1)*24+DATE_PART('hour',$$))",
    HOUR_OF_YEAR: "((DATE_PART('doy',$$)-1)*24+DATE_PART('hour',$$))",

    DAY_OF_WEEK: "(CAST((DATE_PART('dow',$$)+6) AS int)%7)+1",
    DAY_OF_MONTH: "DATE_PART('day',$$)",
    DAY_OF_YEAR: "DATE_PART('doy',$$)",

    //WEEK_OF_MONTH: ???,
    WEEK_OF_YEAR: "DATE_PART('week',$$)",

    MONTH_OF_YEAR: "DATE_PART('month',$$)",
    YEAR: "DATE_PART('year',$$)",
  };

  static CAST_TO_FUNCTION: Record<string, Record<string, string>> = {
    TIME: {
      NUMBER: 'TO_TIMESTAMP($$::double precision / 1000)',
    },
    NUMBER: {
      TIME: 'EXTRACT(EPOCH FROM $$) * 1000',
      STRING: '$$::float',
    },
    STRING: {
      NUMBER: '$$::text',
    },
  };

  constructor() {
    super();
  }

  public constantGroupBy(): string {
    return "";
  }

  public timeToSQL(date: Date): string {
    if (!date) return this.nullConstant();
    return `TIMESTAMP '${this.dateToSQLDateString(date)}'`;
  }

  public stringArrayToSQL(_value: string[]): string {
    throw new Error('must implement');
  }

  public concatExpression(a: string, b: string): string {
    return `(${a}||${b})`;
  }

  public containsExpression(a: string, b: string): string {
    return `POSITION(${a} IN ${b})>0`;
  }

  public regexpExpression(expression: string, regexp: string): string {
    return `(${expression} ~ '${regexp}')`; // ToDo: escape this.regexp
  }

  public castExpression(inputType: PlyType, operand: string, cast: string): string {
    let castFunction = PostgresDialect.CAST_TO_FUNCTION[cast][inputType];
    if (!castFunction)
      throw new Error(`unsupported cast from ${inputType} to ${cast} in Postgres dialect`);
    return castFunction.replace(/\$\$/g, operand);
  }

  public utcToWalltime(operand: string, timezone: Timezone): string {
    if (timezone.isUTC()) return operand;
    return `(${operand} AT TIME ZONE 'UTC' AT TIME ZONE '${timezone}')`;
  }

  public walltimeToUTC(operand: string, timezone: Timezone): string {
    if (timezone.isUTC()) return operand;
    return `(${operand} AT TIME ZONE '${timezone}' AT TIME ZONE 'UTC')`;
  }

  public timeFloorExpression(operand: string, duration: Duration, timezone: Timezone): string {
    let bucketFormat = PostgresDialect.TIME_BUCKETING[duration.toString()];
    if (!bucketFormat) throw new Error(`unsupported duration '${duration}'`);
    return this.walltimeToUTC(
      `DATE_TRUNC('${bucketFormat}',${this.utcToWalltime(operand, timezone)})`,
      timezone,
    );
  }

  public timeBucketExpression(operand: string, duration: Duration, timezone: Timezone): string {
    return this.timeFloorExpression(operand, duration, timezone);
  }

  public timePartExpression(operand: string, part: string, timezone: Timezone): string {
    let timePartFunction = PostgresDialect.TIME_PART_TO_FUNCTION[part];
    if (!timePartFunction) throw new Error(`unsupported part ${part} in Postgres dialect`);
    return timePartFunction.replace(/\$\$/g, this.utcToWalltime(operand, timezone));
  }

  public timeShiftExpression(
    operand: string,
    duration: Duration,
    step: int,
    timezone: Timezone,
  ): string {
    if (step === 0) return operand;

    // https://dev.mysql.com/doc/refman/5.5/en/date-and-time-functions.html#function_date-add
    let sqlFn = step > 0 ? 'DATE_ADD(' : 'DATE_SUB(';
    let spans = duration.multiply(Math.abs(step)).valueOf();
    if (spans.week) {
      return sqlFn + operand + ', INTERVAL ' + String(spans.week) + ' WEEK)';
    }
    if (spans.year || spans.month) {
      let expr = String(spans.year || 0) + '-' + String(spans.month || 0);
      operand = sqlFn + operand + ", INTERVAL '" + expr + "' YEAR_MONTH)";
    }
    if (spans.day || spans.hour || spans.minute || spans.second) {
      let expr =
        String(spans.day || 0) +
        ' ' +
        [spans.hour || 0, spans.minute || 0, spans.second || 0].join(':');
      operand = sqlFn + operand + ", INTERVAL '" + expr + "' DAY_SECOND)";
    }
    return operand;
  }

  public extractExpression(operand: string, regexp: string): string {
    return `(SELECT (REGEXP_MATCHES(${operand}, '${regexp}'))[1])`;
  }

  public indexOfExpression(str: string, substr: string): string {
    return `POSITION(${substr} IN ${str}) - 1`;
  }
}
