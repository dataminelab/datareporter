<p align="center">
  <img src="docs/images/icon-512.png" alt="DataReporter" width="80" />
</p>

<h1 align="center">DataReporter</h1>
<h3 align="center">Ask your data anything.</h3>

<p align="center">
  Open-source BI with AI. Ask questions in plain English, drag & drop dashboards, or write SQL.<br/>
  One platform, three ways to explore — your data never leaves your infrastructure.
</p>

<p align="center">
  <a href="https://www.datareporter.com">Website</a> &middot;
  <a href="#-quick-start">Quick Start</a> &middot;
  <a href="https://github.com/dataminelab/datareporter/discussions">Discussions</a>
</p>

<p align="center">
  <a href="https://github.com/dataminelab/datareporter/blob/develop/LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" alt="License"></a>
  <a href="https://github.com/dataminelab/datareporter/stargazers"><img src="https://img.shields.io/github/stars/dataminelab/datareporter?style=social" alt="GitHub Stars"></a>
  <a href="https://github.com/dataminelab/datareporter"><img src="https://img.shields.io/github/last-commit/dataminelab/datareporter?style=flat&color=22C55E" alt="Last Commit"></a>
</p>

---

<!-- TODO: Replace this comment with a GIF or screenshot of the AI chat interface
     asking "What were our top products last quarter?" and getting a chart back.
     This single image is worth more than every word below it. -->

## Quick Start

Get running in under 5 minutes:

```bash
git clone https://github.com/dataminelab/datareporter.git
cd datareporter
cp .env.example .env    # Add your AI key (OpenAI, Gemini, or use local Ollama)
docker compose up --build
docker compose run --rm server create_db
```

Open [http://localhost:5000](http://localhost:5000) and start asking questions.

## Who Is This For?

- **Business users** who want answers from data without learning SQL or waiting for the data team
- **Data analysts** who want drag-and-drop OLAP exploration alongside a full SQL editor
- **Engineering teams** who need a self-hosted BI platform with API access and config-as-code
- **Privacy-conscious organizations** that want AI-powered analytics without sending data to third parties
- **Small companies** that need Looker/Tableau-level capabilities on an open-source budget

## What Makes DataReporter Different?

**1. AI-native from the ground up.** Ask "What were our top products last quarter?" in plain English. DataReporter's AI reads your database schema, generates SQL, executes it, and returns an interactive chart. Choose between GPT, Gemini, DeepSeek, or run locally with Ollama — your data stays on your infrastructure.

**2. Three exploration modes, one platform.** Most BI tools force you into one paradigm. DataReporter gives you natural language (AI), drag & drop (OLAP), and SQL — all producing the same shareable dashboards.

**3. Auto-generated data cubes.** Connect a database, and DataReporter automatically discovers your schema and generates OLAP cubes for drag-and-drop exploration. No manual configuration needed.

## Features

**AI Engine**
- Natural language to SQL — ask questions, get charts
- Multi-provider: GPT, Gemini, DeepSeek, Ollama (local/private)
- Conversational follow-ups that refine your analysis
- AI generates SQL you can inspect, edit, and save

**Visualization**
- 14+ chart types: line, bar, scatter, area, heatmap, map, funnel, gauge, pivot table, sankey, word cloud, and more
- Drag-and-drop dashboard builder
- Scheduled refreshes and alerts
- Shareable URLs for every dashboard and report

**Enterprise Ready**
- Authentication: OAuth 2.0, SAML 2.0, LDAP, API keys
- Role-based access control with groups and organizations
- SSH tunneling to databases behind firewalls
- CSRF protection, rate limiting, CSP headers, encrypted credentials
- Deploy with Docker, Kubernetes, or Cloud Run

## Supported Data Sources

**60+ connectors** out of the box. Full drag & drop OLAP support for:

| Data Source | SQL | AI Queries | Drag & Drop |
|-------------|:---:|:----------:|:-----------:|
| Google BigQuery | Yes | Yes | Yes |
| Amazon Athena | Yes | Yes | Yes |
| Apache Druid | Yes | Yes | Yes |
| PostgreSQL | Yes | Yes | Yes |
| MySQL | Yes | Yes | Yes |

Plus Snowflake, ClickHouse, Databricks, Trino, Presto, MS SQL, Oracle, Redshift, MongoDB, Elasticsearch, Cassandra, SQLite, and [40+ more](ARCHITECTURE.md#data-source-drivers).

## Architecture

```
                    ┌─────────────────────────┐
                    │     Your Question        │
                    │  "Show me top products"  │
                    └────────────┬────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              ▼                  ▼                   ▼
        ┌──────────┐     ┌──────────┐        ┌──────────┐
        │  AI Chat │     │ Drag &   │        │   SQL    │
        │  (NLQ)   │     │   Drop   │        │  Editor  │
        └────┬─────┘     └────┬─────┘        └────┬─────┘
             │                │                    │
             ▼                ▼                    ▼
        ┌─────────────────────────────────────────────┐
        │          60+ Database Connectors             │
        └─────────────────────────────────────────────┘
             │
             ▼
        ┌──────────┐
        │ Charts,  │
        │ Tables,  │
        │ Dashboards│
        └──────────┘
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full technical overview including API reference.

## Contributing

- **Report a bug** — [Open an issue](https://github.com/dataminelab/datareporter/issues/new)
- **Suggest a feature** — [Start a discussion](https://github.com/dataminelab/datareporter/discussions)
- **Contribute code** — See [CONTRIBUTING.md](CONTRIBUTING.md) | Development setup: [SETUP.md](SETUP.md)

## Security

Email [security@datareporter.com](mailto:security@datareporter.com) to report vulnerabilities. See [SECURITY.md](SECURITY.md).

## License

[Apache License 2.0](LICENSE)

DataReporter includes code from [Redash](https://github.com/getredash/redash) (BSD-2-Clause) and [Turnilo](https://github.com/allegro/turnilo) (Apache-2.0). See [NOTICE](NOTICE) for full attribution.
