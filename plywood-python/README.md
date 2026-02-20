# plywood-python

A pure Python library that translates [Plywood](https://github.com/implydata/plywood) expression trees into SQL queries for multiple database engines. This is a direct port of the TypeScript Plywood microservice that previously ran as a separate Docker container in the DataReporter stack.

## Origin

DataReporter uses Plywood expression trees as its internal query representation — every visualization, filter, and split that a user configures in Turnilo gets compiled into a Plywood expression tree before being translated to SQL.

Previously, this translation happened in a **TypeScript/Express.js microservice** (`plywood-server`) running as its own Docker container in Kubernetes. The Python backend communicated with it via HTTP (`PlywoodApi` class → `POST /api/v1/plywood`). This added:

- **Network overhead** on every query (HTTP round-trip per SQL translation)
- **Deployment complexity** (separate Docker image, k8s Deployment + Service, health checks)
- **Operational burden** (another container to monitor, scale, and maintain)

`plywood-python` eliminates all of this by reimplementing the translation logic as an in-process Python library. The `PlywoodLibrary` class is a drop-in replacement for `PlywoodApi` — same method signatures, same return types, zero HTTP calls.

## Architecture

```
plywood/
├── library.py              # PlywoodLibrary — the main entry point (drop-in for the former PlywoodApi)
├── formatter.py            # Flattens nested query plans into single-line SQL strings
│
├── expressions/            # Expression tree (the core)
│   ├── base.py             # Expression base class + registry dispatch
│   ├── ref.py              # RefExpression — column references ($column)
│   ├── literal.py          # LiteralExpression — values (numbers, strings, dates, sets, ranges)
│   ├── external.py         # ExternalExpression — dataset references
│   ├── aggregate.py        # Count, Sum, Average, Min, Max, CountDistinct, Quantile, Cardinality
│   ├── chain.py            # Filter, Split, Apply, Sort, Limit, Select (query structure)
│   ├── comparison.py       # Is, In, Overlap, LessThan, GreaterThan, etc.
│   ├── logical.py          # And, Or, Not
│   ├── arithmetic.py       # Add, Subtract, Multiply, Divide
│   ├── time.py             # TimeBucket, TimeFloor, TimePart, TimeRange, TimeShift
│   ├── string.py           # Contains, Match, Length, IndexOf, Substr, TransformCase, Concat, Extract
│   ├── misc.py             # Cast, Fallback, Then, NumberBucket, Absolute, Power, Lookup
│   └── sql_ref.py          # SqlRef, SqlAggregate, CustomAggregate, CustomTransform
│
├── dialect/                # SQL dialect implementations (one per database engine)
│   ├── base.py             # SQLDialect abstract base class
│   ├── postgres.py         # PostgreSQL — DATE_TRUNC, EXTRACT, "quoted_names"
│   ├── mysql.py            # MySQL — DATE_FORMAT, TIMESTAMPADD, `backtick_names`
│   ├── bigquery.py         # BigQuery — TIMESTAMP_TRUNC, FORMAT_DATETIME, `backtick_names`
│   ├── athena.py           # AWS Athena (Presto/Trino) — DATE_ADD, date_format
│   └── druid.py            # Apache Druid — LOOKUP(), TIME_FLOOR, APPROX_COUNT_DISTINCT
│
├── external/               # External data source abstraction
│   ├── base.py             # External — engine, source, attributes, dialect selection
│   └── sql_external.py     # SQLExternal — walks expression tree, assembles full SQL query
│
├── datatypes/              # Plywood type system
│   ├── common.py           # PlyType constants, type predicates (is_set_type, is_range_type)
│   ├── set.py              # Set — discrete value collections
│   ├── range.py            # NumberRange, TimeRange — continuous value ranges
│   ├── attribute_info.py   # AttributeInfo — column metadata (name, type, nativeType)
│   └── dataset.py          # Dataset — nested tabular data
│
├── attributes/             # Database column type → Plywood type mapping
│   ├── base.py             # AttributeParser base class
│   ├── factory.py          # Parser factory + engine registry
│   ├── postgres.py         # VARCHAR→STRING, INTEGER→NUMBER, TIMESTAMP→TIME, etc.
│   ├── mysql.py            # INT→NUMBER, DATETIME→TIME, TINYINT(1)→BOOLEAN, etc.
│   ├── bigquery.py         # INT64→NUMBER, TIMESTAMP→TIME, BOOL→BOOLEAN, etc.
│   ├── athena.py           # VARCHAR→STRING, BIGINT→NUMBER, etc.
│   ├── druid.py            # COMPLEX<hyperUnique>→NUMBER, etc.
│   └── json_parser.py      # Generic JSON/REST attribute parsing
│
└── turnilo/                # Turnilo hash ↔ expression conversion
    ├── hash_codec.py       # LZ-string compress/decompress (filter_to_hash, hash_to_filter)
    └── hash_to_expression.py  # Turnilo state → Plywood expression tree
```

## How It Works

### Expression Trees

Every query starts as a Plywood expression tree — a nested JSON structure that describes what data to fetch and how to transform it. For example, a query like "show me page views by country for the last 7 days" becomes:

```python
{
    "op": "chain",
    "expression": {"op": "ref", "name": "main"},
    "actions": [
        {"action": "filter", "expression": {
            "op": "overlap",
            "operand": {"op": "ref", "name": "__time"},
            "expression": {"op": "literal", "type": "TIME_RANGE", "value": {
                "start": "2026-02-07T00:00:00Z",
                "end": "2026-02-14T00:00:00Z"
            }}
        }},
        {"action": "split", "name": "Country",
         "expression": {"op": "ref", "name": "country"}},
        {"action": "apply", "name": "PageViews",
         "expression": {"op": "sum",
                        "operand": {"op": "ref", "name": "main"},
                        "expression": {"op": "ref", "name": "page_views"}}},
        {"action": "sort", "expression": {"op": "ref", "name": "PageViews"},
         "direction": "descending"},
        {"action": "limit", "value": 10}
    ]
}
```

### Expression → SQL Pipeline

```
Expression JSON  →  Expression.from_js()  →  Expression tree (Python objects)
                                                       │
                                                       ▼
                                              SQLExternal.get_query_and_post_transform()
                                                       │
                                              walks tree: extracts filters, splits,
                                              applies, sort, limit
                                                       │
                                              each node calls get_sql(dialect)
                                                       │
                                              dialect returns engine-specific SQL
                                                       │
                                                       ▼
                                              Assembled SQL query string
```

The same expression tree produces different SQL depending on the dialect:

| Engine | `time_floor("__time", "P1D")` |
|--------|------------------------------|
| PostgreSQL | `DATE_TRUNC('day', "__time")` |
| MySQL | `DATE_FORMAT(CONVERT_TZ("__time",'+0:00','UTC'), '%Y-%m-%d 00:00:00Z')` |
| BigQuery | `FORMAT_DATETIME('%Y-%m-%d 00:00:00Z', CAST("__time" AS DATETIME))` |
| Athena | `DATE_FORMAT("__time", '%Y-%m-%d 00:00:00Z')` |
| Druid | `TIME_FLOOR("__time", 'P1D')` |

### Expression Registry

All 55 expression types register themselves with `Expression._registry` at import time. When `Expression.from_js({"op": "sum", ...})` is called, it dispatches to `SumExpression.from_js()` automatically. Adding a new expression type is as simple as:

```python
class MyExpression(Expression):
    op = "MyOp"

    @classmethod
    def from_js(cls, js: dict) -> MyExpression:
        return cls(cls._js_to_value(js))

    def get_sql(self, dialect) -> str:
        return f"MY_FUNC({self.operand.get_sql(dialect)})"

Expression.register(MyExpression)
```

## Usage Reference

### PlywoodLibrary

The main entry point. All methods are `@classmethod` — no instantiation needed.

#### `convert_to_sql(body: dict) -> List[str]`

Translates an expression tree + context into SQL queries.

```python
from plywood import PlywoodLibrary

queries = PlywoodLibrary.convert_to_sql({
    "expression": {
        "op": "chain",
        "expression": {"op": "ref", "name": "main"},
        "actions": [
            {"action": "apply", "name": "Count",
             "expression": {"op": "count",
                            "operand": {"op": "ref", "name": "main"}}}
        ]
    },
    "context": {
        "engine": "postgres",
        "source": "events",
        "attributes": [
            {"name": "id", "type": "NUMBER"},
            {"name": "event_name", "type": "STRING"},
            {"name": "__time", "type": "TIME"}
        ]
    },
    "dataCube": "main"
})
# queries = ["SELECT COUNT(*) AS \"Count\" FROM \"events\" AS t GROUP BY ''"]
```

#### `get_supported_engines() -> List[str]`

Returns the list of supported database engines.

```python
PlywoodLibrary.get_supported_engines()
# ['postgres', 'mysql', 'bigquery', 'athena', 'druid', 'json']
```

#### `convert_attributes(redash_db_type: str, attributes: list) -> List[dict]`

Maps raw database column types to Plywood types.

```python
PlywoodLibrary.convert_attributes("pg", [
    {"name": "id", "type": "INTEGER"},
    {"name": "name", "type": "CHARACTER VARYING"},
    {"name": "created_at", "type": "TIMESTAMP WITHOUT TIME ZONE"},
])
# [
#     {"name": "id", "type": "NUMBER", "nativeType": "INTEGER"},
#     {"name": "name", "type": "STRING", "nativeType": "CHARACTER VARYING"},
#     {"name": "created_at", "type": "TIME", "nativeType": "TIMESTAMP WITHOUT TIME ZONE"},
# ]
```

#### `convert_hash_to_expression(hash_str: str, data_cube: dict) -> dict`

Converts a Turnilo URL hash into a Plywood expression tree.

```python
PlywoodLibrary.convert_hash_to_expression("N4IgZg...", {
    "name": "main",
    "engine": "postgres",
    "source": "events",
    "attributes": [...]
})
```

#### `filter_to_hash(json_obj) -> str` / `hash_to_filter(hash_str) -> Any`

Round-trip LZ-string compression for Turnilo filter state.

```python
h = PlywoodLibrary.filter_to_hash({"country": "UK", "active": True})
obj = PlywoodLibrary.hash_to_filter(h)
# obj == {"country": "UK", "active": True}
```

#### `get_shape(body: dict) -> dict`

Returns the simulated response shape (column names and types) without executing the query.

## Integration Guide

### Replacing PlywoodApi with PlywoodLibrary

The library is designed as a drop-in replacement. The migration requires changes in 3 Python files:

**1. `redash/plywood/plywood.py`** — swap the class:

```python
# Before:
import requests
from redash.settings import PLYWOOD_SERVER_URL

class PlywoodApi:
    PLYWOOD_URL = "{}/api/v1/plywood".format(PLYWOOD_SERVER_URL)

    @classmethod
    def convert_to_sql(cls, body):
        data = cls.execute(cls.PLYWOOD_URL, body)
        queries = data["queries"]
        return list(itertools.chain.from_iterable(queries))
    # ... HTTP calls for every method

# After:
from plywood import PlywoodLibrary as PlywoodApi
# That's it. All downstream code uses PlywoodApi.convert_to_sql(), etc. unchanged.
```

**2. `redash/settings/__init__.py`** — remove or comment out:

```python
# PLYWOOD_SERVER_URL = os.environ.get("PLYWOOD_SERVER_URL", "http://plywood-server:3000")
```

**3. `requirements.txt` / `pyproject.toml`** — add the dependency:

```
plywood @ file:///path/to/plywood-python
# or if published to a registry:
plywood>=0.1.0
```

### Infrastructure to Remove

Once integrated, the following infrastructure becomes unnecessary:

| What | Files |
|------|-------|
| **Docker Compose** plywood service | `docker-compose.yml`, `compose.dev.yml`, `.ci/compose.cypress.yml`, `.ci/compose.ci.yml`, `.gcloud/docker-compose.server.yaml` |
| **Kubernetes** plywood deployment + service | `kubernetes/base/datareporter/plywood-deployment.yaml`, `plywood-service.yaml` |
| **Kustomization** references | `kubernetes/base/datareporter/kustomization.yaml`, `kubernetes/overlays/staging/kustomization.yaml` |
| **ConfigMap** env vars | `PLYWOOD_SERVER_SCHEMA`, `PLYWOOD_SERVER_HOSTNAME`, `PLYWOOD_SERVER_PORT` in `env-configmap.yaml` |
| **Scripts** plywood URL construction | `scripts-configmap.yaml` (lines 100-105) |
| **CI/CD** plywood build/push | `Jenkinsfile` (plywood-server stages), `.github/workflows/release.yaml` (build_plywood job) |
| **Dependabot** plywood deps monitoring | `.github/dependabot.yml` (plywood-server + plywood-client entries) |
| **Dockerfile** | `plywood/Dockerfile` |

### Files That Import PlywoodApi (No Changes Needed)

These files import `PlywoodApi` from `redash.plywood.plywood` and will automatically use the new library after the swap in step 1:

- `redash/plywood/objects/data_cube.py`
- `redash/plywood/objects/expression.py`
- `redash/services/model_config_generator.py`
- `tests/handlers/test_reports.py` (mocks)
- `tests/services/test_model_config_generator.py` (mocks)

## Supported Expression Types (55)

| Category | Types |
|----------|-------|
| **References** | `ref`, `literal`, `external` |
| **Chain ops** | `filter`, `split`, `apply`, `sort`, `limit`, `select` |
| **Aggregations** | `count`, `sum`, `average`, `min`, `max`, `countDistinct`, `quantile`, `cardinality` |
| **Comparison** | `is`, `in`, `overlap`, `lessThan`, `lessThanOrEqual`, `greaterThan`, `greaterThanOrEqual` |
| **Logical** | `and`, `or`, `not` |
| **Arithmetic** | `add`, `subtract`, `multiply`, `divide` |
| **Time** | `timeBucket`, `timeFloor`, `timePart`, `timeRange`, `timeShift` |
| **String** | `contains`, `match`, `length`, `indexOf`, `substr`, `transformCase`, `concat`, `extract` |
| **Misc** | `cast`, `fallback`, `then`, `numberBucket`, `absolute`, `power`, `lookup` |
| **SQL** | `sqlRef`, `sqlAggregate`, `customAggregate`, `customTransform` |

## Supported SQL Dialects

| Engine | Identifier quoting | Time functions | Notable features |
|--------|-------------------|----------------|-----------------|
| **PostgreSQL** | `"double_quotes"` | `DATE_TRUNC`, `EXTRACT`, `AT TIME ZONE` | `INTERVAL` arithmetic, `POSITION()` for contains |
| **MySQL** | `` `backticks` `` | `DATE_FORMAT`, `DATE_ADD/SUB`, `CONVERT_TZ` | `LOCATE()` for contains, `<=>` null-safe equality |
| **BigQuery** | `` `backticks` `` | `DATETIME_TRUNC`, `FORMAT_DATETIME`, `TIMESTAMP_ADD` | `REGEXP_CONTAINS`, `TIMESTAMP_MILLIS` |
| **Athena** | `"double_quotes"` | `DATE_TRUNC` (week/quarter), `DATE_FORMAT`, `DATE_ADD` | Presto/Trino function set, `regexp_like` |
| **Druid** | `"double_quotes"` | `TIME_FLOOR`, `TIME_SHIFT`, `TIMESTAMPDIFF` | `LOOKUP()`, `APPROX_COUNT_DISTINCT`, `DS_QUANTILES_SKETCH` |

## Plywood Type System

| Plywood Type | Python equivalent | SQL mapping |
|-------------|-------------------|-------------|
| `STRING` | `str` | `VARCHAR`, `TEXT`, `CHAR`, `STRING` |
| `NUMBER` | `int`, `float` | `INTEGER`, `BIGINT`, `FLOAT`, `DOUBLE`, `NUMERIC`, `INT64` |
| `TIME` | `datetime` | `TIMESTAMP`, `DATETIME`, `DATE` |
| `BOOLEAN` | `bool` | `BOOLEAN`, `TINYINT(1)`, `BOOL` |
| `NULL` | `None` | `NULL` |
| `NUMBER_RANGE` | `NumberRange` | `BETWEEN` expressions |
| `TIME_RANGE` | `TimeRange` | `BETWEEN` expressions on timestamps |
| `SET/STRING` | `Set` | `IN (...)` expressions |
| `SET/NUMBER` | `Set` | `IN (...)` expressions |
| `DATASET` | `Dataset` | Subquery results |

## Development

### Prerequisites

- Python 3.10+
- `lzstring` package (for Turnilo hash encoding)

### Setup

```bash
cd plywood-python
pip install -e ".[dev]"
```

### Running Tests

```bash
# All tests
pytest

# With coverage
pytest --cov=plywood --cov-report=term-missing

# Specific module
pytest tests/test_dialects.py -v

# Single test
pytest tests/test_expressions.py::test_ref_expression_get_sql -v
```

### Test Suite

462 tests covering all modules:

| File | Tests | Coverage |
|------|-------|----------|
| `test_datatypes.py` | 110 | Type system, Set, NumberRange, TimeRange, AttributeInfo, Dataset |
| `test_expressions.py` | 129 | All 55 expression types: from_js, get_sql, to_js, edge cases |
| `test_dialects.py` | 109 | All 5 dialects: quoting, time functions, casts, contains, regex |
| `test_attributes.py` | 62 | All 6 attribute parsers: type mapping, edge cases, factory |
| `test_hash.py` | 11 | LZ-string round-trip, compression, unicode, determinism |
| `test_library.py` | 24 | PlywoodLibrary methods, engine mapping, attribute conversion |
| `test_formatter.py` | 10 | Query plan flattening, newline joining, dict handling |

## Porting Notes

This library was ported from the following TypeScript sources:

| Python module | TypeScript source |
|---------------|------------------|
| `expressions/base.py` | `plywood/client/src/expressions/baseExpression.ts` |
| `expressions/aggregate.py` | `plywood/client/src/expressions/{sum,count,...}Expression.ts` |
| `dialect/postgres.py` | `plywood/client/src/dialect/postgresDialect.ts` |
| `dialect/mysql.py` | `plywood/client/src/dialect/mySqlDialect.ts` |
| `dialect/bigquery.py` | `plywood/client/src/dialect/bigQueryDialect.ts` |
| `dialect/athena.py` | `plywood/client/src/dialect/awsAthenaDialect.ts` |
| `dialect/druid.py` | `plywood/client/src/dialect/druidDialect.ts` |
| `external/sql_external.py` | `plywood/client/src/external/sqlExternal.ts` |
| `attributes/*.py` | `plywood/src/formatter/attributesFormatter/parsers/*.ts` |
| `turnilo/hash_codec.py` | `plywood/src/turnilo/dataminelab/hash-converter.ts` |

Key design decisions during the port:

- **Registry pattern** preserved — `Expression.register(cls)` at module load time, dispatch via `Expression.from_js()`
- **Dialect abstraction** preserved — abstract `SQLDialect` base with engine-specific subclasses
- **No async** — all operations are synchronous (no I/O involved)
- **No external dependencies** beyond `lzstring` — the TS original had Express, body-parser, etc. for HTTP; none of that is needed
- **Python conventions** — snake_case methods, type hints, dataclasses where appropriate
