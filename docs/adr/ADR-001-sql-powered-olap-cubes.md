---
doc_type: adr
lifecycle: living
owner: radek
canonical_location: source-repo
last_verified: 2026-03-10
status: proposed
---

# ADR-001: SQL-Powered OLAP Cubes via withQuery CTE

**Date:** 2026-03-10
**Status:** Proposed
**Decision Makers:** Radek Maciaszek

## 1. Context and Problem

DataReporter's Turnilo-based OLAP visualization requires data cubes backed by database tables. This creates friction:

- **Flat table requirement:** Plywood's Druid heritage means it only supports flat tables plus simple id→name lookups. No JOINs, no complex transformations.
- **Customer burden:** Customers must pre-materialize flat tables or create database views — requiring DBA involvement and CREATE VIEW permissions.
- **Inflexibility:** The current Model system (`models.py:25`) stores only a `table` field — a single table name per cube.

Meanwhile, DataReporter already has a powerful SQL query editor (inherited from Redash) that customers use daily. Users know SQL. They shouldn't need to build flat tables when a query can express the same thing.

## 2. Decision

**Use user-defined SQL queries as OLAP cube sources via Plywood's existing `withQuery` CTE mechanism.**

A user writes a SQL query (with JOINs, aggregations, window functions — anything their database supports). DataReporter wraps it as a CTE and Turnilo operates on the flat output:

```
┌─────────────────────────────────────────────────────────┐
│ User defines SQL query (with JOINs, transforms, etc.)   │
│                                                         │
│ SELECT c.name, c.region, o.product,                     │
│        SUM(o.revenue) as revenue,                       │
│        COUNT(*) as order_count                          │
│ FROM orders o                                           │
│ JOIN customers c ON o.customer_id = c.id                │
│ WHERE o.created_at >= '2025-01-01'                      │
│ GROUP BY c.name, c.region, o.product                    │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│ Plywood wraps as CTE (automatic)                        │
│                                                         │
│ WITH __with__ AS (                                      │
│   <user query>                                          │
│ )                                                       │
│ SELECT region, SUM(t.revenue)  ← Turnilo selects ONLY  │
│ FROM __with__ AS t                  needed columns      │
│ WHERE t.region = 'Europe'      ← Turnilo adds filters  │
│ GROUP BY region                ← Turnilo adds splits    │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│ Database executes combined query                        │
│ • Column pruning: only scans columns Turnilo references │
│ • Partition pruning: if filter is in inner query        │
│ • Result caching: BigQuery/Athena cache identical queries│
└─────────────────────────────────────────────────────────┘
```

## 3. Architecture

### 3.1 Data Flow: Query Definition → Turnilo Visualization

```
┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌────────────┐
│  User    │    │   Model      │    │  DataCube    │    │  Plywood   │
│  (UI)    │───▶│  (Python)    │───▶│  (Python)    │───▶│  (Node.js) │
│          │    │              │    │              │    │            │
│ Writes   │    │ Stores:      │    │ Builds:      │    │ Generates: │
│ SQL      │    │ - name       │    │ - engine     │    │ CTE-wrapped│
│ query    │    │ - table      │    │ - source     │    │ SQL with   │
│          │    │ - query (NEW)│    │ - withQuery  │    │ outer      │
│          │    │ - data_source│    │   (NEW)      │    │ SELECT     │
│          │    │              │    │ - attributes │    │            │
└──────────┘    └──────────────┘    └──────────────┘    └─────┬──────┘
                                                              │
                                                              ▼
                                                        ┌────────────┐
                                                        │  Database  │
                                                        │            │
                                                        │ Executes   │
                                                        │ combined   │
                                                        │ CTE query  │
                                                        └─────┬──────┘
                                                              │
                                                              ▼
                                                        ┌────────────┐
                                                        │  Turnilo   │
                                                        │  (React)   │
                                                        │            │
                                                        │ Displays   │
                                                        │ OLAP viz   │
                                                        └────────────┘
```

### 3.2 Key Integration Points

