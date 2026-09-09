import { axios } from "@/services/axios";
import QueryResult from "./query-result";
import { get } from "lodash";

function getLatestQueryResult(queries = []) {
  for (let i = queries.length - 1; i >= 0; i -= 1) {
    const queryResult = get(queries[i], "query_result");
    if (queryResult && queryResult.data) {
      return queryResult;
    }
  }

  return null;
}

function getErrorMessage(error) {
  return get(
    error,
    "response.data.message",
    "Unknown error occurred. Please try again later.",
  );
}

class ReportResult extends QueryResult {
  constructor(data = {}) {
    super();
    this.reportId = data.report_id;

    if ("query_result" in data || "job" in data) {
      this.update(data);
    } else if ("data" in data || "queries" in data || "status" in data) {
      this.updateFromReport(data);
    }
  }

  updateFromReport(reportData) {
    const latestQueryResult = getLatestQueryResult(reportData.queries);

    if (latestQueryResult) {
      this.update({ query_result: latestQueryResult });
      return;
    }

    if (get(reportData, "data.rows") && get(reportData, "data.columns")) {
      this.update({
        query_result: {
          id: get(latestQueryResult, "id"),
          data: reportData.data,
          retrieved_at: get(latestQueryResult, "retrieved_at"),
          runtime: get(latestQueryResult, "runtime"),
        },
      });
      return;
    }

    if (reportData.status === 4 || reportData.failed) {
      this.update({
        job: {
          error: "Failed to execute report.",
          status: 4,
        },
      });
      return;
    }

    if (reportData.status) {
      this.update({
        job: {
          status: reportData.status,
        },
      });
    }
  }

  static getByReport(report, maxAge) {
    const reportResult = new ReportResult({ report_id: report.id });

    axios
      .post(`api/reports/generate/${report.model_id}`, {
        hash: report.hash,
        bypass_cache: maxAge === 0,
      })
      .then(response => {
        reportResult.updateFromReport(response);
      })
      .catch(error => {
        reportResult.update({
          job: {
            error: getErrorMessage(error),
            status: 4,
          },
        });
      });

    return reportResult;
  }
}

export default ReportResult;
