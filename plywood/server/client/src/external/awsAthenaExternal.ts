import { PlywoodRequester } from 'plywood-base-api';
import { AttributeInfo, Attributes } from '../datatypes';
import { AwsAthenaDialect } from '../dialect/awsAthenaDialect';
import { PlyType } from '../types';
import { External, ExternalJS, ExternalValue } from './baseExternal';
import { SQLExternal } from './sqlExternal';

export interface AthenaColumn {
  name: string;
  type: string;
}

// NB: Athena is a copy of Presto, sql syntax is the same
export class AwsAthenaExternal extends SQLExternal {
  static engine = 'athena';
  static type = 'DATASET';


  static fromJS(parameters: ExternalJS, requester: PlywoodRequester<any>): AwsAthenaExternal {
    let value: ExternalValue = External.jsToValue(parameters, requester);
    return new AwsAthenaExternal(value);
  }

  // https://docs.aws.amazon.com/athena/latest/ug/data-types.html
  private static NUMBER_TYPES = ['tinyint', 'smallint', 'int', 'integer', 'bigint', 'float', 'decimal'];
  private static STRING_TYPES = ['char', 'varchar', 'string'];
  private static DATE_TYPES = ['date', 'timestamp'];
  // there's also map,array and struct types, leaving out for simplicity :)

  // Method for converting Athena/Presto column info to plywood data types
  // This will be used in plywood-server
  static mapTypes(columns: AthenaColumn[]): Attributes {
    return columns
      .map((column: AthenaColumn) => {
        let name = column.name;
        let type: PlyType;
        let nativeType = column.type.toLowerCase();
        if (AwsAthenaExternal.DATE_TYPES.indexOf(nativeType) > -1) {
          type = 'TIME';
        } else if (AwsAthenaExternal.STRING_TYPES.indexOf(nativeType) > -1) {
          type = 'STRING';
        } else if (AwsAthenaExternal.NUMBER_TYPES.indexOf(nativeType) > -1) {
          type = 'NUMBER';
        } else if (nativeType === 'BOOLEAN') {
          type = 'BOOLEAN';
        } else {
          return null;
        }

        return new AttributeInfo({
          name,
          type,
          nativeType
        });
      });
  }

  constructor(parameters: ExternalValue) {
    super(parameters, new AwsAthenaDialect());
    this._ensureEngine('athena');
  }

  protected getIntrospectAttributes(): Promise<Attributes> {
    // NB: Redash does all of the introspection, we just need to provide mapping function for plywood-server
    return Promise.resolve([]);
  }
}

External.register(AwsAthenaExternal);