| Component                | File                                                 | Current                                                    | Change                                      |
| ------------------------ | ---------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------- |
| **Model**                | `redash/models/models.py`                            | `table` field only                                         | Add `query` field (TEXT, nullable)          |
| **DataCube.context**     | `redash/plywood/objects/data_cube.py:105`            | `{"engine", "source", "attributes"}`                       | Add `"withQuery"` when `model.query` is set |
| **Plywood endpoint**     | `plywood/src/endpoint/plywood-endpoint.ts:33`        | `External.fromJS(context)`                                 | Already handles `withQuery` — no change     |
| **SQLExternal**          | `plywood/client/src/external/sqlExternal.ts:181`     | `WITH __with__ AS (${withQuery})`                          | Already implemented — no change             |
| **ModelConfigGenerator** | `redash/services/model_config_generator.py:156`      | Introspects table schema                                   | Add query-based introspection path          |
| **BigQueryExternal**     | `plywood/client/src/external/bigQueryExternal.ts:77` | `INFORMATION_SCHEMA.COLUMNS`                               | Add `LIMIT 0` introspection for withQuery   |
| **Model handler**        | `redash/handlers/models.py:29`                       | `require_fields(req, ("name", "data_source_id", "table"))` | Accept `query` field, validate SQL          |
| **Model serializer**     | `redash/serializers/model_serializer.py`             | Serializes table                                           | Include query field                         |
| **Migration**            | New migration file                                   | —                                                          | Add `query` column to `models` table        |

## 4. Engine-Specific Analysis

### 4.1 Column Pruning (All Engines)

Plywood's `SQLExternal.getQueryAndPostTransform()` (`sqlExternal.ts:200`) uses `getSelectedAttributes()` to select only columns needed by the current Turnilo operation. It never generates `SELECT *` from the CTE. This means:

| Engine         | Column Pruning Through CTE                                                                                                                                                             | Verification Command                                                                |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| **PostgreSQL** | Yes — CTE inlined by default since PG12 (`NOT MATERIALIZED` is default for single-ref non-recursive CTEs). Multi-ref CTEs are materialized — use `NOT MATERIALIZED` to force inlining. | `EXPLAIN (ANALYZE, COSTS, BUFFERS) <query>`                                         |
| **BigQuery**   | Yes — non-recursive CTEs are always inlined; columnar storage only scans referenced columns. CTE referenced N times = executed N times (no materialization).                           | `bq query --dry_run --use_legacy_sql=false '<query>'` → check `totalBytesProcessed` |
| **MySQL**      | Yes — MySQL 8.0+ uses cost-based decision between merging (inlining) and materializing. Control via `/*+ MERGE(cte_name) */` or `/*+ NO_MERGE(cte_name) */` optimizer hints.           | `EXPLAIN FORMAT=JSON <query>` → check `used_partitions`                             |
| **Athena**     | Yes — Trino always inlines CTEs. CTE referenced N times = executed N times (no materialization). Columnar formats (Parquet/ORC) support column pruning.                                | Athena workgroup → check `DataScannedInBytes` via `GetQueryExecution` API           |

### 4.2 Partition Pruning (Critical — Highest Risk)

**This is the #1 cost risk.** Partition filters must reach the base table for pruning to work.

#### BigQuery

**Behavior:** BigQuery's `require_partition_filter` enforcement is **syntactic, not semantic** — it checks whether the query text contains a direct predicate on the partition column referencing the table, not whether the optimizer would ultimately prune partitions. This means:

- `require_partition_filter` on the table will REJECT queries where the partition filter is only in the outer query (even though the optimizer could theoretically push it down)
- Partition filters in the CTE's WHERE clause always work
- Subquery-based filters like `WHERE dt IN (SELECT MAX(dt) FROM table)` do NOT satisfy `require_partition_filter`
- Wrapping the partition column in any function (`TIMESTAMP(ts)`, `DATE(ts)`, `CAST(...)`) breaks both the check and actual pruning
- JOINs where the partition filter comes from another table — BigQuery does NOT do dynamic partition pruning from join conditions

**Recommended pattern:**

```sql
-- SAFE: Partition filter INSIDE the CTE
WITH __with__ AS (
  SELECT * FROM sales
  WHERE _PARTITIONDATE >= '2025-01-01'  -- ← partition filter here
)
SELECT region, SUM(revenue) FROM __with__ AS t GROUP BY region

-- RISKY: Partition filter only in outer query
WITH __with__ AS (
  SELECT * FROM sales  -- ← no partition filter = may scan all partitions
)
SELECT region, SUM(revenue) FROM __with__ AS t
WHERE t._PARTITIONDATE >= '2025-01-01'  -- ← may not push down
GROUP BY region
```

**Safeguard:** For BigQuery tables with `require_partition_filter=true`, validate that the user's query contains a WHERE clause on the partition column. Reject at save time if missing.

**Verification:** `bq query --dry_run` reports `totalBytesProcessed`. Compare with and without partition filter. If equal → partition pruning failed.

#### Athena

**Behavior:** Athena (Trino v3) can push **static literal** partition filters through CTEs, but does NOT support **dynamic partition pruning** — filters from subqueries, joins, or computed expressions will NOT prune.

