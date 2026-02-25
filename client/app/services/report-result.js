import debug from "debug";
import moment from "moment";
import { axios } from "@/services/axios";
import { QueryResultError } from "@/services/query";
import { Auth } from "@/services/auth";
import { isString, uniqBy, each, isNumber, includes, extend, forOwn, get } from "lodash";
import JSONbig from "json-bigint";
import QueryResult from "./query-result";
import { Ajax } from "@/components/TurniloComponent/client/utils/ajax/ajax";

const { parse: jsonParse } = JSONbig({ storeAsString: true });
const logger = debug("redash:services:QueryResult");
const filterTypes = ["filter", "multi-filter", "multiFilter"];

function defer() {
  const result = { onStatusChange: (status) => {} };
  result.promise = new Promise((resolve, reject) => {
    result.resolve = resolve;
    result.reject = reject;
  });
  return result;
}

function getColumnNameWithoutType(column) {
  let typeSplit;
  if (column.indexOf("::") !== -1) {
    typeSplit = "::";
  } else if (column.indexOf("__") !== -1) {
    typeSplit = "__";
  } else {
    return column;
  }

  const parts = column.split(typeSplit);
  if (parts[0] === "" && parts.length === 2) {
    return parts[1];
  }

  if (!includes(filterTypes, parts[1])) {
    return column;
  }

  return parts[0];
}

function getColumnFriendlyName(column) {
  return getColumnNameWithoutType(column).replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());
}

const createOrSaveUrl = (data) => (data.id ? `api/query_results/${data.id}` : "api/query_results");
const QueryResultResource = {
  get: ({ id }) =>
    axios.get(`api/query_results/${id}`, {
      transformResponse: (response) => jsonParse(response),
    }),
  post: (data) => axios.post(createOrSaveUrl(data), data),
};

export const ExecutionStatus = {
  WAITING: "waiting",
  PROCESSING: "processing",
  DONE: "done",
  FAILED: "failed",
  LOADING_RESULT: "loading-result",
};

const statuses = {
  1: ExecutionStatus.WAITING,
  2: ExecutionStatus.PROCESSING,
  3: ExecutionStatus.DONE,
  4: ExecutionStatus.FAILED,
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function fetchDataFromJob(jobId, interval = 1000) {
  return axios.get(`api/jobs/${jobId}`).then((data) => {
    const status = statuses[data.job.status];
    if (status === ExecutionStatus.WAITING || status === ExecutionStatus.PROCESSING) {
      return sleep(interval).then(() => fetchDataFromJob(data.job.id));
    } else if (status === ExecutionStatus.DONE) {
      return data.job.result;
    } else if (status === ExecutionStatus.FAILED) {
      return Promise.reject(data.job.error);
    }
  });
}

class ReportResult extends QueryResult {
  constructor(data) {
    super(data);
    this.reportId = data.report_id;
  }

  getByReportId() {
    return new ReportResult({ report_id: this.reportId });
  }
}

export default ReportResult;
