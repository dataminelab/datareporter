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

import { PlywoodRequester } from 'plywood-base-api';
import { Transform } from 'readable-stream';

import { Attributes } from '../datatypes/attributeInfo';
import { SQLDialect } from '../dialect/baseDialect';
import { DruidDialect } from '../dialect/druidDialect';
import {
  ApplyExpression,
  Expression,
  FilterExpression,
  LiteralExpression,
  SortExpression,
  SplitExpression,
  YearOverYearExpression,
} from '../expressions';

import {
  External,
  ExternalJS,
  ExternalValue,
  Inflater,
  IntrospectionDepth,
  QueryAndPostTransform,
} from './baseExternal';

function getSplitInflaters(split: SplitExpression): Inflater[] {
  return split.mapSplits((label, splitExpression) => {
    const simpleInflater = External.getIntelligentInflater(splitExpression, label);
    if (simpleInflater) return simpleInflater;
    return undefined;
  });
}

function getApplies(applies: ApplyExpression[], dialect: SQLDialect, timeRanges: any): ConcatArray<string> {
  const isDruidDialect = dialect instanceof DruidDialect;
  // lookup if timeOverTime is used
  let timeOverTimeFound = false;
  for (let i = 0; i < applies.length; i++) {
    const name = applies[i].name;
    if (name.startsWith("_delta__") || name.startsWith("_previous__")) {
      timeOverTimeFound = true;
      break;
    }
  }
  if (timeOverTimeFound && isDruidDialect) {
    return applies.map(apply => {
      let sql = apply.getSQL(dialect);
      if (apply.expression instanceof LiteralExpression) return sql;
      const sum = sql.split("AS")[0];
      const name = apply.name;
      const currElementStart = dialect.dateToSQLDateString(new Date(timeRanges.currElement.start));
      const currElementEnd = dialect.dateToSQLDateString(new Date(timeRanges.currElement.end));
      const prevElementStart = dialect.dateToSQLDateString(new Date(timeRanges.prevElement.start));
      const prevElementEnd = dialect.dateToSQLDateString(new Date(timeRanges.prevElement.end));
      if (name.startsWith("_previous__")) {
        sql = `IFNULL(${sum} FILTER(WHERE TIMESTAMP '${prevElementStart}' <= \"__time\" AND \"__time\" < TIMESTAMP '${prevElementEnd}'), 0) AS "${name}"`            
      } else if (name.startsWith("_delta__")) {
        const realSum = `SUM("${applies[0].name}")`
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
    const value: ExternalValue = External.jsToValue(parameters, requester);
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
    const value: ExternalValue = super.valueOf();
    value.withQuery = this.withQuery;
    return value;
  }

  // -----------------

  public canHandleFilter(_filter: FilterExpression): boolean {
    return true;
  }

  public canHandleSort(_sort: SortExpression): boolean {
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

    return `FROM ${dialect.escapeName(source as string)} AS t`;
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
    let split: SplitExpression | null = null;

    let from = this.getFrom();

    const filter = this.getQueryFilter();
    if (!filter.equals(Expression.TRUE)) {
      from += '\nWHERE ' + filter.getSQL(dialect);
    }
    console.log("mode", mode, "maybe add year over year into the mod?")

    let selectedAttributes = this.getSelectedAttributes();
    switch (mode) {
      case 'raw':
        selectedAttributes = selectedAttributes.map(a => a.dropOriginInfo());

        inflaters = selectedAttributes
          .map(attribute => {
            const { name, type } = attribute;
            switch (type) {
              case 'BOOLEAN':
                return External.booleanInflaterFactory(name);

              case 'TIME':
                return External.timeInflaterFactory(name);

              case 'IP':
                return External.ipInflaterFactory(name);

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
              const name = a.name;
              if (derivedAttributes[name]) {
                return Expression._.apply(name, derivedAttributes[name]).getSQL(dialect);
              } else {
                return dialect.escapeName(name);
              }
            })
            .join(', '),
          from,
        );
        // if (sort) {
        //   query.push(sort.getSQL(dialect));
        // }
        // if (limit) {
        //   query.push(limit.getSQL(dialect));
        // }
        break;

      case 'value':
        query.push(this.toValueApply().getSQL(dialect), from, dialect.emptyGroupBy());
        postTransform = External.valuePostTransformFactory();
        break;

      case 'total':
        zeroTotalApplies = applies;
        inflaters = applies
          .map(apply => {
            const { name, expression } = apply;
            return External.getSimpleInflater(expression.type, name);
          })
          .filter(Boolean);

        keys = [];
        query.push(
          getApplies(applies, dialect, timeRanges).join(',\n'),
          from,
          dialect.emptyGroupBy(),
        );
        break;

      case 'split': {
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
        // if (sort) {
        //   query.push(sort.getSQL(dialect));
        // }
        // if (limit) {
        //   query.push(limit.getSQL(dialect));
        // }
        inflaters = getSplitInflaters(split);
        break;
      }

      default:
        throw new Error(`can not get query for mode: ${mode}`);
    }
    const isYoyQuery = !(dialect instanceof DruidDialect) && YearOverYearExpression.isYoyQuery(query[1]);
    if (isYoyQuery) {
      const yoyExpression = new YearOverYearExpression(engine, query, mode);
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

  protected abstract getIntrospectAttributes(depth: IntrospectionDepth): Promise<Attributes>;
}
