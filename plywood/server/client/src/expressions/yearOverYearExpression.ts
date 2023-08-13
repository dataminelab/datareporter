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
    queries: string[];
    engine: string;
    mode: string;
    query: string;
    type: string;

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
        this._checkExpressionTypes('DATASET');
    }

    private _checkExpressionTypes(arg0: string) {
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
        if (this.engine === 'athena') {
            where2 = where2.slice(0, -1)
            where1+=")"
            console.log("pre formattedSumQueries", formattedSumQueries)
            formattedSumQueries=formattedSumQueries.slice(0, -1)
            console.log("post formattedSumQueries", formattedSumQueries)
        }
        return [formattedSumQueries, fromQuery, where1, where2];
    }


    public getQuery(): any {
        const sumPattern = /SUM\([`",']([^`",']*)[`",']\)/g;
        const columnPattern = /[`",']([^`",']*)[`",']\sAS/g;
        var formattedSumQueries: string;
        var formattedColumnQueries: string;
        let sumMatch;
        let columnMatch;
        let uniqueColumnMatches;
        let sumColumnNames = [];  
        let columnNames = [];
        switch (this.mode) {
            case "raw":
                break;
            case "split":
                while ((columnMatch = columnPattern.exec(this.queries[1])) !== null) {
                    columnNames.push(columnMatch[1] || columnMatch[2]);
                }
                formattedColumnQueries = columnNames
                    .filter((value, index, self) => self.indexOf(value) === index)
                    .map(i => `curr.${i} AS \`${i}\`,`).join(' ');
        
                while ((sumMatch = sumPattern.exec(this.queries[1])) !== null) {
                    sumColumnNames.push(sumMatch[1] || sumMatch[2]);
                }
                uniqueColumnMatches = sumColumnNames
                    .filter((value, index, self) => self.indexOf(value) === index);
                formattedSumQueries = uniqueColumnMatches
                    .map(i => `COALESCE(curr.${i}, 0) AS \`${i}\`, COALESCE(prev.${i}, 0) AS \`_previous__${i}\`, (COALESCE(curr.${i}, 0) - COALESCE(prev.${i}, 0)) AS \`_delta__${i}\`,`)
                    .join(' ');

                var [formattedSumQueries, fromQuery, where1, where2] = this.splitFromAndWhereQueries(formattedSumQueries);
                this.query = `
                    SELECT ${formattedColumnQueries} ${formattedSumQueries}
                    FROM ( SELECT ${this.queries[1]} ${fromQuery} WHERE ${where1} GROUP BY ${columnNames[0]}) AS curr
                    FULL OUTER JOIN ( SELECT ${this.queries[1]} ${fromQuery} WHERE ${where2} GROUP BY ${columnNames[0]}) AS prev
                    ON curr.${columnNames[0]} = prev.${columnNames[0]}
                `
                break;
            case "total":
                let match;
                while ((match = sumPattern.exec(this.queries[1])) !== null) {
                    const columnName = match[1] || match[2];
                    sumColumnNames.push(columnName);
                }                
                formattedSumQueries = sumColumnNames
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
        this.fixEscapeNames();
        return this.query
    }
}