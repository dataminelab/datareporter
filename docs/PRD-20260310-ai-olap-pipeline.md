# PRD: AI-to-OLAP Pipeline

> Natural language questions -> SQL -> OLAP cube -> Interactive exploration. Zero friction.

## Problem

Users currently must: (1) write SQL manually, (2) save as query, (3) create model manually, (4) configure dimensions/measures, (5) open in Turnilo. This is 5 steps of ceremony. The vision: ask a question, get an interactive OLAP explorer.

## Architecture

### Current Flow (Phase 1a-1b)

```
User -> NL question -> AI generates SQL -> SQL in editor -> User executes manually
```

### Target Flow (Phase 2)

```
User -> NL question -> AI generates SQL -> Smart model discovery -> Ephemeral OLAP model -> Turnilo explorer
```

### MCP Flow (Phase 2b)

```
Agent -> dr_explore("revenue by country") -> SQL + Model + Turnilo URL -> Interactive OLAP link
```

## Phases

### Phase 1a -- Backend (COMPLETE)

- AIService, 4 providers, 6-layer SQL validator, input sanitizer, audit logging, 173 tests

### Phase 1b -- React Frontend (COMPLETE)

- AIQueryBar component, useAIQuery hook, Turnilo-styled design, conversation follow-ups

### Phase 1c -- Smart Model Discovery (IN PROGRESS)

- Name heuristics: _\_id -> dimension, _\_revenue -> measure
- Aggregation detection from SQL aliases
- Improved dimension/measure classification

### Phase 1d -- Ephemeral OLAP Models

- "Explore in OLAP" button on query results
- Transient model creation (auto-expire 24h)
- One-click from SQL results to Turnilo

### Phase 2a -- AI Schema Classification

- POST /api/ai/classify-schema endpoint
- LLM suggests dims/measures using NL question context
- User review + override UI

### Phase 2b -- MCP dr_explore Tool

- Single MCP call: NL -> SQL -> Model -> Turnilo URL
- Full pipeline automation for AI agents

### Phase 2c -- Inline OLAP Panel

- Auto-show OLAP below query results
- On-the-fly ephemeral models, no clicks
- Toggle between SQL results and OLAP explorer

## Smart Model Discovery Rules

| Signal                                | Classification             | Example                       |
| ------------------------------------- | -------------------------- | ----------------------------- |
| _\_id, _\_key, \*\_code suffix        | Dimension (even if NUMBER) | user_id INT -> dimension      |
| _\_count, _\_total, \*\_amount suffix | Measure (SUM)              | order_count INT -> measure    |
| SQL alias from COUNT/SUM/AVG          | Measure                    | COUNT(\*) as total -> measure |
| TIMESTAMP/DATE type                   | timeAttribute candidate    | created_at -> time axis       |
| BOOLEAN type                          | Dimension                  | is_active -> dimension        |
| No pattern match + NUMBER             | Measure (default)          | amount -> measure             |
| No pattern match + STRING             | Dimension (default)        | name -> dimension             |

## Security Considerations

- Ephemeral models inherit data source permissions
- No new attack surface (uses existing model creation API)
- AI classification runs server-side, no LLM prompt exposure to frontend
