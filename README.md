<p align="center">
  <img title="Redash" src='https://redash.io/assets/images/logo.png' width="200px"/>
</p>

[![Documentation](https://img.shields.io/badge/docs-redash.io/help-brightgreen.svg)](https://redash.io/help/)
[![Datree](https://s3.amazonaws.com/catalog.static.datree.io/datree-badge-20px.svg)](https://datree.io/?src=badge)
[![Build Status](https://circleci.com/gh/getredash/redash.png?style=shield&circle-token=8a695aa5ec2cbfa89b48c275aea298318016f040)](https://circleci.com/gh/getredash/redash/tree/master)

Data Reporter is a business intelligence, data exploration and visualization web application. 
Harness the power of data big and small and explore, query, visualize, and share data from SQL data sources.

DataReporter is a fork of Turnilo which is currently available under Apache 2.0 license. DataReporter is also a fork of Redash, which is currently available under BSD-2-Clause license. DataReporter core is released under Apache 2.0 license.

DataReporter manifesto:

* High usability for non-technical users over sophisticated but rarely used features.
* Self-describing reports for users without deep domain expertise.
* Data cubes configuration as a code.
* Focus on the "big data" cloud databases
* Browser-based: Everything in your browser, with a shareable URL.
* Ease-of-use: Become immediately productive with data without the need to master complex software.
4. **Visualization and dashboards**: Create [beautiful visualizations](https://redash.io/help/user-guide/visualizations/visualization-types) with drag and drop, and combine them into a single dashboard.
5. **Sharing**: Collaborate easily by sharing visualizations and their associated queries, enabling peer review of reports and queries.
6. **Schedule refreshes**: Automatically update your charts and dashboards at regular intervals you define.
7. **Alerts**: Define conditions and be alerted instantly when your data changes.
8. **REST API**: Everything that can be done in the UI is also available through REST API.
9. **Broad support for data sources**: Extensible data source API with native support for a long list of common databases and platforms.

<img src="https://raw.githubusercontent.com/getredash/website/8e820cd02c73a8ddf4f946a9d293c54fd3fb08b9/website/_assets/images/redash-anim.gif" width="80%"/>

## Getting Started

* [Setting up Redash instance](https://redash.io/help/open-source/setup) (includes links to ready-made AWS/GCE images).
* [Documentation](https://redash.io/help/).

## Supported Data Sources

Redash supports more than 35 SQL and NoSQL [data sources](https://redash.io/help/data-sources/supported-data-sources). It can also be extended to support more. Below is a list of built-in sources:

- Amazon Athena
- Amazon DynamoDB
- Amazon Redshift
- Axibase Time Series Database
- Cassandra
- ClickHouse
- CockroachDB
- CSV
- Databricks (Apache Spark)
- DB2 by IBM
- Druid
- Elasticsearch
- Google Analytics
- Google BigQuery
- Google Spreadsheets
- Graphite
- Greenplum
- Hive
- Impala
- InfluxDB
- JIRA
- JSON
- Apache Kylin
- OmniSciDB (Formerly MapD)
- MemSQL
- Microsoft Azure Data Warehouse / Synapse
- Microsoft Azure SQL Database
- Microsoft SQL Server
- MongoDB
- MySQL
- Oracle
- PostgreSQL
- Presto
- Prometheus
- Python
- Qubole
- Rockset
- Salesforce
- ScyllaDB
- Shell Scripts
- Snowflake
- SQLite
- TreasureData
- Vertica
- Yandex AppMetrrica
- Yandex Metrica

## Getting Help

* Issues: https://github.com/getredash/redash/issues
* Discussion Forum: https://discuss.redash.io/

## Reporting Bugs and Contributing Code

* Want to report a bug or request a feature? Please open [an issue](https://github.com/getredash/redash/issues/new).
* Want to help us build **_Redash_**? Fork the project, edit in a [dev environment](https://redash.io/help-onpremise/dev/guide.html) and make a pull request. We need all the help we can get!

## Security

Please email security@redash.io to report any security vulnerabilities. We will acknowledge receipt of your vulnerability and strive to send you regular updates about our progress. If you're curious about the status of your disclosure please feel free to email us again. If you want to encrypt your disclosure email, you can use [this PGP key](https://keybase.io/arikfr/key.asc).

## License

BSD-2-Clause.
