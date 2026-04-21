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

import { DimensionGroupJS } from "./dimension-group";

/**
 * Advanced formula fixtures demonstrating Lookup, Extraction, and Boolean formulas
 * These examples show how to use Plywood expressions in Turnilo dimensions
 */
export class AdvancedFormulaFixtures {
  /**
   * Lookup Formula Examples
   * Apply Druid Query Time Lookups to transform dimension values
   */
  static lookupFormulasJS(): DimensionGroupJS {
    return {
      name: "lookup_group",
      title: "Lookup Formula Examples",
      dimensions: [
        {
          kind: "string",
          name: "eventTypeId",
          title: "Event Type ID",
          formula: "$eventTypeId",
        },
        {
          kind: "string",
          name: "eventTypeName",
          title: "Event Type Name (via Lookup)",
          description:
            "Maps event type IDs to their display names using a lookup table",
          formula: "$eventTypeId.lookup('event_type_lookup')",
        },
        {
          kind: "string",
          name: "eventTypeWithFallback",
          title: "Event Type (Keep ID if Not Found)",
          description:
            "If the lookup value is not found, keeps the original ID",
          formula: "$eventTypeId.lookup('event_type_lookup').fallback($eventTypeId)",
        },
        {
          kind: "string",
          name: "eventTypeWithDefault",
          title: "Event Type (Mark Unknown)",
          description:
            "If the lookup value is not found, replaces with 'unknown'",
          formula: "$eventTypeId.lookup('event_type_lookup').fallback('unknown')",
        },
        {
          kind: "string",
          name: "userId",
          title: "User ID",
          formula: "$userId",
        },
        {
          kind: "string",
          name: "userName",
          title: "User Name (via Lookup)",
          description: "Resolves user IDs to usernames using a lookup table",
          formula: "$userId.lookup('user_lookup').fallback($userId)",
        },
      ],
    };
  }

  /**
   * Extraction Formula Examples
   * Extract portions of string values using regular expressions
   */
  static extractionFormulasJS(): DimensionGroupJS {
    return {
      name: "extraction_group",
      title: "Extraction Formula Examples",
      dimensions: [
        {
          kind: "string",
          name: "resourceName",
          title: "Resource Name",
          formula: "$resourceName",
        },
        {
          kind: "string",
          name: "resourceVersion",
          title: "Resource Version",
          description:
            "Extracts semantic version (e.g., 0.8.2 from druid-0.8.2)",
          formula: "$resourceName.extract('(\\d+\\.\\d+\\.\\d+)')",
        },
        {
          kind: "string",
          name: "majorVersion",
          title: "Major Version",
          description: "Extracts major version number (first digit only)",
          formula: "$resourceName.extract('(\\d+)\\.\\d+\\.\\d+')",
        },
        {
          kind: "string",
          name: "email",
          title: "Email Address",
          formula: "$email",
        },
        {
          kind: "string",
          name: "emailDomain",
          title: "Email Domain",
          description: "Extracts domain from email addresses",
          formula: "$email.extract('@([a-zA-Z0-9.-]+)')",
        },
        {
          kind: "string",
          name: "emailProvider",
          title: "Email Provider",
          description: "Extracts just the provider name (e.g., gmail from gmail.com)",
          formula: "$email.extract('@([a-zA-Z0-9-]+)\\.com')",
        },
        {
          kind: "string",
          name: "phoneNumber",
          title: "Phone Number",
          formula: "$phoneNumber",
        },
        {
          kind: "string",
          name: "areaCode",
          title: "Area Code",
          description: "Extracts area code from phone numbers",
          formula: "$phoneNumber.extract('(\\d{3})')",
        },
        {
          kind: "string",
          name: "url",
          title: "URL",
          formula: "$url",
        },
        {
          kind: "string",
          name: "urlPath",
          title: "URL Path",
          description: "Extracts the path component from URLs",
          formula: "$url.extract('/([^?#]+)')",
        },
      ],
    };
  }

