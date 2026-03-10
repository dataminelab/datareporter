# Security: AI Query Controls

DataReporter's AI-powered natural language query feature implements defense-in-depth security. No single layer is solely responsible for safety. If any layer fails, subsequent layers catch the threat. This chapter documents all six security layers plus supporting controls.

## 1. Input Sanitization (Layer 1)

All natural language input is sanitized before reaching the LLM provider. The sanitizer applies 12+ regex patterns that detect:

- **System prompt extraction** -- attempts to reveal internal instructions ("ignore previous instructions", "show me your system prompt")
- **Role manipulation** -- attempts to reassign the LLM's role ("you are now a...")
- **Instruction override** -- attempts to alter behavior ("disregard all rules", "forget your constraints")
- **SQL injection via NL** -- SQL keywords embedded in natural language to manipulate generated output
- **Encoding attacks** -- base64, hex, unicode escapes designed to bypass pattern matching

When a pattern matches, an `InputSanitizationError` is raised immediately. The request is rejected before any LLM call is made, and the attempt is logged for audit.

## 2. Prompt Hardening (Layer 2)

System prompts sent to LLM providers are constructed with explicit boundaries:

- The LLM is instructed: "You are a SQL-only assistant." It must not answer general questions, write code in other languages, or engage in conversation.
- Output format is constrained to SQL wrapped in triple-backtick `sql` fences. Any response not matching this format is rejected during parsing.
- Refusal instructions direct the model to decline non-SQL requests with a standard refusal message rather than attempting to comply.
- Engine-type-specific guidance ensures the model generates dialect-appropriate SQL (PostgreSQL, MySQL, SQLite, etc.).
- Maximum result row limits are embedded in the prompt to prevent unbounded queries.

## 3. SQL Validation (Layer 3)

Generated SQL is validated using AST-based analysis via `sqlparse` before execution:

- **SELECT-only enforcement** -- Only SELECT statements are permitted. INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, CREATE, and GRANT are rejected.
- **CTE validation** -- WITH clauses are allowed only when the final statement is SELECT.
- **EXPLAIN gating** -- EXPLAIN is opt-in via configuration. When allowed, the inner statement is extracted and validated against all rules.
- **Dangerous function blocklist** -- Functions that access the filesystem or OS are blocked: `pg_read_file`, `pg_read_binary_file`, `LOAD_FILE`, `xp_cmdshell`, `OPENROWSET`, `BULK INSERT`, `lo_import`, `lo_export`, `COPY`, and others.
- **information_schema blocking** -- Queries against `information_schema`, `pg_catalog`, and similar system catalogs are rejected to prevent schema reconnaissance beyond what was provided in context.
- **Stacked query prevention** -- Semicolons within the SQL body are rejected to prevent execution of multiple statements.
- **Comment stripping** -- SQL comments (`--`, `/* */`) are stripped before validation to prevent obfuscation of malicious payloads.

Validation failures raise a `SQLValidationError` with a description of the violated rule. The generated SQL is never executed.

## 4. Audit Logging (Layer 4)

Every AI query is logged to the database regardless of outcome. The audit record includes:

| Field | Description |
|-------|-------------|
| `user_id` | Authenticated user who initiated the request |
| `org_id` | Organization context |
| `data_source_id` | Target data source |
| `question` | Original natural language question |
| `provider` | LLM provider used (gemini, openai, anthropic, ollama) |
| `model` | Specific model identifier |
| `generated_sql` | SQL returned by the LLM (if any) |
| `validation_passed` | Whether SQL validation succeeded |
| `execution_status` | Whether the query was executed and its result status |
| `error` | Error message if any layer rejected the request |
| `created_at` | Timestamp |

Audit logs enable incident investigation, abuse detection, and compliance reporting.

## 5. Rate Limiting (Layer 5)

Per-user daily rate limits prevent abuse and control LLM API costs:

- Limits are configurable per-organization via admin settings.
- If no org-level setting exists, the environment variable `AI_RATE_LIMIT_PER_DAY` is used (default: 50 queries per user per day).
- Rate limit state is stored in-memory per process. For multi-worker deployments, Redis-backed rate limiting is recommended to ensure accurate counts across workers.
- When the limit is exceeded, requests are rejected with a clear error message indicating when the limit resets.

## 6. Permission Enforcement (Layer 6)

AI query access is governed by DataReporter's existing permission model:

- The user must have the `execute_query` permission. Without it, the AI query endpoint returns 403.
- Data source access is checked via `has_access()`, which evaluates group-based permissions. A user can only generate SQL against data sources their groups are authorized to access.
- There is no per-object bypass mechanism. The same permission rules apply to AI queries as to manually written queries.

## Data Minimization

The schema context sent to the LLM is deliberately minimal:

- Only table names and column names are included.
- No actual data rows, sample values, or statistics are sent.
- Column types may be included for dialect accuracy, but no row-level data ever leaves the server toward the LLM.

This limits the blast radius if a provider is compromised or logs inputs.

## Provider Isolation

LLM API keys are stored server-side and never exposed to the frontend:

- Keys are configured via environment variables or admin settings stored in the database.
- The provider abstraction layer supports Gemini, OpenAI, Anthropic, and Ollama (local/self-hosted).
- API calls to LLM providers are made exclusively from the backend. The frontend receives only the generated SQL and validation status.
- Ollama support enables fully air-gapped deployments where no data leaves the network.
