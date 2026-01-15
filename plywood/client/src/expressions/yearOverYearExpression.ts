import { ComputeFn, Datum, PlywoodValue } from "../datatypes/index";
import { SQLDialect } from "../dialect/baseDialect";
import { Expression } from "./baseExpression";

/**
 * Represents a time range element with start and end timestamps
 */
interface TimeRangeElement {
  start: string;
  end: string;
}

/**
 * Represents the complete time range configuration for year-over-year calculations
 */
interface TimeRangeType {
  op: string;
  currElement: TimeRangeElement;
  prevElement: TimeRangeElement;
  operand: [[Object]];
  expression: [[Expression]];
  name: string;
}

/** Supported database engines */
enum Engine {
  BIGQUERY = "bigquery",
  ATHENA = "athena",
}

/** Processing modes for year-over-year expressions */
enum ProcessMode {
  RAW = "raw",
  SPLIT = "split",
  TOTAL = "total",
}
/**
 * Handles year-over-year expression generation for SQL queries
 * Supports multiple database engines and processing modes
 */
export class YearOverYearExpression {
  static op = "YearOverYear";
  
  private queries: string[] = [];
  private engine: Engine | undefined;
  private mode: ProcessMode | undefined;
  private query: string | undefined;
  private keys: string[] = [];
  private sumColumns: string[] = [];
  private groupBy: string | undefined;
  private timeRanges: TimeRangeType | undefined;
  
