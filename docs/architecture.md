# Architecture Overview

## System Architecture

DataReporter is a fork of Redash, a data visualization and dashboarding platform. The core components are:

- **Flask API** -- Python/Flask backend serving the REST API. Handles authentication, authorization, query execution, and the AI query pipeline.
- **Celery Workers** -- Background task processing for query execution, scheduled queries, and alert evaluation. Communicates via Redis as the message broker.
- **PostgreSQL** -- Primary metadata store. Holds users, organizations, data sources, queries, dashboards, visualizations, and AI audit logs.
- **Redis** -- Message broker for Celery, caching layer, and session storage. Also used for rate limiting in multi-worker deployments.
- **React Frontend** -- Single-page application. Provides the query editor, dashboard builder, and the AI query interface.

Users connect external data sources (PostgreSQL, MySQL, BigQuery, Redshift, etc.) which DataReporter queries on their behalf using source-specific query runners.

## AI Query Pipeline

The AI natural language-to-SQL pipeline follows this flow:

```
POST /api/ai/query
  -> NLQueryResource (handler)
    -> authenticate user
    -> check execute_query permission
    -> check data source access (has_access)
    -> check rate limit
    -> AIService.generate_sql()
      -> sanitize_input(question)
      -> get_provider(provider_name)
      -> build_schema_context(data_source)
      -> build_messages(question, schema_context, engine_type)
      -> provider.get_completion(messages)
      -> parse_llm_response(raw_response)
      -> validate_sql(sql)
      -> log_ai_query(user, org, data_source, question, sql, status)
    -> return { sql, metadata }
```

On failure at any stage, the pipeline short-circuits with an appropriate error response and logs the attempt.

## Component Diagram

```
+-------------------------------------------------------+
|                    React Frontend                      |
|  AI Query UI  |  Query Editor  |  Dashboard Builder    |
+-------------------------------------------------------+
                          |
                     HTTP / REST
                          |
+-------------------------------------------------------+
|               Handler Layer (ai_query.py)              |
|  Authentication | Permission Check | Rate Limiting     |
+-------------------------------------------------------+
                          |
+-------------------------------------------------------+
|              Service Layer (services/ai/)              |
|  AIService: orchestrates the full pipeline             |
|  - Input sanitization                                  |
|  - Schema context building                             |
|  - Provider dispatch                                   |
|  - Response parsing                                    |
|  - SQL validation                                      |
|  - Audit logging                                       |
+-------------------------------------------------------+
            |                         |
+-----------------------+  +-----------------------+
|   Provider Layer      |  |   Security Layer      |
|   (providers/)        |  |                       |
|                       |  |  InputSanitizer       |
|   GeminiProvider      |  |  SQLValidator         |
|   OpenAIProvider      |  |  AuditLogger          |
|   AnthropicProvider   |  |  RateLimiter          |
|   OllamaProvider      |  |                       |
+-----------------------+  +-----------------------+
            |
   External LLM APIs
   (or local Ollama)
```

## Data Flow

Understanding what data moves where is critical for security and compliance.

**What stays on the server (never leaves):**

- LLM API keys and provider credentials
- User session tokens and authentication state
- Full query results and cached data
- Audit log records

**What is sent to the LLM provider:**

- The user's natural language question
- Schema context: table names and column names for the selected data source
- Engine type identifier (e.g., "pg", "mysql") for dialect guidance
- System prompt with behavioral constraints

No actual data rows, query results, user credentials, or API keys are sent to the LLM.

**What is returned to the frontend:**

- The generated SQL statement (after validation passes)
- Metadata: provider used, model used, validation status
- Error messages if any layer rejected the request

The frontend never receives raw LLM responses, API keys, or internal validation details beyond pass/fail status.

**What is persisted:**

- Every AI query interaction is logged to the `ai_query_log` table in PostgreSQL, including both successful and failed attempts. See the [Security](security.md) chapter for the full audit schema.