  /**
   * Boolean Formula Examples
   * Create boolean dimensions using logical expressions
   */
  static booleanFormulasJS(): DimensionGroupJS {
    return {
      name: "boolean_group",
      title: "Boolean Formula Examples",
      dimensions: [
        {
          kind: "string",
          name: "country",
          title: "Country",
          formula: "$country",
        },
        {
          kind: "string",
          name: "accountName",
          title: "Account Name",
          formula: "$accountName",
        },
        {
          kind: "boolean",
          name: "myAccounts",
          title: "My Accounts",
          description:
            "True for US-based accounts OR Toyota/Honda accounts",
          formula: "$country == 'United States' or $accountName.in(['Toyota', 'Honda'])",
        },
        {
          kind: "number",
          name: "revenue",
          title: "Revenue",
          formula: "$revenue",
        },
        {
          kind: "boolean",
          name: "isHighRevenue",
          title: "Is High Revenue (>$10K)",
          description: "True if revenue exceeds $10,000",
          formula: "$revenue > 10000",
        },
        {
          kind: "boolean",
          name: "isMediumRevenue",
          title: "Is Medium Revenue ($5K-$10K)",
          description: "True if revenue is between $5,000 and $10,000",
          formula: "$revenue >= 5000 and $revenue <= 10000",
        },
        {
          kind: "string",
          name: "status",
          title: "Status",
          formula: "$status",
        },
        {
          kind: "boolean",
          name: "isActive",
          title: "Is Active",
          description: "True if status is not 'inactive'",
          formula: "$status != 'inactive'",
        },
        {
          kind: "string",
          name: "tier",
          title: "Tier",
          formula: "$tier",
        },
        {
          kind: "number",
          name: "accountAge",
          title: "Account Age (months)",
          formula: "$accountAge",
        },
        {
          kind: "boolean",
          name: "premiumEligible",
          title: "Premium Eligible",
          description: "Premium tier AND at least 12 months old",
          formula: "$tier == 'premium' and $accountAge >= 12",
        },
        {
          kind: "boolean",
          name: "targetSegment",
          title: "Target Segment",
          description:
            "North American countries AND revenue > $5K",
          formula: "$country.in(['US', 'CA', 'MX']) and $revenue > 5000",
        },
      ],
    };
  }

  /**
   * Combined/Chained Formula Examples
   * Demonstrate combining multiple formula operations
   */
  static chainedFormulasJS(): DimensionGroupJS {
    return {
      name: "chained_group",
      title: "Chained Formula Examples",
      dimensions: [
        {
          kind: "string",
          name: "userEmail",
          title: "User Email",
          formula: "$userEmail",
        },
        {
          kind: "string",
          name: "extractedDomain",
          title: "Extracted Email Domain",
          description: "First extracts domain from email, then looks it up",
          formula: "$userEmail.extract('@([a-zA-Z0-9.-]+)').lookup('domain_standardization')",
        },
        {
          kind: "string",
          name: "userId",
          title: "User ID",
          formula: "$userId",
        },
        {
          kind: "boolean",
          name: "isValidUser",
          title: "Is Valid User",
          description: "Looks up user ID and checks if it's valid (not 'invalid')",
          formula: "$userId.lookup('user_validation').fallback('invalid') != 'invalid'",
        },
        {
          kind: "string",
          name: "buildNumber",
          title: "Build Number",
          formula: "$buildNumber",
        },
        {
          kind: "boolean",
          name: "isStableRelease",
          title: "Is Stable Release",
          description:
            "Extracts version, looks it up against stable versions list",
          formula:
            "$buildNumber.extract('v(\\d+\\.\\d+\\.\\d+)').lookup('stable_versions').fallback('') != ''",
        },
      ],
    };
  }