  private readonly timestampRegex = /TIMESTAMP\('([\d-T:.Z]+)'\)/g;
  private readonly globalDateRangeRegex = /\([\"\'\`](\d+.{1,24})[\"\'\`]\)/g;
  private readonly sumPattern = /SUM\([`",']([^`",']*)[`",']\)/g;
  private readonly columnPattern = /[`",']([^`",']*)[`",']\sAS/g;
  private whereRegex: RegExp | undefined;

  constructor(engine?: Engine | string, queries?: string[], mode?: ProcessMode | string) {
    if (engine) {
      this.setEngine(engine);
    }
    if (queries) {
      this.setQueries(queries);
    }
    if (mode) {
      this.setMode(mode);
    }
    this.setRegexSettings();
  }

  /**
   * Checks if a query is a false query (contains WHERE FALSE)
   */
  public static isFalseQuery(query: string): boolean {
    return query.includes("WHERE FALSE");
  }

  /**
   * Configures regex patterns based on the database engine
   */
  private setRegexSettings(): void {
    switch (this.engine) {
      case Engine.BIGQUERY:
      case Engine.ATHENA:
        this.whereRegex = this.globalDateRangeRegex;
        break;
      default:
        // Use default regex
        this.whereRegex = this.globalDateRangeRegex;
    }
  }

  /**
   * Sets the SQL queries for processing
   * @throws {Error} if less than 3 queries are provided
   */
  public setQueries(queries: string[]): void {
    if (!queries || queries.length < 3) {
      throw new Error(
        `Invalid number of queries provided. Expected at least 3, got ${queries?.length || 0}`
      );
    }
    this.queries = queries;
  }

  public setMode(mode: ProcessMode | string): void {
    // Allow string input for backward compatibility
    if (typeof mode === "string" && Object.values(ProcessMode).includes(mode as ProcessMode)) {
      this.mode = mode as ProcessMode;
    } else if (typeof mode === "string") {
      throw new Error(`Invalid mode: ${mode}. Must be one of: ${Object.values(ProcessMode).join(", ")}`);
    } else {
      this.mode = mode;
    }
  }

  public setKeys(keys: string[]): void {
    this.keys = keys;
  }

  /**
   * Calculates the result for a given datum
   * @note Not yet implemented
   */
  public calc(datum: Datum): PlywoodValue {
    throw new Error("calc() method is not yet implemented");
  }

  /**
   * Gets JavaScript representation
   * @note Not yet implemented
   */
  public getJS(datumVar: string): string {
    throw new Error("getJS() method is not yet implemented");
  }

  /**
   * Gets SQL representation
   * @note Not yet implemented
   */
  public getSQL(dialect: SQLDialect): string {
    throw new Error("getSQL() method is not yet implemented");
  }

  /**
   * Gets compute function
   * @note Not yet implemented
   */
  public getFn(): ComputeFn {
    throw new Error("getFn() method is not yet implemented");
  }

  public getQuery(): string | undefined {
    return this.query;
  }

  public toString(indent?: number): string {
    return `YearOverYearExpression(mode=${this.mode}, engine=${this.engine})`;
  }

  /**
   * Checks if a query is a year-over-year query
   * @param query The SQL query to check
   * @returns true if the query contains year-over-year markers
   */
  public static isYoyQuery(query: string): boolean {
    if (this.isFalseQuery(query)) return false;
    return query.includes("_previous__") && query.includes("_delta__");
  }

  /**
   * Sets the database engine
   * @throws {Error} if engine is not supported
   */
  public setEngine(engine: Engine | string): void {
    if (typeof engine === "string" && !Object.values(Engine).includes(engine as Engine)) {
      // Allow any string for backward compatibility, but validate known engines
      if (engine !== "bigquery" && engine !== "athena") {
        console.warn(`Unknown engine: ${engine}. Supported engines: ${Object.values(Engine).join(", ")}`);
      }
    }
    this.engine = engine as Engine | undefined;
  }

  private fixEscapeNames(): void {
    if (!this.query) return;
    
    if (this.engine === Engine.ATHENA) {
      this.query = this.query.replace(/\\/g, "");
      this.query = this.query.replace(/`/g, '"');
    }
  }

  private secondSplitExists(): boolean {
    return this.queries[2]?.includes("some_") ?? false;
  }

  public setTimeRanges(timeRanges: TimeRangeType): void {
    this.timeRanges = timeRanges;
  }

  public getTimeRanges(): TimeRangeType | undefined {
    return this.timeRanges;
  }

  /**
   * Splits FROM and WHERE clauses from the main query and replaces date ranges
   * @throws {Error} if timeRanges are not set or no matches found
   */
  private splitFromAndWhereQueries(formattedSumQueries: string): string[] {
    if (!this.timeRanges) {
      throw new Error("Time ranges must be set before processing");
    }

    const { currElement, prevElement } = this.timeRanges;
    const whereRegex = this.whereRegex;
    
    if (!whereRegex) {
      throw new Error("Where regex is not configured");
    }

    const [fromQuery, whereQuery] = this.queries[2].split("WHERE");
    const matches = whereQuery.match(whereRegex);
    
    let where1 = whereQuery;
    let where2 = whereQuery;
    
    if (matches) {
      for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        if (match.length < 2) continue;
        if (i % 2 === 0) {
          where1 = where1.replace(match, `('${prevElement.start}')`);
          where2 = where2.replace(match, `('${currElement.start}')`);
        } else {
          where1 = where1.replace(match, `('${prevElement.end}')`);
          where2 = where2.replace(match, `('${currElement.end}')`);
        }
      }
    } else {
      throw new Error(
        `No date range matches found in WHERE clause. Expected pattern: ${whereRegex}`
      );
    }
    
    if (this.engine === Engine.ATHENA) {
      formattedSumQueries = formattedSumQueries.slice(0, -1);
    } else if (this.engine === Engine.BIGQUERY && this.secondSplitExists()) {
      where1 = where1.replace(")) AND (", "))) AND (").slice(0, -1);
      where2 = where2.replace(")) AND (", "))) AND (").slice(0, -1);
    }
    
    return [formattedSumQueries, fromQuery, where1, where2];
  }

  public setGroupBy(groupBy: string): void {
    this.groupBy = groupBy;
  }

  /**
   * Processes the year-over-year expression based on the configured mode
   * @throws {Error} if mode is invalid
   */
  public process(): void {
    if (!this.mode) {
      throw new Error("Mode must be set before processing");
    }

    let formattedSumQueries: string;
    let formattedColumnQueries: string;
    let sumMatch;
    let columnMatch;
    let fromQuery;
    let where1;
    let where2;
    let onQuery;
    let match;
    
    switch (this.mode) {
      case ProcessMode.RAW:
        // Raw mode doesn't need processing
        break;
        
      case ProcessMode.SPLIT:
        if (!this.keys.length) {
          while (
            (columnMatch = this.columnPattern.exec(this.queries[1])) !== null
          ) {
            this.keys.push(columnMatch[1] || columnMatch[2]);
          }
        }

        formattedColumnQueries = this.keys
          .filter((value, index, self) => self.indexOf(value) === index)
          .map(i => `COALESCE(curr.${i}, prev.${i}) AS \`${i}\`,`)
          .join(" ");
          
        while ((sumMatch = this.sumPattern.exec(this.queries[1])) !== null) {
          this.sumColumns.push(sumMatch[1] || sumMatch[2]);
        }
        
        [formattedSumQueries, fromQuery, where1, where2] =
          this.splitFromAndWhereQueries(
            this.sumColumns
              .filter((value, index, self) => self.indexOf(value) === index)
              .map(
                i =>
                  `COALESCE(curr.${i}, 0) AS \`${i}\`, COALESCE(prev.${i}, 0) AS \`_previous__${i}\`, (COALESCE(curr.${i}, 0) - COALESCE(prev.${i}, 0)) AS \`_delta__${i}\`,`,
              )
              .join(" "),
          );
          
        onQuery = this.keys.length
          ? `curr.${this.keys[0]} = prev.${this.keys[0]}`
          : "1=1";
          
        this.query = `
                    SELECT ${formattedColumnQueries} ${formattedSumQueries}
                    FROM ( SELECT ${this.queries[1]} ${fromQuery} WHERE ${where1} GROUP BY ${this.groupBy}) AS curr
                    FULL OUTER JOIN ( SELECT ${this.queries[1]} ${fromQuery} WHERE ${where2} GROUP BY ${this.groupBy}) AS prev
                    ON ${onQuery}
                `;
        break;
        
      case ProcessMode.TOTAL:
        while ((match = this.sumPattern.exec(this.queries[1])) !== null) {
          const columnName = match[1] || match[2];
          this.sumColumns.push(columnName);
        }
        
        formattedSumQueries = this.sumColumns
          .filter((value, index, self) => {
            return self.indexOf(value) === index;
          })
          .map(
            i =>
              `COALESCE(curr.${i}, 0) AS \`${i}\`, COALESCE(prev.${i}, 0) AS \`_previous__${i}\`, (COALESCE(curr.${i}, 0) - COALESCE(prev.${i}, 0)) AS \`_delta__${i}\`,`,
          )
          .join(" ");

        [formattedSumQueries, fromQuery, where1, where2] =
          this.splitFromAndWhereQueries(formattedSumQueries);
          
        this.query = `
                    SELECT ${formattedSumQueries}
                    FROM ( SELECT ${this.queries[1]} ${fromQuery} WHERE ${where1}) AS curr
                    FULL OUTER JOIN ( SELECT ${this.queries[1]} ${fromQuery} WHERE ${where2}) AS prev
                    ON 1=1
                `;
        break;
        
      default:
        throw new Error(
          `Invalid mode: ${this.mode}. Must be one of: ${Object.values(ProcessMode).join(", ")}`
        );
    }
    
    this.fixEscapeNames();
  }
}
