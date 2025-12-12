/* eslint-disable no-async-promise-executor */

import { AttributeInfo } from "../datatypes/attributeInfo";
import { Dataset, Datum } from "../datatypes/dataset";
import { TimeRange } from "../datatypes/timeRange";
import {
  ChainableExpression,
  Expression,
  LiteralExpression,
  RefExpression,
} from "../expressions";
import {
  External,
  ExternalJS,
  ExternalValue,
  QueryAndPostTransform,
  TotalContainer,
  getSampleValue,
} from "./baseExternal";
import { PlywoodValue } from "../datatypes/index";


export interface JSONQuery {
  source: string;
  filter?: any;
  split?: any;
  applies?: any[];
  sort?: any;
  limit?: number;
  select?: any;
}

export interface JSONExternalJS extends ExternalJS {
  engine: "json";
  source: string;
  data?: any[];
}

export interface JSONExternalValue extends ExternalValue {
  engine: "json";
  source: string;
  data?: any[];
}

export class JSONExternal extends External {
  static engine = "json";
  static type = "DATASET";

  static fromJS(
    parameters: JSONExternalJS,
    requester: any = null,
  ): JSONExternal {
    const value = External.jsToValue(
      parameters,
      requester,
    ) as JSONExternalValue;
    value.engine = "json";

    if (parameters.source) value.source = parameters.source;
    if (parameters.data) value.data = parameters.data;

    return new JSONExternal(value);
  }

  public source: string;
  public data?: any[];
  private cachedData?: any[];

  constructor(parameters: JSONExternalValue) {
    super(parameters, dummyObject);
    this._ensureEngine("json");
    this.source = parameters.source;
    this.data = parameters.data;
    this.cachedData = parameters.data;
  }

  public canHandleFilter(filter: any): boolean {
    return true;
  }

  public canHandleSort(sort: any): boolean {
    return true;
  }

  public valueOf(): JSONExternalValue {
    const value = super.valueOf() as JSONExternalValue;
    value.engine = "json";
    value.source = this.source;
    if (this.data) value.data = this.data;
    return value;
  }

  public toJS(): JSONExternalJS {
    const js = super.toJS() as JSONExternalJS;
    js.engine = "json";
    js.source = this.source;
    if (this.data) js.data = this.data;
    return js;
  }