- **`WHERE dt = (SELECT MAX(dt) FROM table)`** → FULL TABLE SCAN. This is the most common CTE problem.
- Functions on partition columns (`year(dt)`, `date_format(...)`) block pruning.
- Filter derived from JOIN conditions — no dynamic pruning.

**Hive vs Iceberg partition pruning differences:**

| Aspect             | Hive-style                                        | Iceberg                                                              |
| ------------------ | ------------------------------------------------- | -------------------------------------------------------------------- |
| Pruning mechanism  | Metastore lookup by partition key values          | Manifest-level file pruning with min/max stats                       |
| Filter requirement | Must filter on exact partition column name        | Can filter on source column; Iceberg maps to partition transform     |
| CTE behavior       | Filter must use literal partition column in WHERE | Filter on source column works; Iceberg resolves the mapping          |
| Granularity        | Partition-level only                              | File-level (can skip individual files within a partition)            |
| Transform support  | None — `WHERE year(dt) = 2026` breaks pruning     | `WHERE dt >= '2026-01-01'` prunes even if partitioned by `month(dt)` |

**Safeguard:** Athena workgroup setting `bytesScannedCutoffPerQuery` acts as a hard limit — queries exceeding this are automatically cancelled. Set per-customer workgroup.

```bash
aws athena update-work-group \
  --work-group "production" \
  --configuration-updates '{"BytesScannedCutoffPerQuery": 10737418240}'  # 10 GB limit
```

**Verification:** `EXPLAIN ANALYZE SELECT ...` → compare actual rows/bytes read with and without filter. Check `DataScannedInBytes` via `aws athena get-query-execution --query-execution-id <id>`.

#### PostgreSQL

**Behavior:** PostgreSQL's partition pruning works through CTEs since PG12 (CTEs are not materialized by default). However:

- `MATERIALIZED` hint forces materialization → defeats partition pruning
- Dynamic partition pruning (runtime) works for simple predicates

**Safeguard:** Ensure connections use PG12+ and CTEs don't use `MATERIALIZED` hint.

**Verification:** `EXPLAIN (ANALYZE)` → look for "Partitions removed" in plan output.

#### MySQL

**Behavior:** MySQL's partition pruning effectively does NOT push through CTEs. MySQL evaluates partition pruning early and relies on direct WHERE clause predicates on the partitioning column. The optimizer does not reliably push partition-relevant predicates from outer queries into CTEs or derived tables.

- Any filter outside the CTE — MySQL does NOT push it down for partition pruning
- Functions on partition columns break pruning entirely
- No `MATERIALIZED`/`NOT MATERIALIZED` control (unlike PostgreSQL)

**Safeguard:** MySQL is row-store, so full table scans are less costly (no per-byte billing). Monitor with slow query log. **Always place partition filters INSIDE the user's CTE.**

**Verification:** `EXPLAIN PARTITIONS SELECT ...` → the `partitions` column shows which partitions are accessed. If it shows all partitions, pruning failed. MySQL 8.0+: `EXPLAIN FORMAT=JSON` → check `used_partitions`.

### 4.3 Partition Pruning Enforcement Strategy

```
┌─────────────────────────────────────┐
│ User saves query for OLAP cube      │
│                                     │
│ 1. Parse SQL (validate syntax)      │
│ 2. Detect table references          │
│ 3. For BigQuery/Athena:             │
│    a. Check if referenced tables    │
│       have partition filters        │
│    b. If require_partition_filter:   │
│       WARN if no partition filter   │
│    c. Run dry_run to estimate cost  │
│    d. REJECT if cost > threshold    │
│ 4. Store query if validation passes │
└─────────────────────────────────────┘
```

## 5. Security Architecture

### 5.1 Threat Model

| Threat                       | Vector                                  | Severity |
| ---------------------------- | --------------------------------------- | -------- |
| **SQL Injection**            | Malicious SQL in user query             | High     |
| **Data Exfiltration**        | Query accesses tables outside scope     | Medium   |
| **DML/DDL Execution**        | User submits INSERT/UPDATE/DROP         | Critical |
| **Resource Exhaustion**      | Query causes full scan or infinite loop | High     |
| **Cross-Tenant Data Access** | Query accesses another tenant's tables  | Critical |

### 5.2 Defense-in-Depth Layers

**Layer 1: SQL Parsing & Validation (Application Level)**

