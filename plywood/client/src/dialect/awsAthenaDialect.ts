import { Duration, Timezone } from 'chronoshift';
import { PlyType, PlyTypeSimple } from '../types';
import { SQLDialect } from './baseDialect';

export class AwsAthenaDialect extends SQLDialect {
  static TIME_BUCKETING: Record<string, string> = {
    PT1S: '%Y-%m-%d %H:%i:%SZ',
    PT1M: '%Y-%m-%d %H:%i:00Z',
    PT1H: '%Y-%m-%d %H:00:00Z',
    P1D: '%Y-%m-%d 00:00:00Z',
    P1M: '%Y-%m-01 00:00:00Z',
    P1Y: '%Y-01-01 00:00:00Z',
    P1W: '%Y-%m-%d 00:00:00Z',
    P3M: '%Y-%m-%d 00:00:00Z',
  };

  // Format: {fromType: {toType: 'expression'}}
  static CAST_TO_FUNCTION: Record<string, Record<string, string>> = {
    TIME: {
      NUMBER: 'FROM_UNIXTIME($$)',
    },
    NUMBER: {
      TIME: 'cast(to_unixtime($$)*1000 as BIGINT)',
      STRING: 'cast($$ as BIGINT)',
    },
    STRING: {
      NUMBER: 'cast($$ as varchar)',
    },
  };

  static TIME_PART_TO_FUNCTION: Record<string, string> = {
    SECOND_OF_MINUTE: "extract(SECOND from $$)",
    SECOND_OF_HOUR: "(extract(MINUTE from $$)*60+extract(SECOND from $$))",
    SECOND_OF_DAY: "((extract(HOUR from $$)*60+extract(MINUTE from $$))*60+extract(SECOND from $$))",
    SECOND_OF_WEEK:
      "(((mod((extract(DAY_OF_WEEK from $$)+6), 7)*24)+extract(HOUR from $$)*60+extract(MINUTE from $$))*60 + extract(SECOND from $$))",
    SECOND_OF_MONTH:
      "((((extract(DAY from $$)-1)*24)+extract(HOUR from $$)*60+extract(MINUTE from $$))*60+extract(SECOND from $$))",
    SECOND_OF_YEAR:
      "((((extract(DAY_OF_YEAR from $$)-1)*24)+extract(HOUR from $$)*60+extract(MINUTE from $$))*60+extract(SECOND from $$))",
    //
    MINUTE_OF_HOUR: "extract(MINUTE from $$)",
    MINUTE_OF_DAY: "extract(HOUR from $$)*60+extract(MINUTE from $$)",
    MINUTE_OF_WEEK:
      "(mod(extract(DAY_OF_WEEK from $$)+6, 7)*24)+extract(HOUR from $$)*60+extract(MINUTE from $$)",
    MINUTE_OF_MONTH: "((extract(DAY from $$)-1)*24)+extract(HOUR from $$)*60+extract(MINUTE from $$)",
    MINUTE_OF_YEAR: "((extract(DAY_OF_YEAR from $$)-1)*24)+extract(HOUR from $$)*60+extract(MINUTE from $$)",
    //
    HOUR_OF_DAY: "extract(HOUR from $$)",
    HOUR_OF_WEEK: "(mod((extract(DAY_OF_WEEK from $$) + 6), 7) * 24 + extract(HOUR from $$))",
    HOUR_OF_MONTH: "((extract(DAY from $$)-1)*24+extract(HOUR from $$))",
    HOUR_OF_YEAR: "((extract(DAY_OF_YEAR from $$)-1)*24+extract(HOUR from $$))",
    //
    DAY_OF_WEEK: "extract(DAY_OF_WEEK from $$)",
    DAY_OF_MONTH: "extract(DAY from $$)",
    DAY_OF_YEAR: "extract(DAY_OF_YEAR from $$)",
    //
    WEEK_OF_YEAR: "EXTRACT(week from $$)",
    //
    MONTH_OF_YEAR: "EXTRACT(month from $$)",
    YEAR: "EXTRACT(year from $$)",
  };

  public constantGroupBy(): string {
    return "";
  }

  public castExpression(inputType: PlyType, operand: string, cast: string): string {
    let castFunction = AwsAthenaDialect.CAST_TO_FUNCTION[cast][inputType];
    if (!castFunction)
      throw new Error(`unsupported cast from ${inputType} to ${cast} in BigQuery dialect`);
    return castFunction.replace(/\$\$/g, operand);
  }

