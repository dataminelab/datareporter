

import { SQLDialect } from "./baseDialect";

export class JSONDialect extends SQLDialect {
	static engine = "json";
	static type = "DATASET";

	// For JSON, return ISO string for dates
	public dateToSQLDateString(date: Date): string {
		return date.toISOString();
	}

	// Not supported in JSON
	public floatDivision(numerator: string, denominator: string): string {
		throw new Error("JSONDialect does not support float division");
	}

	// No group by in JSON, return empty string
	public emptyGroupBy(): string {
		return "";
	}

	public constantGroupBy(): string {
		return "";
	}

	public timeToSQL(date: Date): string {
		return date.toISOString();
	}

	// Represent array as JSON string
	public stringArrayToSQL(value: string[]): string {
		return JSON.stringify(value);
	}

	// Not supported in JSON
	public ipParse(value: string): string {
		throw new Error("JSONDialect does not support ipParse");
	}

	public ipPrefixParse(value: string): string {
		throw new Error("JSONDialect does not support ipPrefixParse");
	}

	// Simple JS concat
	public concatExpression(a: string, b: string): string {
		return `${a}${b}`;
	}

	// Contains: use JS includes
	public containsExpression(a: string, b: string, insensitive: boolean): string {
		if (insensitive) {
			return a.toLowerCase().includes(b.toLowerCase()) ? "true" : "false";
		}
		return a.includes(b) ? "true" : "false";
	}

	// Multi-value contains: check if b is in a (array)
	public mvContainsExpression(a: string, b: string[]): string {
		return Array.isArray(a) && b.some(val => a.includes(val)) ? "true" : "false";
	}

	public mvFilterOnlyExpression(a: string, b: string[]): string {
		throw new Error("JSONDialect does not support mvFilterOnlyExpression");
	}

	public mvOverlapExpression(a: string, b: string[]): string {
		return Array.isArray(a) && Array.isArray(b) && a.some(val => b.includes(val)) ? "true" : "false";
	}

	public substrExpression(a: string, position: number, length: number): string {
		return a.substr(position, length);
	}

	public countDistinctExpression(a: string, parameterAttributeName: string | undefined): string {
		throw new Error("JSONDialect does not support countDistinctExpression");
	}

	public isNotDistinctFromExpression(a: string, b: string): string {
		return a === b ? "true" : "false";
	}

	public castExpression(inputType: any, operand: string, targetType: string): string {
		throw new Error("JSONDialect does not support castExpression");
	}

	public timeFLoorOverTimeExpression(operand: string, duration: any, timezone: any): string {
		throw new Error("JSONDialect does not support timeFLoorOverTimeExpression");
	}

	public timeFloorExpression(operand: string, duration: any, timezone: any): string {
		throw new Error("JSONDialect does not support timeFloorExpression");
	}

	public timeBucketExpression(operand: string, duration: any, timezone: any): string {
		throw new Error("JSONDialect does not support timeBucketExpression");
	}

	public timePartExpression(operand: string, part: string, timezone: any): string {
		throw new Error("JSONDialect does not support timePartExpression");
	}

	public timeShiftExpression(operand: string, duration: any, step: number, timezone: any): string {
		throw new Error("JSONDialect does not support timeShiftExpression");
	}

	public extractExpression(operand: string, regexp: string): string {
		throw new Error("JSONDialect does not support extractExpression");
	}

	public regexpExpression(expression: string, regexp: string): string {
		throw new Error("JSONDialect does not support regexpExpression");
	}

	public indexOfExpression(str: string, substr: string): string {
		return String(str.indexOf(substr));
	}

	public quantileExpression(str: string, quantile: number, parameterAttributeName: string | undefined): string {
		throw new Error("JSONDialect does not support quantileExpression");
	}

	public logExpression(base: string, operand: string): string {
		throw new Error("JSONDialect does not support logExpression");
	}
}