  /**
   * Real-world E-commerce Example
   * Complete example for an e-commerce platform
   */
  static ecommerceExampleJS(): DimensionGroupJS {
    return {
      name: "ecommerce",
      title: "E-Commerce Dimensions",
      dimensions: [
        // Basic Fields
        {
          kind: "string",
          name: "productId",
          title: "Product ID",
          formula: "$productId",
        },
        // Lookup: Get product names from a lookup table
        {
          kind: "string",
          name: "productName",
          title: "Product Name",
          description: "Maps product IDs to product names via lookup",
          formula: "$productId.lookup('product_names').fallback('Unknown Product')",
        },
        // Extraction: Get category from product code
        {
          kind: "string",
          name: "productCategory",
          title: "Product Category",
          description: "Extracts category prefix from product code",
          formula: "$productId.extract('^([A-Z]+)-')",
        },
        // Boolean: Check if high value product
        {
          kind: "number",
          name: "price",
          title: "Price",
          formula: "$price",
        },
        {
          kind: "boolean",
          name: "isHighValueProduct",
          title: "Is High Value Product",
          description: "True if price > $100",
          formula: "$price > 100",
        },
        // Boolean: Multi-condition
        {
          kind: "string",
          name: "region",
          title: "Region",
          formula: "$region",
        },
        {
          kind: "boolean",
          name: "isPriorityProduct",
          title: "Is Priority Product",
          description:
            "High-value product in target regions (US, CA, UK)",
          formula:
            "$price > 100 and $region.in(['US', 'CA', 'UK'])",
        },
        // Chained: Extract then validate
        {
          kind: "string",
          name: "sku",
          title: "SKU",
          formula: "$sku",
        },
        {
          kind: "boolean",
          name: "isValidSKU",
          title: "Is Valid SKU",
          description: "Validates SKU against lookup table",
          formula: "$sku.lookup('valid_skus').fallback('') != ''",
        },
      ],
    };
  }

  /**
   * Analytics/Events Example
   * Complete example for event analytics
   */
  static analyticsExampleJS(): DimensionGroupJS {
    return {
      name: "analytics",
      title: "Analytics Event Dimensions",
      dimensions: [
        // Event Type Lookup
        {
          kind: "string",
          name: "eventTypeCode",
          title: "Event Type Code",
          formula: "$eventTypeCode",
        },
        {
          kind: "string",
          name: "eventTypeName",
          title: "Event Type Name",
          description: "Human-readable event type names via lookup",
          formula:
            "$eventTypeCode.lookup('event_types').fallback($eventTypeCode)",
        },
        // User Agent Extraction
        {
          kind: "string",
          name: "userAgent",
          title: "User Agent",
          formula: "$userAgent",
        },
        {
          kind: "string",
          name: "browserVersion",
          title: "Browser Version",
          description: "Extracts browser version from user agent",
          formula: "$userAgent.extract('Chrome/([0-9.]+)')",
        },
        // Request Path Analysis
        {
          kind: "string",
          name: "requestPath",
          title: "Request Path",
          formula: "$requestPath",
        },
        {
          kind: "string",
          name: "apiEndpoint",
          title: "API Endpoint",
          description: "Extracts the main endpoint from request path",
          formula: "$requestPath.extract('^/api/([^/]+)')",
        },
        // Response Time Analysis
        {
          kind: "number",
          name: "responseTime",
          title: "Response Time (ms)",
          formula: "$responseTime",
        },
        {
          kind: "boolean",
          name: "isSlowRequest",
          title: "Is Slow Request",
          description: "True if response time > 1000ms",
          formula: "$responseTime > 1000",
        },
        // Combined Analysis
        {
          kind: "boolean",
          name: "isProblematicRequest",
          title: "Is Problematic Request",
          description:
            "Slow requests to critical APIs",
          formula:
            "$responseTime > 1000 and $requestPath.in(['/api/auth', '/api/users', '/api/checkout'])",
        },
      ],
    };
  }
}
