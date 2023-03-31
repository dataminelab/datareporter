<p align="center">
  <img title="DataReporter" style="background-color: white" src="https://data-reporter-image.s3.us-east-2.amazonaws.com/datareporter-logo.png" width="200px"/>
</p>

[![Documentation](https://img.shields.io/badge/docs-redash.io/help-brightgreen.svg)](https://redash.io/help/)

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
8. **REST API**: Everything that can be done in the UI is also available through REST API.

## Getting Started

* [Setting up DataReporter instance](SETUP.md)
* [Documentation](TBD).
*
## Cloud Run Deploy Server
### Server
[![Run on Google Cloud](https://deploy.cloud.run/button.svg)](https://deploy.cloud.run?subDir=cloud-run/server&branch=feature/DR-102/datareporter-at-cloud-run)
### Worker
[![Run on Google Cloud](https://deploy.cloud.run/button.svg)](https://deploy.cloud.run?subDir=cloud-run/worker&branch=feature/DR-102/datareporter-at-cloud-run)

## Supported Data Sources

DataReporter supports initially 5 SQL. It can also be extended to support more. Below is a list of built-in sources:

- Amazon Athena
- Druid
- Google BigQuery
- MySQL
- PostgreSQL

## Getting Help

* Issues: https://github.com/dataminelab/datareporter/issues
* Discussion Forum: TBD

## Reporting Bugs and Contributing Code

* Want to report a bug or request a feature? Please open [an issue](https://github.com/dataminelab/datareporter/issues/new).
* Want to help us build **_Redash_**? Fork the project, edit in a develop branch and make a pull request. We need all the help we can get!

## Security

Please email security@datareporter.com to report any security vulnerabilities. We will acknowledge receipt of your vulnerability and strive to send you regular updates about our progress. If you're curious about the status of your disclosure please feel free to email us again.

## License

Apache-2.0-License.