  public extractExpression(operand: string, regexp: string): string {
    return `regexp_extract(${operand}, '${regexp}'))`;
  }

  public indexOfExpression(str: string, substr: string): string {
    // todo: need quotes?
    return `STRPOS(${str}, ${substr}) - 1`;
  }

  public timeBucketExpression(operand: string, duration: Duration, timezone: Timezone): string {
    return this.timeFloorExpression(operand, duration, timezone);
  }

  public timeFloorExpression(operand: string, duration: Duration, timezone: Timezone): string {
    let bucketFormat = AwsAthenaDialect.TIME_BUCKETING[duration.toString()];
    if (!bucketFormat) throw new Error(`unsupported duration '${duration}'`);
    if (duration.toString() == "P1W") {
      return this.walltimeToUTC(
        `DATE_FORMAT( DATE_TRUNC('week', ${this.utcToWalltime(operand, timezone)}), '${bucketFormat}')`, timezone,
      );
    } else if (duration.toString() == "P3M") {
      return this.walltimeToUTC(
        `DATE_FORMAT( DATE_TRUNC('quarter', ${this.utcToWalltime(operand, timezone)}), '${bucketFormat}')`, timezone,
      );
    } else {
      return this.walltimeToUTC(
        `DATE_FORMAT(${this.utcToWalltime(operand, timezone)}, '${bucketFormat}')`,
        timezone,
      );
    }
  }

  public timePartExpression(operand: string, part: string, timezone: Timezone): string {
    let timePartFunction = AwsAthenaDialect.TIME_PART_TO_FUNCTION[part];
    if (!timePartFunction) throw new Error(`unsupported part ${part} in BigQuery dialect`);
    return timePartFunction.replace(/\$\$/g, this.utcToWalltime(operand, timezone));
  }

  public regexpExpression(expression: string, regexp: string): string {
    // https://prestodb.io/docs/0.217/functions/regexp.html
    return `regexp_like(${expression}, ${this.escapeLiteral(regexp)})`;
  }

  public containsExpression(a: string, b: string): string {
    return `STRPOS(${a},${b})>0`;
  }


  public concatExpression(a: string, b: string): string {
    return `CONCAT(${a},${b})`;
  }

  public isNotDistinctFromExpression(a: string, b: string): string {
    const nullConst = this.nullConstant();
    if (a === nullConst) return `${b} IS ${nullConst}`;
    if (b === nullConst) return `${a} IS ${nullConst}`;
    return `(${a}=${b})`;
  }

  timeShiftExpression(operand: string, duration: Duration, step: int, timezone: Timezone): string {
    if (step === 0) return operand;

    let mult = step < 0 ? '-1 * ' : '';
    let spans = duration.multiply(Math.abs(step)).valueOf();
    if (spans.week) {
      operand = `DATE_ADD('week', ${mult}${spans.week}, ${operand})`;
    }
    if (spans.month) {
      operand = `DATE_ADD('MONTH', ${mult}${spans.month}, ${operand})`;
    }
    if (spans.year) {
      operand = `DATE_ADD('YEAR', ${mult}${spans.year}, ${operand})`;
    }
    if (spans.day) {
      operand = `DATE_ADD('DAY', ${mult}${spans.day}, ${operand})`;
    }
    if (spans.hour) {
      operand = `DATE_ADD('hour', ${mult}${spans.hour}, ${operand})`;
    }
    if (spans.minute) {
      operand = `DATE_ADD('MINUTE', ${mult}${spans.minute}, ${operand})`;
    }
    if (spans.second) {
      operand = `DATE_ADD('second', ${mult}${spans.second}, ${operand})`;
    }
    return operand;
  }

  timeToSQL(date: Date): string {
    // format: '"2021-01-26T04:59:59.245Z"'
    // see https://prestodb.io/docs/0.217/functions/datetime.html
    if (!date) return this.nullConstant();
    return `from_iso8601_timestamp('${date.toISOString()}')`;
  }

  public utcToWalltime(operand: string, timezone: Timezone): string {
    // todo figure out timezone witchcraft
    return operand;
  }

  public walltimeToUTC(operand: string, timezone: Timezone): string {
    // todo figure out timezone witchcraft
    return operand;
  }
}
