import { PlywoodRequester } from 'plywood-base-api';
import toArray from 'stream-to-array';

import { AttributeInfo, Attributes } from '../datatypes';
import { BigQueryDialect } from '../dialect/bigQueryDialect';
import { PlyType } from '../types';

import { External, ExternalJS, ExternalValue } from './baseExternal';
import { SQLExternal } from './sqlExternal';

export interface BigQueryColumn {
  name: string;
  type: string;
}

export class BigQueryExternal extends SQLExternal {
  static engine = 'bigquery';
  static type = 'DATASET';


  static fromJS(parameters: ExternalJS, requester: PlywoodRequester<any>): BigQueryExternal {
    const value: ExternalValue = External.jsToValue(parameters, requester);
    return new BigQueryExternal(value);
  }

  static mapTypes(columns: BigQueryColumn[]): Attributes {
    return columns
      .map((column: BigQueryColumn) => {
        const name = column.name;
        let type: PlyType;
        const nativeType = column.type.toLowerCase();
        if (nativeType === 'date' || nativeType === 'datetime' || nativeType === 'timestamp') {
          type = 'TIME';
        } else if (nativeType === 'string') {
          type = 'STRING';
        } else if (nativeType === 'numeric' || nativeType === 'int64' || nativeType === 'float64' 
                  || nativeType === 'integer' || nativeType === 'float' || nativeType === 'bignumeric') {
          type = 'NUMBER';
        } else if (nativeType === 'bool') {
          type = 'BOOLEAN';
        } else if (nativeType.indexOf('ARRAY') >= 0) {
          // TODO implement array types like ARRAY<STRUCT<site STRING, title STRING, encoded STRING>>
          // TODO run select * from bigquery-public-data.wikipedia.INFORMATION_SCHEMA.COLUMNS;
          return null;
        } else {
          return null;
        }

        return new AttributeInfo({
          name,
          type,
          nativeType,
        });
      });
  }

  static postProcessIntrospect(columns: BigQueryColumn[]): Attributes {
    return this.mapTypes(columns);
  }
    
  constructor(parameters: ExternalValue) {
    super(parameters, new BigQueryDialect());
    this._ensureEngine('bigquery');
  }

  protected getIntrospectAttributes(): Promise<Attributes> {
    // NB: introspection is done in redash
    return toArray(
      this.requester({
        query: `select column_name as name, data_type as type
            from INFORMATION_SCHEMA.COLUMNS
            WHERE table_name = ${this.dialect.escapeLiteral(this.source as string)} AND is_hidden = false`
      })
    ).then(BigQueryExternal.mapTypes);
  }

  static getVersion(requester: PlywoodRequester<any>): Promise<string> {
    return toArray(
      requester({
        query: `SELECT version()`,
      })
    ).then((rows: any[]) => {
      if (rows.length === 0) {
        throw new Error('No version found');
      }
      return rows[0].version;
    });
  }

  static getSourceList(requester: PlywoodRequester<any>): Promise<string[]> {
    return toArray(
      requester({
        query: `SELECT table_name AS name
            FROM INFORMATION_SCHEMA.TABLES
            WHERE table_type = 'BASE TABLE' AND table_schema = 'public'`,
      })
    ).then((sources: any[]) => {
      if (!sources.length) return sources;
      return sources.map((s: any) => s.name).sort();
    });
  }
}

External.register(BigQueryExternal);
