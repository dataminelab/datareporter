# DataReporter Architecture

> A merge of Redash (SQL-based BI) and Turnilo (OLAP cube exploration) into a unified data visualization platform.

---

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Directory Structure](#directory-structure)
4. [Architecture Components](#architecture-components)
5. [Data Flow](#data-flow)
6. [API Reference](#api-reference)
7. [Configuration](#configuration)
8. [Development](#development)
9. [Key Files Reference](#key-files-reference)

---

## Overview

DataReporter combines two major BI paradigms:

| Paradigm             | Origin  | Use Case                                                |
| -------------------- | ------- | ------------------------------------------------------- |
| **SQL Queries**      | Redash  | Write SQL, execute against databases, visualize results |
| **OLAP Exploration** | Turnilo | Drag-drop dimensions/measures, automatic SQL generation |

The integration allows users to switch between SQL-based queries (traditional Redash) and OLAP exploration (Turnilo), with automatic SQL translation via the Plywood server.

### High-Level Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                          Frontend (React)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────────┐   │
│  │ Query Editor │  │  Dashboards  │  │   TurniloComponent      │   │
│  │   (SQL)      │  │   (Widgets)  │  │   (OLAP UI v1.40.5)     │   │
│  └──────┬───────┘  └──────┬───────┘  └───────────┬─────────────┘   │
└─────────┼─────────────────┼──────────────────────┼─────────────────┘
          │                 │                      │
          ▼                 ▼                      ▼
┌────────────────────────────────────────────────────────────────────┐
│                    Backend API (Flask)                             │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────────┐   │
│  │ /api/queries │  │/api/dashboards│ │    /api/reports         │   │
│  └──────┬───────┘  └──────┬───────┘  └───────────┬─────────────┘   │
└─────────┼─────────────────┼──────────────────────┼─────────────────┘
          │                 │                      │
          ▼                 ▼                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Query Execution Layer                          │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Query Runners (40+)                       │   │
│  │  PostgreSQL │ MySQL │ BigQuery │ Athena │ Druid │ ...        │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
          │                                        │
          │                                        ▼
          │                           ┌─────────────────────────┐
          │                           │   Plywood Server        │
          │                           │   (TypeScript/Express)  │
          │                           │   Query Translation     │
          │                           │   Hash ↔ SQL            │
          │                           └─────────────────────────┘
          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Data Sources                                 │
│  PostgreSQL │ MySQL │ BigQuery │ Snowflake │ Druid │ Athena │ JSON  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Backend (Python/Flask)

| Component   | Technology                   | Version              |
| ----------- | ---------------------------- | -------------------- |
| Framework   | Flask                        | 2.3.2                |
| Language    | Python                       | 3.10                 |
| ORM         | SQLAlchemy                   | 1.3.24               |
| Database    | PostgreSQL                   | (psycopg2 2.9.6)     |
| Cache/Queue | Redis                        | 4.6.0                |
| Task Queue  | RQ (Redis Queue)             | 1.16.2               |
| HTTP Server | Gunicorn                     | 22.0.0               |
| API         | Flask-RESTful                | 0.3.10               |
| Auth        | Flask-Login, Authlib, PyJWT  | 0.6.0, 0.15.5, 2.4.0 |
| Security    | Flask-Talisman, Cryptography | 0.7.0, 43.0.1        |
| Monitoring  | Sentry-SDK, StatsD           | 2.8.0, 3.3.0         |
| AI          | google-genai                 | ^1.56.0              |

### Frontend (React/TypeScript)

| Component     | Technology             | Version   |
| ------------- | ---------------------- | --------- |
| Framework     | React                  | >=16.14.0 |
| Language      | TypeScript/JSX         | -         |
| Build         | Webpack                | -         |
| UI Library    | Ant Design             | 4.4.3     |
| Visualization | D3, Plotly.js, Leaflet | -         |
| Testing       | Jest, Cypress          | -         |
| Code Quality  | ESLint, Prettier       | -         |

### Plywood Server (TypeScript/Node.js)

| Component       | Technology    | Version     |
| --------------- | ------------- | ----------- |
| Runtime         | Node.js       | 18.20       |
| Framework       | Express       | 4.19.2      |
| Query Engine    | Druid Toolkit | 0.19.1      |
| Data Structures | Immutable.js  | 4.0.0-rc.14 |
| Monitoring      | Sentry        | 7.119.0     |

### Turnilo Component

| Component | Technology                   | Version |
| --------- | ---------------------------- | ------- |
| Framework | TypeScript/React             | -       |
| Origin    | Allegro Turnilo (hardforked) | 1.40.5  |
| License   | Apache 2.0                   | -       |

### Data Source Drivers

**SQL Databases:** PostgreSQL, MySQL, MS SQL Server, Druid, Athena, BigQuery, Snowflake, Oracle, Vertica, Trino/Presto

**Cloud:** Azure Kusto, Google Analytics, AWS (Boto3)

**NoSQL:** MongoDB, DynamoDB, Cassandra, Elasticsearch

**Other:** Pinot, Databend, JSON

---

## Directory Structure

```
datareporter/
├── redash/                 # Backend API and core logic (Flask)
│   ├── __init__.py         # Global init: Redis, RQ, Mail, Limiter
│   ├── app.py              # Flask app factory
│   ├── wsgi.py             # Production WSGI entry
│   ├── models/             # SQLAlchemy ORM models
│   ├── handlers/           # REST API endpoints
│   ├── query_runner/       # Data source connectors (40+)
│   ├── plywood/            # Plywood/Turnilo integration bridge
│   ├── tasks/              # RQ background jobs
│   ├── services/           # Business logic layer
│   ├── serializers/        # JSON serialization
│   ├── authentication/     # Auth strategies
│   ├── settings/           # Configuration (400+ vars)
│   └── cli/                # CLI commands
│
├── client/                 # Frontend (React)
│   ├── app/
│   │   ├── index.js        # React entry point
│   │   ├── components/     # React components
│   │   │   └── TurniloComponent/  # OLAP UI (Turnilo v1.40.5)
│   │   ├── pages/          # Page-level components
│   │   ├── services/       # API clients
│   │   └── lib/            # Shared utilities
│   ├── cypress/            # E2E tests
│   └── package.json        # Frontend dependencies
│
├── plywood/                # OLAP query translation server
│   └── src/
│       ├── app.ts          # Express app setup
│       ├── server.ts       # Server entry (port 3000)
│       ├── endpoint/       # API endpoints
│       │   ├── plywood-endpoint.ts
│       │   ├── attributes-formatter.ts
│       │   └── hash-converter.ts
│       └── formatter/      # Database-specific parsers
│           └── attributesFormatter/parsers/
│               ├── PostgresAttributeParser.ts
│               ├── MySqlAttributeParser.ts
│               ├── BigQueryParser.ts
│               └── ...
│
├── viz-lib/                # Visualization library (React)
│   └── src/                # Chart components
│
├── migrations/             # Alembic database migrations
├── tests/                  # Backend test suite
├── kubernetes/             # K8s deployment configs
├── bin/                    # Entry scripts
│   └── docker-entrypoint   # Container entry point
├── worker/                 # Supervisor config for workers
├── scripts/                # Build utilities
│
├── Dockerfile              # Multi-stage container build
├── docker-compose.yml      # Development services
├── compose.dev.yml         # Dev-specific overrides
├── pyproject.toml          # Python dependencies (Poetry)
├── Makefile                # Build commands
└── manage.py               # CLI entry point
```

---

## Architecture Components

### Backend (Flask/Python)

#### API Handlers (`redash/handlers/`)

| Handler        | File                | Purpose                           |
| -------------- | ------------------- | --------------------------------- |
| Queries        | `queries.py`        | Query CRUD, execution, formatting |
| Dashboards     | `dashboards.py`     | Dashboard CRUD, sharing, widgets  |
| Reports        | `reports.py`        | Turnilo report management         |
| Visualizations | `visualizations.py` | Visualization types and configs   |
| Data Sources   | `data_sources.py`   | Database connection management    |
| Users          | `users.py`          | User management                   |
| Groups         | `groups.py`         | Group/permission management       |
| Alerts         | `alerts.py`         | Query-based alerts                |
| Model Configs  | `model_configs.py`  | OLAP data cube definitions        |

#### Data Models (`redash/models/`)

| Model           | Purpose                      |
| --------------- | ---------------------------- |
| `Query`         | SQL query definitions        |
| `QueryResult`   | Cached query results         |
| `Dashboard`     | Dashboard containers         |
| `Widget`        | Dashboard widgets            |
| `Visualization` | Visualization configurations |
| `DataSource`    | Database connections         |
| `User`          | User accounts                |
| `Group`         | User groups with permissions |
| `Organization`  | Multi-tenant organizations   |
| `Report`        | Turnilo-based OLAP reports   |
| `Model`         | OLAP data cube definitions   |
| `Alert`         | Query-based alerts           |

#### Query Runners (`redash/query_runner/`)

Base classes:

- `BaseQueryRunner` - Abstract base for all connectors
- `BaseSQLQueryRunner` - SQL-specific base class

Key implementations:

- `postgres.py` - PostgreSQL
- `mysql.py` - MySQL
- `big_query.py` - Google BigQuery
- `athena.py` - AWS Athena
- `druid.py` - Apache Druid
- `elasticsearch.py` - Elasticsearch

#### Background Tasks (`redash/tasks/`)

| Queue               | Purpose                           |
| ------------------- | --------------------------------- |
| `periodic`          | Scheduled tasks (5-min intervals) |
| `queries`           | Query execution                   |
| `scheduled_queries` | Scheduled query runs              |
| `emails`            | Email notifications               |
| `schemas`           | Schema refresh                    |
| `default`           | General operations                |

#### Plywood Bridge (`redash/plywood/`)

| File                         | Purpose                                               |
| ---------------------------- | ----------------------------------------------------- |
| `plywood.py`                 | `PlywoodApi` class - main interface to Plywood server |
| `hash_manager.py`            | Hash serialization/deserialization for reports        |
| `objects/data_cube.py`       | OLAP DataCube model                                   |
| `objects/expression.py`      | Plywood expression objects                            |
| `parsers/query_parser_v2.py` | Query parsing with engine support                     |

### Frontend (React)

#### Key Components (`client/app/components/`)

| Component             | Purpose                               |
| --------------------- | ------------------------------------- |
| `TurniloComponent/`   | OLAP exploration UI (Turnilo v1.40.5) |
| `visualizations/`     | Visualization widget selector         |
| `queries/`            | Query editor components               |
| `dashboards/`         | Dashboard builder                     |
| `reports/`            | Report management                     |
| `dynamic-parameters/` | Query parameter handling              |

#### Pages (`client/app/pages/`)

| Page            | Route             | Purpose                 |
| --------------- | ----------------- | ----------------------- |
| `queries/`      | `/queries/:id`    | Query editor            |
| `queries-list/` | `/queries`        | Query browser           |
| `dashboards/`   | `/dashboards/:id` | Dashboard view/edit     |
| `reports/`      | `/reports`        | Report browser          |
| `report/`       | `/reports/:id`    | Report viewer (Turnilo) |
| `models/`       | `/models`         | Data cube management    |
| `data-sources/` | `/data_sources`   | Data source setup       |

### Plywood Server (TypeScript/Express)

#### Endpoints (`plywood/src/endpoint/`)

| Endpoint                             | Purpose                                 |
| ------------------------------------ | --------------------------------------- |
| `/api/v1/plywood`                    | Main query translation                  |
| `/api/v1/plywood/attributes`         | Extract dimensions/measures from schema |
| `/api/v1/plywood/attributes/engines` | List supported database engines         |
| `/api/v1/plywood/expression`         | Hash to expression conversion           |
| `/api/v1/plywood/filter-to-hash`     | Serialize filter to hash                |
| `/api/v1/plywood/hash-to-filter`     | Deserialize hash to filter              |
| `/api/v1/plywood/response-shape`     | Detect result data structure            |

#### Attribute Parsers (`plywood/src/formatter/attributesFormatter/parsers/`)

Database-specific parsers that extract column metadata:

- `PostgresAttributeParser.ts`
- `MySqlAttributeParser.ts`
- `BigQueryParser.ts`
- `AthenaParser.ts`
- `DruidParser.ts`
- `JsonAttributeParser.ts`

---

## Data Flow

### SQL Query Execution

```
1. Frontend submits query
   POST /api/queries/{id}/results

2. Backend handler (queries.py)
   ├── Validate permissions
   ├── Collect parameters
   └── Enqueue to RQ

3. RQ Worker executes
   ├── Load DataSource
   ├── Get QueryRunner (postgres, bigquery, etc.)
   ├── Execute SQL
   └── Store QueryResult

4. Return to frontend
   ├── Serialize results
   └── Render visualization
```

### Turnilo Report Execution

```
1. TurniloComponent UI
   └── User builds query (drag/drop dimensions)

2. Plywood translation
   ├── Send query state to Plywood server
   ├── AttributeParser extracts dimensions/measures
   └── Generate SQL hash

3. Report creation
   POST /api/reports { hash, model_id, ... }

4. Report execution
   ├── hash_to_result() in hash_manager.py
   ├── PlywoodApi.convert_hash_to_expression()
   ├── Translate hash → SQL
   ├── Execute via QueryRunner
   └── Return results to Turnilo UI
```

### Schema Discovery

```
1. Add data source
   POST /api/data_sources

2. Background refresh (every 30 min)
   ├── For each DataSource
   ├── QueryRunner.get_schema()
   └── Store in DataSource.schema

3. Auto-generate data cube (optional)
   POST /api/model_configs/generate
   ├── Call PlywoodApi.convert_attributes()
   ├── Parse dimensions vs measures
   └── Create Model (data cube)
```

### Database Engine Mapping

Redash data source types map to Plywood engines:

| Redash Type | Plywood Engine |
| ----------- | -------------- |
| `pg`        | `postgres`     |
| `mysql`     | `mysql`        |
| `bigquery`  | `bigquery`     |
| `athena`    | `athena`       |
| `druid`     | `druid`        |
| `json`      | `json`         |

---

## API Reference

### Main API (`/api/`)

| Endpoint                       | Methods          | Purpose                |
| ------------------------------ | ---------------- | ---------------------- |
| `/api/queries`                 | GET, POST        | List/create queries    |
| `/api/queries/{id}`            | GET, PUT, DELETE | Query CRUD             |
| `/api/queries/{id}/results`    | POST             | Execute query          |
| `/api/queries/format`          | POST             | Format SQL             |
| `/api/dashboards`              | GET, POST        | List/create dashboards |
| `/api/dashboards/{id}`         | GET, PUT, DELETE | Dashboard CRUD         |
| `/api/dashboards/{id}/widgets` | POST             | Add widget             |
| `/api/reports`                 | GET, POST        | List/create reports    |
| `/api/reports/{id}`            | GET, DELETE      | Report CRUD            |
| `/api/reports/{id}/results`    | POST             | Execute report (hash)  |
| `/api/visualizations`          | GET, POST        | Visualization types    |
| `/api/data_sources`            | GET, POST        | Data source management |
| `/api/model_configs`           | GET, POST        | Data cube configs      |
| `/api/model_configs/generate`  | POST             | Auto-generate cubes    |
| `/api/users`                   | GET, POST        | User management        |
| `/api/groups`                  | GET, POST        | Group management       |
| `/api/alerts`                  | GET, POST        | Alert management       |

### Plywood API (`http://plywood:3000/api/v1/`)

| Endpoint                      | Method | Purpose                     |
| ----------------------------- | ------ | --------------------------- |
| `/status`                     | GET    | Health check                |
| `/plywood`                    | POST   | Query translation           |
| `/plywood/attributes`         | POST   | Extract dimensions/measures |
| `/plywood/attributes/engines` | GET    | List supported engines      |
| `/plywood/expression`         | POST   | Hash to expression          |
| `/plywood/filter-to-hash`     | POST   | Serialize filter            |
| `/plywood/hash-to-filter`     | POST   | Deserialize filter          |
| `/plywood/response-shape`     | POST   | Detect result schema        |

---

## Configuration

### Environment Variables

**Core:**

```bash
REDASH_COOKIE_SECRET        # Session encryption (REQUIRED)
REDASH_DATABASE_URL         # PostgreSQL connection
REDASH_REDIS_URL            # Redis for cache/sessions
RQ_REDIS_URL                # Redis for job queue
```

**Plywood Integration:**

```bash
PLYWOOD_SERVER_URL          # Default: http://plywood-server:3000
```

**AI/LLM:**

```bash
OPENAI_API_KEY              # OpenAI integration
GEMINI_API_KEY              # Google Gemini
OLLAMA_API_URL              # Default: http://ollama:11434
```

**Email:**

```bash
REDASH_MAIL_SERVER          # SMTP server
REDASH_MAIL_PORT            # SMTP port
REDASH_MAIL_USERNAME        # SMTP credentials
REDASH_MAIL_PASSWORD
REDASH_MAIL_USE_TLS         # TLS flag
```

**Security:**

```bash
REDASH_ENFORCE_HTTPS        # Redirect HTTP to HTTPS
REDASH_COOKIES_SECURE       # Secure cookie flag
REDASH_AUTH_TYPE            # Auth method
```

**Performance:**

```bash
SQLALCHEMY_POOL_SIZE        # DB connection pool
WORKERS_COUNT               # Background workers
QUEUES                      # RQ queues to process
REDASH_SCHEMAS_REFRESH_SCHEDULE  # Minutes between refresh
```

### Docker Services

| Service         | Port       | Purpose      |
| --------------- | ---------- | ------------ |
| `server`        | 5000       | Flask API    |
| `scheduler`     | -          | RQ scheduler |
| `worker-server` | 5001       | Worker HTTP  |
| `redis`         | 6379       | Cache/queue  |
| `postgres`      | 5432       | Database     |
| `plywood`       | 3000       | OLAP server  |
| `email`         | 1080, 1025 | Mail (dev)   |

---

## Development

### Quick Start

```bash
# Start all services
docker compose up --build

# Initialize database
docker compose run server create_db

# Create test database
docker compose run --rm postgres psql -h postgres -U postgres -c "create database tests"

# Watch frontend
npm run watch
```

### Entry Points (`bin/docker-entrypoint`)

| Command         | Purpose                         |
| --------------- | ------------------------------- |
| `server`        | Production Flask (gunicorn)     |
| `dev_server`    | Development Flask (auto-reload) |
| `debug`         | Flask with debugger (PTVSD)     |
| `worker`        | RQ worker (supervisord)         |
| `dev_worker`    | Dev RQ worker (watch)           |
| `dev_scheduler` | RQ scheduler                    |
| `worker_server` | Worker HTTP server              |
| `create_db`     | Initialize tables               |
| `shell`         | Python shell                    |
| `manage`        | CLI commands                    |
| `tests`         | Run pytest                      |

### NPM Scripts

```bash
npm run build           # Production build
npm run watch           # Watch mode
npm run test            # Jest tests
npm run cypress         # E2E tests
npm run lint            # ESLint
npm run build:plywood   # Build Plywood
npm run build:viz       # Build viz-lib
```

### Makefile

```bash
make up                 # Start services
make create_database    # Init DB
make tests              # Backend tests
make frontend-unit-tests # Frontend tests
make lint               # Linting
make build              # Production build
make clean              # Clean Docker
```

---

## Key Files Reference

### Backend Core

| File                            | Purpose                       |
| ------------------------------- | ----------------------------- |
| `redash/__init__.py`            | Global init (Redis, RQ, Mail) |
| `redash/app.py`                 | Flask app factory             |
| `redash/wsgi.py`                | Production entry              |
| `redash/settings/__init__.py`   | Configuration (400+ vars)     |
| `redash/models/__init__.py`     | ORM models (1,771 lines)      |
| `redash/handlers/queries.py`    | Query API                     |
| `redash/handlers/reports.py`    | Report API                    |
| `redash/handlers/dashboards.py` | Dashboard API                 |

### Plywood Integration

| File                                  | Purpose            |
| ------------------------------------- | ------------------ |
| `redash/plywood/plywood.py`           | PlywoodApi client  |
| `redash/plywood/hash_manager.py`      | Hash serialization |
| `redash/plywood/objects/data_cube.py` | OLAP model         |

### Frontend

| File                                      | Purpose       |
| ----------------------------------------- | ------------- |
| `client/app/index.js`                     | React entry   |
| `client/app/components/TurniloComponent/` | OLAP UI       |
| `client/app/pages/queries/`               | Query editor  |
| `client/app/pages/reports/`               | Report viewer |

### Plywood Server

| File                                         | Purpose        |
| -------------------------------------------- | -------------- |
| `plywood/src/app.ts`                         | Express app    |
| `plywood/src/endpoint/`                      | API endpoints  |
| `plywood/src/formatter/attributesFormatter/` | Column parsing |

### Build & Config

| File                    | Purpose           |
| ----------------------- | ----------------- |
| `Dockerfile`            | Multi-stage build |
| `docker-compose.yml`    | Dev services      |
| `pyproject.toml`        | Python deps       |
| `client/package.json`   | Frontend deps     |
| `bin/docker-entrypoint` | Container entry   |

---

## Authentication & Security

### Auth Methods

- **API Key** - Token-based for scripts
- **OAuth 2.0** - Google, GitHub
- **SAML 2.0** - Enterprise SSO
- **LDAP** - Directory services

### Permission Levels

| Level | Access                 |
| ----- | ---------------------- |
| View  | Read-only              |
| Edit  | Modify objects         |
| Admin | Full control + sharing |

### Security Features

- CSRF protection (Flask-WTF)
- Rate limiting (Flask-Limiter)
- CSP headers (Flask-Talisman)
- Secure cookies
- Encrypted credentials (FernetEngine)
- SSH tunneling (Paramiko)

---

## Visualization Types

### Built-in (viz-lib/)

- Chart (line, bar, scatter, area)
- Table
- Heatmap
- Map (Leaflet)
- Funnel
- Gauge
- Number
- Pivot table
- Sankey
- Word cloud

### Turnilo Visualizations

- Pivot table with drill-down
- Detailed records
- Dimension/measure cross-tabs
- Time series with aggregations

---

_Generated for development reference. Last updated: 2026-02-04_