- Parse user SQL before storage using a SQL parser (e.g., `sqlparse` for Python, `sql.js` / Druid's `SqlQuery.parse()` already used in `druidSqlExternal.ts:200`)
- **Allowlist:** Only `SELECT` statements permitted. Reject any query containing:
  - DDL: `CREATE`, `ALTER`, `DROP`, `TRUNCATE`
  - DML: `INSERT`, `UPDATE`, `DELETE`, `MERGE`
  - DCL: `GRANT`, `REVOKE`
  - System: `EXEC`, `EXECUTE`, `CALL`, `SET`, `SHOW`
  - Dangerous functions: `pg_sleep`, `BENCHMARK`, `LOAD_FILE`, `INTO OUTFILE`
- **CWE-89 (SQL Injection):** The user's query is wrapped inside a CTE, not interpolated into the outer query. Plywood generates the outer SELECT/WHERE/GROUP BY from its own expression tree. This means the user CANNOT inject into the outer query's structure.
- **CWE-943 (Improper Neutralization):** Validate that the query doesn't contain multiple statements (no `;` followed by additional SQL)

**Recommended parsing library:** `node-sql-parser` (npm, 1M+ weekly downloads). Parses SQL to AST, supports MySQL/PostgreSQL/BigQuery. AST root has `type` field (`select`, `insert`, etc.). Built-in `whiteListCheck()` for table/column validation. Supports CTE syntax.

**Per-dialect dangerous function blocklist:** PostgreSQL: `query_to_xml`, `dblink`, `lo_import`, `pg_read_file`, `COPY`; MySQL: `LOAD_FILE`, `INTO OUTFILE`; BigQuery: generally safer due to sandboxed execution.

**CRITICAL LESSON — CVE-2024-39887 (Apache Superset):** Quarkslab researchers bypassed Superset's SQL parsing (which used `sqlparse`) by using PostgreSQL functions like `query_to_xml()` that accept SQL strings as parameters — the parser saw a function call, not a subquery. **Application-level SQL parsing alone is NEVER sufficient. Database-level read-only roles are the PRIMARY security boundary.** This is the consensus across Redash, Metabase, and (post-CVE) Superset.

**Reference:** [Quarkslab — Bypass Apache Superset SQL restrictions](https://blog.quarkslab.com/bypass-apache-superset-restrictions-to-perform-sql-injections.html), [CVE-2024-39887](https://github.com/advisories/GHSA-2q6j-vpvr-6pvj), [Redash security model](https://redash.io/help/open-source/admin-guide/security), [OWASP SQL Injection Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html).

**Layer 2: Database-Level Read-Only Enforcement**

| Engine     | Mechanism                                                                                                                              |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| PostgreSQL | `CREATE ROLE dr_readonly; GRANT SELECT ON ALL TABLES IN SCHEMA public TO dr_readonly;` Connect with `default_transaction_read_only=on` |
| BigQuery   | IAM role `roles/bigquery.dataViewer` (read-only, no DML/DDL). Use `maximumBytesBilled` in job config                                   |
| MySQL      | `CREATE USER 'dr_readonly'@'%'; GRANT SELECT ON database.* TO 'dr_readonly'@'%';`                                                      |
| Athena     | IAM policy with `athena:StartQueryExecution` + S3 read-only. Workgroup `bytesScannedCutoffPerQuery`                                    |

**Layer 3: Query Timeout & Cost Limits**

| Engine     | Timeout Mechanism                          | Cost Limit                                    |
| ---------- | ------------------------------------------ | --------------------------------------------- |
| PostgreSQL | `SET statement_timeout = '30s';`           | Row estimate via `EXPLAIN`                    |
| BigQuery   | Job `timeoutMs` parameter                  | `maximumBytesBilled` in JobConfigurationQuery |
| MySQL      | `SET MAX_EXECUTION_TIME = 30000;`          | Slow query log monitoring                     |
| Athena     | Workgroup `QueryExecutionTimeoutInMinutes` | `bytesScannedCutoffPerQuery`                  |

**Layer 4: Query Cost Pre-Estimation**

Before executing a query-backed cube for the first time, run a cost estimation:

```python
# BigQuery dry run
def estimate_bigquery_cost(query: str) -> int:
    """Returns estimated bytes scanned. Costs $0 to run."""
    job_config = bigquery.QueryJobConfig(dry_run=True, use_legacy_sql=False)
    job = client.query(query, job_config=job_config)
    return job.total_bytes_processed

# Athena
# Use workgroup bytesScannedCutoffPerQuery as hard limit

# PostgreSQL
# EXPLAIN (COSTS) returns row estimates — less useful for cost but catches catastrophic plans
```

**Layer 5: Audit Logging**

- Log every query-backed model creation with: user, timestamp, query text, data source
- Log every Turnilo query execution with: bytes scanned, execution time, cache hit
- Alert on: queries scanning >1TB (BigQuery), queries taking >60s, failed partition pruning

### 5.3 Existing DR Security Infrastructure

DataReporter already enforces data source permissions via groups (`models.py:57-58` — `User.group_ids.overlap(user.group_ids)`). Query-backed models inherit the same permission model:

- Users can only create models on data sources they have access to
- The query executes with the data source's configured credentials
- No credential escalation is possible — the query runs as the data source's service account

## 6. Pre-Mortem Analysis

**Scenario:** It's 6 months after launch. What went wrong?

| #    | Failure Mode                                                                    | Severity | Occurrence | Detection | RPN    | Triage       | Mitigation                                                                                                                                                                                 |
| ---- | ------------------------------------------------------------------------------- | -------- | ---------- | --------- | ------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FM-1 | User's query does full table scan on BigQuery, $500 bill                        | 5        | 3          | 2         | 30     | MITIGATE     | Dry-run cost estimation + `maximumBytesBilled` per data source. Show estimated cost in UI before first execution.                                                                          |
| FM-2 | SQL injection via crafted CTE breaks out of withQuery wrapper                   | 5        | 1          | 2         | 10     | ACCEPT       | CTE wrapping is structurally safe — Plywood generates the outer query. SQL parser validates SELECT-only. Read-only DB role as backstop.                                                    |
| FM-3 | Partition pruning silently fails, costs spike over time                         | 4        | 4          | 4         | **64** | **MITIGATE** | For BigQuery/Athena: run dry_run on first execution, compare against expected partition-pruned size. Alert if bytes scanned > 10x expected. Add `require_partition_filter` guidance in UI. |
| FM-4 | BigQuery introspection fails on complex CTEs with UDFs                          | 3        | 3          | 2         | 18     | MITIGATE     | Use `SELECT * FROM (query) AS t LIMIT 0` for introspection. Catch errors and show user-friendly message.                                                                                   |
| FM-5 | User query has side effects (function with side effects, e.g., `pg_notify`)     | 4        | 2          | 3         | 24     | MITIGATE     | SQL parser blocklist for dangerous functions. Read-only DB role prevents writes even if function is called.                                                                                |
| FM-6 | CTE referenced multiple times in Plywood output doubles scan cost               | 4        | 1          | 3         | 12     | ACCEPT       | Plywood's `getQueryAndPostTransform()` generates a single query with one CTE reference. Not a risk in current architecture.                                                                |
| FM-7 | Query timeout blocks Turnilo UI thread, user sees spinner forever               | 3        | 3          | 2         | 18     | MITIGATE     | Per-engine query timeouts (30s default). Frontend timeout with retry/cancel. Async query execution (already implemented via Redash job system).                                            |
| FM-8 | User query works on save but breaks after schema change                         | 3        | 3          | 3         | 27     | MITIGATE     | Re-run introspection on model refresh. Show "schema changed" warning if columns disappear.                                                                                                 |
| FM-9 | Complex CTE queries produce incorrect results due to Plywood filter interaction | 4        | 2          | 4         | 32     | MITIGATE     | Plywood adds WHERE to outer query, not inner CTE. Test with edge cases: NULL handling, empty results, aggregate-then-filter patterns.                                                      |

**Highest risk: FM-3 (Partition pruning failure, RPN 64).** This is insidious because it's invisible — queries work correctly but cost 10-100x more than expected. Mitigation must be proactive (dry-run comparison) not reactive (billing alerts).

## 7. Optimization Strategies

### 7.1 Column Pruning (Already Implemented)

Plywood's `getSelectedAttributes()` ensures only needed columns appear in the outer SELECT. No changes needed. Columnar engines (BigQuery, Athena) only scan those columns.

**Verification per engine:**

| Engine     | How to Verify                | What to Check                                           |
| ---------- | ---------------------------- | ------------------------------------------------------- |
| BigQuery   | `bq query --dry_run`         | `totalBytesProcessed` matches column-pruned expectation |
| Athena     | Query stats in console       | `DataScannedInBytes`                                    |
| PostgreSQL | `EXPLAIN (ANALYZE, BUFFERS)` | `Buffers: shared read` count                            |
| MySQL      | `EXPLAIN FORMAT=JSON`        | `rows_examined`                                         |

### 7.2 Query Result Caching

| Engine     | Cache Behavior                                                                           | Duration                    | Invalidation                              |
| ---------- | ---------------------------------------------------------------------------------------- | --------------------------- | ----------------------------------------- |
| BigQuery   | Automatic for identical queries. FREE — cached results don't count toward billing        | 24 hours                    | Table modification, DML, streaming insert |
| Athena     | Workgroup setting `EnableResultReuseForQuery` (since 2023)                               | Configurable (up to 60 min) | Manual or TTL                             |
| PostgreSQL | No native query cache (PG removed it in 8.0). Use application-level caching or PgBouncer | —                           | Application-managed                       |
| MySQL      | Query cache deprecated (removed in 8.0). Use ProxySQL or application cache               | —                           | Application-managed                       |

**DataReporter opportunity:** DR already has a query result caching layer via Redash's job system. Query-backed cubes should leverage this — cache the CTE query result and serve repeated Turnilo interactions from cache.

### 7.3 Cost Estimation API Integration

```python
class QueryCostEstimator:
    """Estimate query cost before execution. Zero-cost on BigQuery."""

    @staticmethod
    def estimate_bigquery(query: str, client) -> dict:
        """Dry run — returns bytes without executing."""
        job_config = bigquery.QueryJobConfig(dry_run=True, use_legacy_sql=False)
        job = client.query(query, job_config=job_config)
        bytes_processed = job.total_bytes_processed
        estimated_cost = (bytes_processed / (1024**4)) * 6.25  # $6.25/TB
        return {
            "bytes": bytes_processed,
            "cost_usd": round(estimated_cost, 4),
            "warning": bytes_processed > 10 * (1024**3),  # >10GB warning
        }

    @staticmethod
    def estimate_athena(query: str, workgroup: str) -> dict:
        """Athena doesn't have dry_run. Use workgroup byte limits instead."""
        return {
            "safeguard": f"Workgroup {workgroup} bytesScannedCutoffPerQuery enforced",
            "recommendation": "Set per-customer byte limits in workgroup config",
        }

    @staticmethod
    def estimate_postgres(query: str, cursor) -> dict:
        """EXPLAIN for row estimate. Not cost in dollars but catches bad plans."""
        cursor.execute(f"EXPLAIN (FORMAT JSON, COSTS) {query}")
        plan = cursor.fetchone()[0][0]["Plan"]
        return {
            "total_cost": plan["Total Cost"],
            "rows": plan["Plan Rows"],
            "warning": plan["Total Cost"] > 100000,  # arbitrary threshold
        }
```

### 7.4 Predicate Pushdown Optimization

Plywood adds WHERE clauses to the outer query. For the CTE pattern, some databases push these predicates into the CTE:

| Engine           | Predicate Pushdown Through CTE                 | Recommendation                       |
| ---------------- | ---------------------------------------------- | ------------------------------------ |
| PostgreSQL (12+) | Yes — CTE is inlined, predicates push down     | Use default (no `MATERIALIZED` hint) |
| BigQuery         | Yes — non-recursive CTEs are always inlined    | No action needed                     |
| MySQL 8+         | Conditional — depends on derived table merging | Test with `EXPLAIN`                  |
| Athena           | Yes — Presto/Trino inlines CTEs                | No action needed                     |

### 7.5 Advanced Optimizations (Future)

1. **Approximate Aggregations:** Can reduce count-distinct costs by up to 93% (DoiT case study on BigQuery HLL):

   | Function              | BigQuery                       | PostgreSQL                  | Athena                |
   | --------------------- | ------------------------------ | --------------------------- | --------------------- |
   | Approx distinct count | `APPROX_COUNT_DISTINCT()`      | `hll_add_agg()` (extension) | `approx_distinct()`   |
   | Approx percentile     | `APPROX_QUANTILES()`           | `percentile_cont()` (exact) | `approx_percentile()` |
   | HLL sketches          | `HLL_COUNT.INIT/MERGE/EXTRACT` | `hll` extension             | Built-in              |
   | Error rate            | ~0.86% at 99% CI               | Configurable                | ~2.3%                 |

   Requires Plywood changes to generate approximate functions instead of exact ones (future work).

2. **Materialized Views with Auto-Rewrite (BigQuery):** BigQuery can transparently rewrite queries to use MVs. If a query-backed cube is frequently used with the same aggregation pattern, a materialized view could serve results instantly at zero scan cost. Auto-refresh keeps MVs fresh. PostgreSQL supports `CREATE MATERIALIZED VIEW` (manual refresh). Athena supports Iceberg MVs with auto-refresh.

3. **Smart Partition Filter Injection:** If the user's query doesn't include a partition filter but Turnilo adds a time filter in the outer WHERE, rewrite the CTE to include the time filter inside it. This ensures partition pruning works on ALL engines (critical for MySQL/Athena where outer filters don't push down). Requires SQL AST manipulation via `node-sql-parser`.

4. **Query Complexity Scoring:** Analyze user queries for cost indicators (number of JOINs, table sizes, missing partition filters) and assign a complexity score. Block or warn for high-complexity queries.

5. **PostgreSQL `NOT MATERIALIZED` Injection:** For PG connections, always emit the CTE with `NOT MATERIALIZED` to guarantee inlining and predicate pushdown: `WITH __with__ AS NOT MATERIALIZED (${withQuery})`.

## 8. Implementation Plan

### Phase 1: Core (MVP)

| #   | File                                         | Change Type | Description                                                                   |
| --- | -------------------------------------------- | ----------- | ----------------------------------------------------------------------------- |
| 1   | `redash/models/models.py`                    | Edit        | Add `query = Column(db.Text, nullable=True)` field                            |
| 2   | `migrations/versions/add_query_to_models.py` | Create      | Alembic migration: `ALTER TABLE models ADD COLUMN query TEXT`                 |
| 3   | `redash/handlers/models.py`                  | Edit        | Accept `query` in POST/PUT. Validate SQL (SELECT-only, no DDL/DML)            |
| 4   | `redash/serializers/model_serializer.py`     | Edit        | Include `query` in serialized output                                          |
| 5   | `redash/plywood/objects/data_cube.py`        | Edit        | Update `context` property: add `withQuery` from `model.query` when present    |
| 6   | `redash/services/model_config_generator.py`  | Edit        | Add query-based introspection path (run `LIMIT 0` query for schema discovery) |

### Phase 2: Safety & Cost Controls

| #   | File                                              | Change Type | Description                                                                          |
| --- | ------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------ |
| 7   | `redash/services/query_validator.py`              | Create      | SQL validation: parse, allowlist SELECT-only, blocklist dangerous keywords/functions |
| 8   | `redash/services/query_cost_estimator.py`         | Create      | Per-engine cost estimation (BigQuery dry_run, Athena workgroup limits, PG EXPLAIN)   |
| 9   | `plywood/client/src/external/bigQueryExternal.ts` | Edit        | Add `withQuery` introspection via `SELECT * FROM (query) AS t LIMIT 0`               |

### Phase 3: UX & Polish

| #   | File                         | Change Type | Description                                                                            |
| --- | ---------------------------- | ----------- | -------------------------------------------------------------------------------------- |
| 10  | Frontend model creation form | Edit        | Add SQL query editor field with syntax highlighting                                    |
| 11  | Frontend cost warning        | Create      | Show estimated cost/bytes before first cube execution                                  |
| 12  | Frontend partition warning   | Create      | Warn if BigQuery table has `require_partition_filter` and query lacks partition filter |

## 9. Database & Warehousing Best Practices

### 9.1 CTE Best Practices by Engine

| Practice                                           | PG                  | BQ                     | MySQL                | Athena                 | Source                                      |
| -------------------------------------------------- | ------------------- | ---------------------- | -------------------- | ---------------------- | ------------------------------------------- |
| Non-recursive CTEs are inlined by default          | PG12+               | Always                 | 8.0+                 | Always                 | PostgreSQL docs, BigQuery query syntax docs |
| Use `NOT MATERIALIZED` hint if CTE is materialized | Yes                 | N/A                    | N/A                  | N/A                    | PG docs: `WITH` queries                     |
| Avoid `SELECT *` in CTE — list needed columns      | Recommended         | **Critical** (billing) | Recommended          | **Critical** (billing) | BigQuery best practices                     |
| Include partition filters inside CTE WHERE clause  | Recommended         | **Critical**           | N/A                  | **Critical**           | BigQuery partitioned tables docs            |
| Set query timeouts                                 | `statement_timeout` | `timeoutMs`            | `MAX_EXECUTION_TIME` | Workgroup setting      | Engine docs                                 |

### 9.2 Anti-Patterns to Prevent

1. **CTE with `SELECT *` and no WHERE on a partitioned table** — full table scan on BigQuery/Athena
2. **CTE with correlated subquery** — may prevent inlining, causes row-by-row execution
3. **Multiple CTE references in outer query** — BigQuery evaluates once per reference
4. **Functions on partition columns** — `YEAR(partition_col) = 2025` prevents partition pruning; use `partition_col >= '2025-01-01' AND partition_col < '2026-01-01'`
5. **No LIMIT on exploration queries** — add `LIMIT 10000` default for first-time queries to prevent accidental full scans

## 10. Comparison: SQL Queries vs Database Views

| Factor                     | SQL Queries (withQuery)           | Database Views                     | Winner  |
| -------------------------- | --------------------------------- | ---------------------------------- | ------- |
| DB permissions needed      | None — DR manages SQL             | CREATE VIEW required               | Queries |
| Portability across engines | CTE standard in all 4 engines     | View syntax varies                 | Queries |
| Versioning                 | In DR's own database              | In customer's DB (unversioned)     | Queries |
| Customer friction          | Zero — write SQL they know        | Need DBA involvement               | Queries |
| Plywood support            | Already built (`withQuery`)       | Would need same CTE path           | Queries |
| Performance                | Equivalent — both inline          | Equivalent — both inline           | Tie     |
| Query optimizer access     | Full — optimizer sees through CTE | Full — optimizer sees through view | Tie     |
| Existing customer views    | Must rewrite as query             | Direct support                     | Views   |
| Pre-computed results       | No — computed on each query       | Materialized views possible        | Views   |
| Schema discovery           | Need `LIMIT 0` trick              | `INFORMATION_SCHEMA` works         | Views   |

**Verdict:** SQL queries are the superior default. Views can be supported later for customers who already have them — a view name works as a `table` source already.

## 11. Alternatives Considered

### 11.1 Database Views Only

**Rejected because:** Requires CREATE VIEW permissions, DBA involvement, per-database setup. Customers already have SQL queries — making them create views is unnecessary friction.

### 11.2 Materialized Tables (ETL Pipeline)

**Rejected because:** Adds latency (data staleness), requires ETL infrastructure, increases storage costs. May be offered as an optimization for high-frequency cubes in the future (see 7.5.2).

### 11.3 Plywood Expression Tree JOINs

**Rejected because:** Would require modifying Plywood's core expression tree to support JOINs — massive engineering effort with high risk. The CTE approach achieves the same result without touching Plywood internals.

## 12. Risks and Open Questions

1. **Complex CTE + Turnilo interaction edge cases:** Need integration tests for: NULL handling, empty CTE results, aggregate-then-filter patterns, Turnilo time-shift over CTE
2. **Query parameter support:** Should query-backed cubes support Redash-style `{{parameter}}` templates? Deferred to Phase 3.
3. **Query versioning:** When a user edits their query, should the old version be preserved? Consider query version history.
4. **Maximum query complexity:** Should there be a limit on query length, number of JOINs, or CTE nesting depth?

## References

- [Plywood withQuery implementation](plywood/client/src/external/sqlExternal.ts:116) — existing CTE mechanism
- [BigQuery CTE optimization](https://docs.google.com/bigquery/docs/reference/standard-sql/query-syntax) — non-recursive CTEs are not materialized
- [BigQuery dry run API](https://cloud.google.com/bigquery/docs/samples/bigquery-query-dry-run) — zero-cost estimation
- [PostgreSQL CTE inlining (PG12+)](https://www.postgresql.org/docs/12/queries-with.html) — `NOT MATERIALIZED` default
- [Athena workgroup byte limits](https://docs.aws.amazon.com/athena/latest/ug/workgroups-settings.html) — `bytesScannedCutoffPerQuery`
- [OWASP SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- [CWE-89: Improper Neutralization of Special Elements used in an SQL Command](https://cwe.mitre.org/data/definitions/89.html)
- [CWE-943: Improper Neutralization of Special Elements in Data Query Logic](https://cwe.mitre.org/data/definitions/943.html)
- [CVE-2024-39887 — Apache Superset SQL parsing bypass](https://github.com/advisories/GHSA-2q6j-vpvr-6pvj) — why SQL parsing alone is insufficient
- [Quarkslab — Bypass Apache Superset restrictions](https://blog.quarkslab.com/bypass-apache-superset-restrictions-to-perform-sql-injections.html)
- [node-sql-parser](https://www.npmjs.com/package/node-sql-parser) — SQL AST parser for validation
- [Redash Security Model](https://redash.io/help/open-source/admin-guide/security) — read-only data source connections
- [DoiT — BigQuery HLL 93% cost reduction](https://engineering.doit.com/bigquery-hll-how-we-cut-count-distinct-query-costs-by-93-using-hyperloglog-74fc369b6092)
- [Athena Partition Pruning Problem](https://medium.com/@guilhermenoronha2001/the-aws-athena-partition-pruning-problem-and-how-to-solve-it-using-dbt-c327007edde7)
- [PostgreSQL CTE Optimization Fence Removed in v12](https://www.depesz.com/2019/02/19/waiting-for-postgresql-12-allow-user-control-of-cte-materialization-and-change-the-default-behavior/)
- [MySQL 8.0 Partition Pruning](https://dev.mysql.com/doc/refman/8.4/en/partitioning-pruning.html)
