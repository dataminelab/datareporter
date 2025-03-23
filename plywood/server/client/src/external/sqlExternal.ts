/*
 * Copyright 2012-2015 Metamarkets Group Inc.
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

import { Transform } from 'readable-stream';
import { Attributes } from '../datatypes/attributeInfo';
import { SQLDialect } from '../dialect/baseDialect';
import { DruidDialect } from '../dialect/druidDialect';
import {
  ApplyExpression,
  Expression,
  FilterExpression,
  SortExpression,
  SplitExpression,
  YearOverYearExpression,
  LiteralExpression,
} from '../expressions/index';
import { External, ExternalJS, ExternalValue, Inflater, QueryAndPostTransform } from './baseExternal';
import { PlywoodRequester } from 'plywood-base-api';

function getSplitInflaters(split: SplitExpression): Inflater[] {
  return split.mapSplits((label, splitExpression) => {
    let simpleInflater = External.getInteligentInflater(splitExpression, label);
    if (simpleInflater) return simpleInflater;
    return undefined;
  });
}

function getApplies(applies: ApplyExpression[], dialect: SQLDialect, timeRanges: any): ConcatArray<string> {
  let isDruidDialect = dialect instanceof DruidDialect;
  // lookup if timeOverTime is used
  var timeOverTimeFound = false;
  for (let i = 0; i < applies.length; i++) {
    let name = applies[i].name;
    if (name.startsWith("_delta__") || name.startsWith("_previous__")) {
      timeOverTimeFound = true;
      break;
    }
  }
  if (timeOverTimeFound && isDruidDialect) {
    return applies.map(apply => {
      var sql = apply.getSQL(dialect);
      if (apply.expression instanceof LiteralExpression) return sql;
      let sum = sql.split("AS")[0];
      let name = apply.name;
      let currElementStart = dialect.dateToSQLDateString(new Date(timeRanges.currElement.start));
      let currElementEnd = dialect.dateToSQLDateString(new Date(timeRanges.currElement.end));
      let prevElementStart = dialect.dateToSQLDateString(new Date(timeRanges.prevElement.start));
      let prevElementEnd = dialect.dateToSQLDateString(new Date(timeRanges.prevElement.end));
      if (name.startsWith("_previous__")) {
        sql = `IFNULL(${sum} FILTER(WHERE TIMESTAMP '${prevElementStart}' <= \"__time\" AND \"__time\" < TIMESTAMP '${prevElementEnd}'), 0) AS "${name}"`            
      } else if (name.startsWith("_delta__")) {
        let realSum = `SUM("${applies[0].name}")`
        sql = `(
          IFNULL(${realSum} FILTER(WHERE TIMESTAMP '${currElementStart}' <= \"__time\" AND \"__time\" < TIMESTAMP '${currElementEnd}'), 0) -
          IFNULL(${realSum} FILTER(WHERE TIMESTAMP '${prevElementStart}' <= \"__time\" AND \"__time\" < TIMESTAMP '${prevElementEnd}'), 0)
        ) AS "${name}"`
      } else {
        sql = `IFNULL(${sum} FILTER(WHERE TIMESTAMP '${currElementStart}' <= \"__time\" AND \"__time\" < TIMESTAMP '${currElementEnd}'), 0) AS "${name}"`            
      }
      return sql
    });
  }
  return applies.map(apply => apply.getSQL(dialect));
}

export abstract class SQLExternal extends External {
  static type = 'DATASET';

  static jsToValue(parameters: ExternalJS, requester: PlywoodRequester<any>): ExternalValue {
    let value: ExternalValue = External.jsToValue(parameters, requester);
    value.withQuery = parameters.withQuery;
    return value;
  }

  public withQuery?: string;

  public dialect: SQLDialect;

  constructor(parameters: ExternalValue, dialect: SQLDialect) {
    super(parameters, dummyObject);
    this.withQuery = parameters.withQuery;
    this.dialect = dialect;
  }

  public valueOf(): ExternalValue {
    let value: ExternalValue = super.valueOf();
    value.withQuery = this.withQuery;
    return value;
  }

  // -----------------

  public canHandleFilter(filter: FilterExpression): boolean {
    return true;
  }

  public canHandleSort(sort: SortExpression): boolean {
    return true;
  }

  protected capability(cap: string): boolean {
    if (cap === 'filter-on-attribute' || cap === 'shortcut-group-by') return true;
    return super.capability(cap);
  }

  // -----------------

  protected sqlToQuery(sql: string): any {
    return sql;
  }

  protected getFrom(): string {
    const { source, dialect, withQuery } = this;
    if (withQuery) {
      return `FROM __with__ AS t`;
    }

    const m = String(source).match(/^(\w+)\.(.+)$/);
    if (m) {
      return `FROM ${m[1]}.${dialect.escapeName(m[2])} AS t`;
    } else {
      return `FROM ${dialect.escapeName(source as string)} AS t`;
    }
  }

  public getQueryAndPostTransform(timeRanges:any=null): QueryAndPostTransform<string> {
    const { mode, applies, sort, limit, derivedAttributes, dialect, withQuery, engine } = this;
    let query = [];
    if (withQuery) {
      query.push(`WITH __with__ AS (${withQuery})\n`);
    }

    query.push('SELECT');

    let postTransform: Transform = null;
    let inflaters: Inflater[] = [];
    let keys: string[] = null;
    let zeroTotalApplies: ApplyExpression[] = null;
    let split;

    let from = this.getFrom();

    let filter = this.getQueryFilter();
    if (!filter.equals(Expression.TRUE)) {
      from += '\nWHERE ' + filter.getSQL(dialect);
    }

    let selectedAttributes = this.getSelectedAttributes();
    switch (mode) {
      case 'raw':
        selectedAttributes = selectedAttributes.map(a => a.dropOriginInfo());

        inflaters = selectedAttributes
          .map(attribute => {
            let { name, type } = attribute;
            switch (type) {
              case 'BOOLEAN':
                return External.booleanInflaterFactory(name);

              case 'TIME':
                return External.timeInflaterFactory(name);

              case 'SET/STRING':
                return External.setStringInflaterFactory(name);

              default:
                return null;
            }
          })
          .filter(Boolean);

        query.push(
          selectedAttributes
            .map(a => {
              let name = a.name;
              if (derivedAttributes[name]) {
                return Expression._.apply(name, derivedAttributes[name]).getSQL(dialect);
              } else {
                return dialect.escapeName(name);
              }
            })
            .join(', '),
          from,
        );
        break;
      case 'value':
        query.push(this.toValueApply().getSQL(dialect), from, dialect.constantGroupBy());
        postTransform = External.valuePostTransformFactory();
        break;
      case 'total':
        zeroTotalApplies = applies;
        inflaters = applies
          .map(apply => {
            let { name, expression } = apply;
            return External.getSimpleInflater(expression.type, name);
          })
          .filter(Boolean);

        keys = [];
        query.push(
          getApplies(applies, dialect, timeRanges).join(',\n'),
          from,
          dialect.constantGroupBy(),
        );
        break;
      case 'split':
        split = this.getQuerySplit();
        keys = split.mapSplits(name => name);
        query.push(
          split
            .getSelectSQL(dialect)
            .concat(getApplies(applies, dialect, timeRanges))
            .join(',\n'),
          from,
          'GROUP BY ' +
            (this.capability('shortcut-group-by')
              ? split.getShortGroupBySQL()
              : split.getGroupBySQL(dialect)
            ).join(','),
        );
        if (!this.havingFilter.equals(Expression.TRUE)) {
          query.push('HAVING ' + this.havingFilter.getSQL(dialect));
        }
        inflaters = getSplitInflaters(split);
        break;
      default:
        throw new Error(`can not get query for mode: ${mode}`);
    }
    const isYoyQuery = !(dialect instanceof DruidDialect) && YearOverYearExpression.isYoyQuery(query[1]);
    if (isYoyQuery) {
      let yoyExpression = new YearOverYearExpression(engine, query, mode);
      yoyExpression.setKeys(keys)
      if (split) {
        yoyExpression.setGroupBy(
          (this.capability('shortcut-group-by')
            ? split.getShortGroupBySQL()
            : split.getGroupBySQL(dialect)
          ).join(',')
        );
      }
      if (timeRanges) {
        yoyExpression.setTimeRanges(timeRanges);
      }
      yoyExpression.process();
      query = [
        yoyExpression.getQuery()
      ];
    }
    if (sort) {
      query.push(sort.getSQL(dialect));
    }
    if (limit) {
      query.push(limit.getSQL(dialect));
    }
    return {
      query: this.sqlToQuery(query.join('\n')),
      postTransform:
        postTransform ||
        External.postTransformFactory(inflaters, selectedAttributes, keys, zeroTotalApplies),
    };
  }

  protected abstract getIntrospectAttributes(): Promise<Attributes>;
}
