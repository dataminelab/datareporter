import { ComputeFn, Dataset, Datum, PlywoodValue } from '../datatypes/index';
import { SQLDialect } from '../dialect/baseDialect';
import { ApplyExpression } from './applyExpression';
import {
  ChainableUnaryExpression,
  Expression,
  ExpressionJS,
  ExpressionValue,
} from './baseExpression';
import { LiteralExpression } from './literalExpression';
import { RefExpression } from './refExpression';
import { SortExpression } from './sortExpression';
import { SplitExpression } from './splitExpression';

export class YearOverYearExpression {
    static op = 'YearOverYear';
    queries: string[] = [];
    engine: string;
    mode: string;
    query: string;
    type: string;
    columns: string[] = [];
    sumColumns: string[] = [];
    keys: string[] = [];
    groupBy: string;

    constructor(engine?: string, queries?: string[], mode?: string) {
        if (engine) {
            this.setEngine(engine);
        }
        if (queries) {
            this.setQueries(queries);
        }
        if (mode) {
            this.setMode(mode);
        }
        this._setExpressionTypes('DATASET');
    }

    private _setExpressionTypes(arg0: string) {
        this.type = arg0;
    }

    public setQueries(queries: string[]) {
        if (!queries || queries.length < 3) {
            throw new Error("Invalid query");
        }
        this.queries = queries;
    }

    public setMode(mode: string) {
        this.mode = mode;
    }

    public setKeys(keys: string[]) {
        this.keys = keys
    }

    public calc(datum: Datum): PlywoodValue {
        return null;
    }

    public getJS(datumVar: string): string {
        return null;
    }

    public getSQL(dialect: SQLDialect): string {
        return null;
    }

    public getFn(): ComputeFn {
        return null;
    }

    private setQuery(query: string) {
        this.query = query;
    }

    private delQuery() {
        delete this.query;
    }

    public getQuery() {
        return this.query
    }

    public toString(indent?: int): string {
        return indent.toString();
    }

    protected sqlToQuery(sql: string): any {
        return sql;
    }

    static isYoyQuery(query : string): boolean {
        return query.includes("_previous__") && query.includes("_delta__");
    }

    public setEngine(engine: string) {
        this.engine = engine;
    }

    private fixEscapeNames() {
        if (this.engine === 'athena') {
            this.query = this.query.replace(/\\/g, '')
            this.query = this.query.replace(/`/g, '"')
        }
    }

    private splitFromAndWhereQueries(formattedSumQueries: string): string[] {
        //@ts-ignore
        const [fromQuery, whereQuery] = this.queries[2].split("WHERE");
        if (whereQuery.includes("OR")) {
            var [where1, where2] = whereQuery.split(" OR ");
        } else if (whereQuery.includes("AND")) {
            var [where1, where2] = whereQuery.split(" AND ");
        } else {
            throw new Error("WHERE clause must contain AND or OR")
        }
        if (!where2.includes("AND")) {
            where2 = where2.slice(0, -1)
        }
        if (!where1.endsWith(")")) {
            where1+=")"
        }
        if (this.engine === 'athena') {
            formattedSumQueries=formattedSumQueries.slice(0, -1)
        }
        return [formattedSumQueries, fromQuery, where1, where2];
    }

    public setGroupBy(groupBy: string) {
        this.groupBy = groupBy;
    }

    public process() {
        const sumPattern = /SUM\([`",']([^`",']*)[`",']\)/g;
        const columnPattern = /[`",']([^`",']*)[`",']\sAS/g;
        var formattedSumQueries: string;
        var formattedColumnQueries: string;
        let sumMatch;
        let columnMatch;
        switch (this.mode) {
            case "raw":
                break;
            case "split":
                if (!this.keys.length) {
                    while ((columnMatch = columnPattern.exec(this.queries[1])) !== null) {
                        this.keys.push(columnMatch[1] || columnMatch[2]);
                    }
                }
                // console.log("this.keys", this.keys)
                formattedColumnQueries = this.keys
                    .filter((value, index, self) => self.indexOf(value) === index)
                    .map(i => `COALESCE(curr.${i}, prev.${i}) AS \`${i}\`,`).join(' ');        
                while ((sumMatch = sumPattern.exec(this.queries[1])) !== null) {
                    this.sumColumns.push(sumMatch[1] || sumMatch[2]);
                }
                var [formattedSumQueries, fromQuery, where1, where2] = this.splitFromAndWhereQueries(
                    this.sumColumns
                        .filter((value, index, self) => self.indexOf(value) === index)
                        .map(i => `COALESCE(curr.${i}, 0) AS \`${i}\`, COALESCE(prev.${i}, 0) AS \`_previous__${i}\`, (COALESCE(curr.${i}, 0) - COALESCE(prev.${i}, 0)) AS \`_delta__${i}\`,`)
                        .join(' ')
                );
                const onQuery = this.keys.length ? `curr.${this.keys[0]} = prev.${this.keys[0]}` : "1=1";
                this.query = `
                    SELECT ${formattedColumnQueries} ${formattedSumQueries}
                    FROM ( SELECT ${this.queries[1]} ${fromQuery} WHERE ${where1} GROUP BY ${this.groupBy}) AS curr
                    FULL OUTER JOIN ( SELECT ${this.queries[1]} ${fromQuery} WHERE ${where2} GROUP BY ${this.groupBy}) AS prev
                    ON ${onQuery}
                `
                break;
            case "total":
                let match;
                console.log("this.sumColumns", this.sumColumns)
                while ((match = sumPattern.exec(this.queries[1])) !== null) {
                    const columnName = match[1] || match[2];
                    this.sumColumns.push(columnName);
                }                
                formattedSumQueries = this.sumColumns
                    .filter((value, index, self) => {
                        return self.indexOf(value) === index;
                    })
                    .map(i => 
                        `COALESCE(curr.${i}, 0) AS \`${i}\`, COALESCE(prev.${i}, 0) AS \`_previous__${i}\`, (COALESCE(curr.${i}, 0) - COALESCE(prev.${i}, 0)) AS \`_delta__${i}\`,`
                    ).join(' ');

                var [formattedSumQueries, fromQuery, where1, where2] = this.splitFromAndWhereQueries(formattedSumQueries);
                this.query = `
                    SELECT ${formattedSumQueries}
                    FROM ( SELECT ${this.queries[1]} ${fromQuery} WHERE ${where1}) AS curr
                    FULL OUTER JOIN ( SELECT ${this.queries[1]} ${fromQuery} WHERE ${where2}) AS prev
                    ON 1=1
                `
                break;
            default:
                throw new Error("Invalid mode");
        }
        this.setQuery(this.query)
        this.fixEscapeNames();
    }
}