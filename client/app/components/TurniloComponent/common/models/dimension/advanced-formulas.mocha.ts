/*
 * Copyright 2017-2019 Allegro.pl
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

import { expect } from "chai";
import { Expression } from "plywood";
import { Dimension, DimensionJS } from "./dimension";

/**
 * Test suite for advanced formula types: Lookup, Extraction, and Boolean
 * 
 * These tests verify that dimensions can correctly parse and represent
 * complex Plywood expressions using the three advanced formula patterns.
 */
describe("Advanced Formula Types", () => {
  describe("Lookup Formulas", () => {
    it("should parse lookup formula without fallback", () => {
      const dimension = Dimension.fromJS({
        kind: "string",
        name: "eventTypeName",
        title: "Event Type Name",
        formula: "$eventTypeId.lookup('event_types')",
      });

      expect(dimension).to.exist;
      expect(dimension.formula).to.equal(
        "$eventTypeId.lookup('event_types')"
      );
      expect(dimension.expression).to.be.instanceOf(Expression);
    });

    it("should parse lookup formula with fallback to original value", () => {
      const dimension = Dimension.fromJS({
        kind: "string",
        name: "eventTypeNameFallback",
        title: "Event Type Name with Fallback",
        formula: "$eventTypeId.lookup('event_types').fallback($eventTypeId)",
      });

      expect(dimension).to.exist;
      expect(dimension.formula).to.equal(
        "$eventTypeId.lookup('event_types').fallback($eventTypeId)"
      );
      expect(dimension.kind).to.equal("string");
    });

    it("should parse lookup formula with fallback to default value", () => {
      const dimension = Dimension.fromJS({
        kind: "string",
        name: "eventTypeNameDefault",
        title: "Event Type Name with Default",
        formula: "$eventTypeId.lookup('event_types').fallback('unknown')",
      });

      expect(dimension).to.exist;
      expect(dimension.formula).to.equal(
        "$eventTypeId.lookup('event_types').fallback('unknown')"
      );
    });

    it("should convert lookup dimension to JS", () => {
      const original = {
        kind: "string",
        name: "userName",
        title: "User Name",
        formula: "$userId.lookup('user_lookup').fallback($userId)",
      };

      const dimension = Dimension.fromJS(original as DimensionJS);
      const js = dimension.toJS();

      expect(js.formula).to.equal(original.formula);
      expect(js.name).to.equal(original.name);
      expect(js.kind).to.equal(original.kind);
    });
  });

  describe("Extraction Formulas", () => {
    it("should parse extraction formula for version numbers", () => {
      const dimension = Dimension.fromJS({
        kind: "string",
        name: "resourceVersion",
        title: "Resource Version",
        formula: "$resourceName.extract('(\\d+\\.\\d+\\.\\d+)')",
      });

      expect(dimension).to.exist;
      expect(dimension.formula).to.include("extract");
      expect(dimension.kind).to.equal("string");
    });

    it("should parse extraction formula for domain extraction", () => {
      const dimension = Dimension.fromJS({
        kind: "string",
        name: "emailDomain",
        title: "Email Domain",
        formula: "$email.extract('@([a-zA-Z0-9.-]+)')",
      });

      expect(dimension).to.exist;
      expect(dimension.formula).to.include("extract");
    });

    it("should parse extraction formula for area code", () => {
      const dimension = Dimension.fromJS({
        kind: "string",
        name: "areaCode",
        title: "Area Code",
        formula: "$phoneNumber.extract('(\\d{3})')",
      });

      expect(dimension).to.exist;
      expect(dimension.formula).to.include("extract");
    });

    it("should parse extraction formula for URL path", () => {
      const dimension = Dimension.fromJS({
        kind: "string",
        name: "apiEndpoint",
        title: "API Endpoint",
        formula: "$requestPath.extract('^/api/([^/]+)')",
      });

      expect(dimension).to.exist;
      expect(dimension.formula).to.include("extract");
    });

    it("should convert extraction dimension to JS", () => {
      const original = {
        kind: "string",
        name: "version",
        title: "Version",
        formula: "$appVersion.extract('(\\d+\\.\\d+)')",
      };

      const dimension = Dimension.fromJS(original as DimensionJS);
      const js = dimension.toJS();

      expect(js.formula).to.equal(original.formula);
    });
  });

  describe("Boolean Formulas", () => {
    it("should parse simple equality boolean formula", () => {
      const dimension = Dimension.fromJS({
        kind: "boolean",
        name: "isActive",
        title: "Is Active",
        formula: "$status == 'active'",
      });

      expect(dimension).to.exist;
      expect(dimension.kind).to.equal("boolean");
      expect(dimension.formula).to.equal("$status == 'active'");
    });

    it("should parse inequality boolean formula", () => {
      const dimension = Dimension.fromJS({
        kind: "boolean",
        name: "isInactive",
        title: "Is Inactive",
        formula: "$status != 'inactive'",
      });

      expect(dimension).to.exist;
      expect(dimension.kind).to.equal("boolean");
    });

    it("should parse numeric comparison boolean formula", () => {
      const dimension = Dimension.fromJS({
        kind: "boolean",
        name: "isHighValue",
        title: "Is High Value",
        formula: "$revenue > 10000",
      });

      expect(dimension).to.exist;
      expect(dimension.kind).to.equal("boolean");
      expect(dimension.formula).to.include(">");
    });

    it("should parse IN operator boolean formula", () => {
      const dimension = Dimension.fromJS({
        kind: "boolean",
        name: "isTargetRegion",
        title: "Is Target Region",
        formula: "$region.in(['US', 'CA', 'UK'])",
      });

      expect(dimension).to.exist;
      expect(dimension.kind).to.equal("boolean");
      expect(dimension.formula).to.include("in");
    });

    it("should parse OR condition boolean formula", () => {
      const dimension = Dimension.fromJS({
        kind: "boolean",
        name: "myAccounts",
        title: "My Accounts",
        formula: "$country == 'United States' or $accountName.in(['Toyota', 'Honda'])",
      });

      expect(dimension).to.exist;
      expect(dimension.kind).to.equal("boolean");
      expect(dimension.formula).to.include("or");
    });

    it("should parse AND condition boolean formula", () => {
      const dimension = Dimension.fromJS({
        kind: "boolean",
        name: "premiumEligible",
        title: "Premium Eligible",
        formula: "$tier == 'premium' and $accountAge >= 12",
      });

      expect(dimension).to.exist;
      expect(dimension.kind).to.equal("boolean");
      expect(dimension.formula).to.include("and");
    });

    it("should parse complex boolean formula with multiple conditions", () => {
      const dimension = Dimension.fromJS({
        kind: "boolean",
        name: "targetSegment",
        title: "Target Segment",
        formula: "$country.in(['US', 'CA', 'MX']) and $revenue > 5000 and $tier != 'trial'",
      });

      expect(dimension).to.exist;
      expect(dimension.kind).to.equal("boolean");
    });

    it("should convert boolean dimension to JS", () => {
      const original = {
        kind: "boolean",
        name: "isHighRevenue",
        title: "Is High Revenue",
        formula: "$revenue > 10000",
      };

      const dimension = Dimension.fromJS(original as DimensionJS);
      const js = dimension.toJS();

      expect(js.formula).to.equal(original.formula);
      expect(js.kind).to.equal("boolean");
    });
  });

  describe("Chained/Complex Formulas", () => {
    it("should parse chained extraction and lookup", () => {
      const dimension = Dimension.fromJS({
        kind: "string",
        name: "extractedDomain",
        title: "Email Domain",
        formula: "$email.extract('@([a-zA-Z0-9.-]+)').lookup('domain_mapping')",
      });

      expect(dimension).to.exist;
      expect(dimension.formula).to.include("extract");
      expect(dimension.formula).to.include("lookup");
    });

    it("should parse lookup with boolean comparison", () => {
      const dimension = Dimension.fromJS({
        kind: "boolean",
        name: "isValidUser",
        title: "Is Valid User",
        formula: "$userId.lookup('user_validation').fallback('invalid') != 'invalid'",
      });

      expect(dimension).to.exist;
      expect(dimension.kind).to.equal("boolean");
      expect(dimension.formula).to.include("lookup");
      expect(dimension.formula).to.include("!=");
    });

    it("should parse slow request detection (comparison)", () => {
      const dimension = Dimension.fromJS({
        kind: "boolean",
        name: "isSlowRequest",
        title: "Is Slow Request",
        formula: "$responseTime > 1000",
      });

      expect(dimension).to.exist;
      expect(dimension.kind).to.equal("boolean");
    });

    it("should parse critical problem detection (multiple conditions)", () => {
      const dimension = Dimension.fromJS({
        kind: "boolean",
        name: "isCriticalProblem",
        title: "Is Critical Problem",
        formula:
          "$httpStatus >= 500 and $responseTime > 2000 and $requestPath.in(['/api/checkout', '/api/payment'])",
      });

      expect(dimension).to.exist;
      expect(dimension.kind).to.equal("boolean");
      expect(dimension.formula).to.include("and");
      expect(dimension.formula).to.include("in");
    });
  });

  describe("Formula Dimension Equality", () => {
    it("should correctly compare two lookup dimensions", () => {
      const dim1 = Dimension.fromJS({
        kind: "string",
        name: "eventType",
        title: "Event Type",
        formula: "$eventTypeId.lookup('event_types')",
      });

      const dim2 = Dimension.fromJS({
        kind: "string",
        name: "eventType",
        title: "Event Type",
        formula: "$eventTypeId.lookup('event_types')",
      });

      expect(dim1.equals(dim2)).to.be.true;
    });

    it("should correctly compare two extraction dimensions", () => {
      const dim1 = Dimension.fromJS({
        kind: "string",
        name: "version",
        title: "Version",
        formula: "$appVersion.extract('(\\d+\\.\\d+)')",
      });

      const dim2 = Dimension.fromJS({
        kind: "string",
        name: "version",
        title: "Version",
        formula: "$appVersion.extract('(\\d+\\.\\d+)')",
      });

      expect(dim1.equals(dim2)).to.be.true;
    });

    it("should correctly compare two boolean dimensions", () => {
      const dim1 = Dimension.fromJS({
        kind: "boolean",
        name: "isHighValue",
        title: "Is High Value",
        formula: "$revenue > 10000",
      });

      const dim2 = Dimension.fromJS({
        kind: "boolean",
        name: "isHighValue",
        title: "Is High Value",
        formula: "$revenue > 10000",
      });

      expect(dim1.equals(dim2)).to.be.true;
    });
  });

  describe("Formula Dimension Serialization", () => {
    it("should round-trip a lookup dimension", () => {
      const original = {
        kind: "string",
        name: "userName",
        title: "User Name",
        formula: "$userId.lookup('users').fallback('unknown')",
      };

      const dimension = Dimension.fromJS(original as DimensionJS);
      const serialized = dimension.toJS();

      expect(serialized.formula).to.equal(original.formula);
      expect(serialized.name).to.equal(original.name);
      expect(serialized.kind).to.equal(original.kind);
    });

    it("should round-trip an extraction dimension", () => {
      const original = {
        kind: "string",
        name: "domain",
        title: "Domain",
        formula: "$email.extract('@(.+)')",
      };

      const dimension = Dimension.fromJS(original as DimensionJS);
      const serialized = dimension.toJS();

      expect(serialized.formula).to.equal(original.formula);
    });

    it("should round-trip a boolean dimension", () => {
      const original = {
        kind: "boolean",
        name: "isPremium",
        title: "Is Premium",
        formula: "$tier.in(['premium', 'enterprise'])",
      };

      const dimension = Dimension.fromJS(original as DimensionJS);
      const serialized = dimension.toJS();

      expect(serialized.formula).to.equal(original.formula);
      expect(serialized.kind).to.equal("boolean");
    });
  });
});