  protected getIntrospectAttributes(): Promise<AttributeInfo[]> {
    return new Promise(async resolve => {
      try {
        if (this.cachedData && this.cachedData.length > 0) {
          const sample = this.cachedData[0];
          resolve(this.inferAttributesFromSample(sample));
          return;
        }

        if (this.source) {
          try {
            const response = await fetch(this.source);
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
              this.cachedData = data;
              resolve(this.inferAttributesFromSample(data[0]));
              return;
            }
          } catch (e) {
            console.warn("Failed to fetch JSON data for introspection:", e);
          }
        }

        if (this.rawAttributes && this.rawAttributes.length > 0) {
          resolve(this.rawAttributes);
          return;
        }

        resolve([]);
      } catch (error) {
        console.error("Error in getIntrospectAttributes:", error);
        resolve([]);
      }
    });
  }

  private inferAttributesFromSample(sample: any): AttributeInfo[] {
    const attributes: AttributeInfo[] = [];

    for (const key of Object.keys(sample)) {
      const value = sample[key];
      let type = "STRING";

      if (typeof value === "number") {
        type = "NUMBER";
      } else if (typeof value === "boolean") {
        type = "BOOLEAN";
      } else if (value instanceof Date) {
        type = "TIME";
      } else if (typeof value === "string") {
        if (
          /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?/.test(value) &&
          !isNaN(Date.parse(value))
        ) {
          type = "TIME";
        }
      }

      attributes.push(
        AttributeInfo.fromJS({
          name: key,
          type: type as any,
        }),
      );
    }

    return attributes;
  }

  private static unwrapResult(result: any): any[] {
    if (result == null) {
      return [];
    }

    if (Array.isArray(result)) {
      return result;
    }

    if (typeof result === "string") {
      try {
        const parsed = JSON.parse(result);
        return JSONExternal.unwrapResult(parsed);
      } catch (e) {
        return [];
      }
    }

    if (
      typeof result === "object" &&
      result.data &&
      Array.isArray(result.data)
    ) {
      return result.data;
    }

    if (
      typeof result === "object" &&
      result.rows &&
      Array.isArray(result.rows)
    ) {
      return result.rows;
    }

    if (typeof result === "object") {
      return [result];
    }

    return [];
  }

  public getQueryAndPostTransform(): QueryAndPostTransform<JSONQuery> {
    const query: JSONQuery = {
      source: this.source,
    };

    if (
      this.filter &&
      !(this.filter instanceof LiteralExpression && this.filter.value === true)
    ) {
      query.filter = this.expressionToFilter(this.filter);
    }

    if (this.mode === "split" && this.split) {
      query.split = this.splitToQuery();
    }

    if (this.applies && this.applies.length > 0) {
      query.applies = this.applies.map(apply => ({
        name: apply.name,
        expression: this.expressionToApply(apply.expression),
      }));
    }

    if (this.sort) {
      query.sort = {
        expression: this.sort.expression.toString(),
        direction: this.sort.direction,
      };
    }

    if (this.limit) {
      query.limit =
        (this.limit as any).value ||
        (typeof this.limit === "number" ? this.limit : undefined);
    }

    if (this.mode === "raw" && this.select) {
      query.select = this.select;
    }

    const splitKeys: string[] = [];
    if (this.mode === "split" && this.split) {
      for (const key of this.split.keys) {
        splitKeys.push(key);
      }
    }

    const postTransform = (result: any): PlywoodValue => {
      const unwrappedData = JSONExternal.unwrapResult(result);
      const dataset = Dataset.fromJS(unwrappedData);

      if (splitKeys.length > 0) {
        (dataset as any).keys = splitKeys;
      }

      return dataset;
    };

    return {
      query: JSON.stringify(query) as any,
      postTransform: postTransform as any,
    };
  }

  private expressionToFilter(expression: Expression): any {
    const exprType = expression.op;

    switch (exprType) {
      case "chain": {
        const chainExpr = expression as ChainableExpression;
        const actions = chainExpr.getArgumentExpressions();
        const operand = (chainExpr as any).operand;

        if (actions.length > 0) {
          const action = (chainExpr as any).actions?.[0];
          if (action) {
            return this.actionToFilter(operand, action);
          }
        }
        return null;
      }

      case "and": {
        const andExprs = (expression as any).getArgumentExpressions();
        return {
          op: "and",
          filters: andExprs
            .map((e: Expression) => this.expressionToFilter(e))
            .filter(Boolean),
        };
      }

      case "or": {
        const orExprs = (expression as any).getArgumentExpressions();
        return {
          op: "or",
          filters: orExprs
            .map((e: Expression) => this.expressionToFilter(e))
            .filter(Boolean),
        };
      }

      case "not": {
        const notExpr = (expression as any).operand;
        return {
          op: "not",
          filter: this.expressionToFilter(notExpr),
        };
      }

      default:
        return { raw: expression.toString() };
    }
  }

  private actionToFilter(operand: Expression, action: any): any {
    const fieldName =
      operand instanceof RefExpression ? operand.name : operand.toString();
    const actionType = action.action;

    switch (actionType) {
      case "in": {
        const value = action.expression;
        if (value instanceof LiteralExpression) {
          if (value.value && value.value.elements) {
            return {
              op: "in",
              field: fieldName,
              values: value.value.elements,
            };
          }
        }
        return {
          op: "in",
          field: fieldName,
          expression: value.toString(),
        };
      }

      case "is": {
        const value = action.expression;
        return {
          op: "is",
          field: fieldName,
          value:
            value instanceof LiteralExpression ? value.value : value.toString(),
        };
      }

      case "lessThan":
        return {
          op: "lessThan",
          field: fieldName,
          value:
            action.expression instanceof LiteralExpression
              ? action.expression.value
              : action.expression.toString(),
        };

      case "greaterThan":
        return {
          op: "greaterThan",
          field: fieldName,
          value:
            action.expression instanceof LiteralExpression
              ? action.expression.value
              : action.expression.toString(),
        };

      case "contains":
        return {
          op: "contains",
          field: fieldName,
          value:
            action.expression instanceof LiteralExpression
              ? action.expression.value
              : action.expression.toString(),
        };

      default:
        return {
          op: actionType,
          field: fieldName,
          raw: action.toString(),
        };
    }
  }

  private splitToQuery(): any {
    if (!this.split) return null;

    const splits: any[] = [];
    const splitKeys = this.split.keys;

    for (const key of splitKeys) {
      const splitExpr = this.split.splits[key];
      splits.push({
        name: key,
        expression: this.expressionToSplit(splitExpr),
      });
    }

    return splits;
  }

  private expressionToSplit(expression: Expression): any {
    if (expression instanceof RefExpression) {
      return {
        op: "ref",
        field: expression.name,
      };
    }

    const exprType = expression.op;

    if (exprType === "chain") {
      const chainExpr = expression as ChainableExpression;
      const operand = (chainExpr as any).operand;
      const actions = (chainExpr as any).actions || [];

      if (operand instanceof RefExpression && actions.length > 0) {
        const action = actions[0];
        return {
          op: action.action || action.op,
          field: operand.name,
          params: action,
        };
      }
    }

    return {
      raw: expression.toString(),
    };
  }

  private expressionToApply(expression: Expression): any {
    const exprType = expression.op;

    if (exprType === "chain") {
      const chainExpr = expression as ChainableExpression;
      const actions = (chainExpr as any).actions || [];

      if (actions.length > 0) {
        const action = actions[0];
        return {
          op: action.action || action.op,
          expression: (chainExpr as any).operand?.toString(),
        };
      }
    }

    if (expression instanceof LiteralExpression) {
      return { op: "literal", value: expression.value };
    }

    if (expression instanceof RefExpression) {
      return { op: "ref", field: expression.name };
    }

    return { raw: expression.toString() };
  }

  public simulateValue(
    lastNode: boolean,
    simulatedQueries: any[],
    externalForNext?: External,
    timeRanges?: TimeRange[],
  ): PlywoodValue {
    const { query } = this.getQueryAndPostTransform();

    simulatedQueries.push({
      engine: "json",
      query: query,
    });

    if (this.mode === "value") {
      const valueExpression = this.valueExpression;
      return getSampleValue(valueExpression.type, valueExpression);
    }

    let keys: string[] = null;
    const datum: Datum = {};

    if (this.mode === "raw") {
      const attributes = this.attributes || [];
      for (const attribute of attributes) {
        datum[attribute.name] = getSampleValue(attribute.type, null);
      }
    } else {
      if (this.mode === "split") {
        keys = this.split.keys;
        for (const key of keys) {
          const splitExpr = this.split.splits[key];
          datum[key] = getSampleValue(splitExpr.type, splitExpr);
        }
      }

      const applies = this.applies || [];
      for (const apply of applies) {
        datum[apply.name] = getSampleValue(
          apply.expression.type,
          apply.expression,
        );
      }
    }

    if (this.mode === "total") {
      return new TotalContainer(datum) as any;
    }

    return new Dataset({
      keys,
      data: [datum],
    });
  }
}

External.register(JSONExternal);
