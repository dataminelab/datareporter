import moment from "moment";
import debug from "debug";
import Mustache from "mustache";
import { axios } from "@/services/axios";
import {
  zipObject,
  isEmpty,
  isArray,
  map,
  filter,
  includes,
  union,
  uniq,
  has,
  identity,
  extend,
  each,
  some,
  clone,
  find, get, isString, merge
} from "lodash";
import location from "@/services/location";

import { Parameter, createParameter } from "./parameters";
import { currentUser } from "./auth";
import ReportResult from "./report-result";

Mustache.escape = identity; // do not html-escape values

const logger = debug("redash:services:report");

function collectParams(parts) {
  let parameters = [];

  parts.forEach(part => {
    if (part[0] === "name" || part[0] === "&") {
      parameters.push(part[1].split(".")[0]);
    } else if (part[0] === "#") {
      parameters = union(parameters, collectParams(part[4]));
    }
  });

  return parameters;
}

export class Report {
  constructor(report) {
    extend(this, report);

    if (!has(this, "options")) {
      this.options = {};
    }

    if (!isArray(this.options.parameters)) {
      this.options.parameters = [];
    }
  }

  static async getData(report) {
    const data = await axios.post(`api/reports/generate/1`, { 
      hash: report.hash,
      bypass_cache: false,
    });
    if (!data) return null;
    const queries = data.queries;
    return queries[queries.length-1].query_result.data.rows;
  }

  isNew() {
    return this.id === undefined;
  }

  hasDailySchedule() {
    return this.schedule && this.schedule.match(/\d\d:\d\d/) !== null;
  }

  scheduleInLocalTime() {
    const parts = this.schedule.split(":");
    return moment
      .utc()
      .hour(parts[0])
      .minute(parts[1])
      .local()
      .format("HH:mm");
  }

  hasResult() {
    return !!(this.latest_report_data || this.latest_report_data_id);
  }

  paramsRequired() {
    return this.getParameters().isRequired();
  }

  hasParameters() {
    return this.getParametersDefs().length > 0;
  }

  prepareReportResultExecution(execute, maxAge) {
    const parameters = this.getParameters();
    const missingParams = parameters.getMissing();

    if (missingParams.length > 0) {
      let paramsWord = "parameter";
      let valuesWord = "value";
      if (missingParams.length > 1) {
        paramsWord = "parameters";
        valuesWord = "values";
      }

      return new ReportResult({
        job: {
          error: `missing ${valuesWord} for ${missingParams.join(", ")} ${paramsWord}.`,
          status: 4,
        },
      });
    }

    if (parameters.isRequired()) {
      // Need to clear latest results, to make sure we don't use results for different params.
      this.latest_report_data = null;
      this.latest_report_data_id = null;
    }

    if (this.latest_report_data && maxAge !== 0) {
      if (!this.reportResult) {
        this.reportResult = new ReportResult({
          report_result: this.latest_report_data,
        });
      }
    } else if (this.latest_report_data_id && maxAge !== 0) {
      if (!this.reportResult) {
        this.reportResult = ReportResult.getById(this.id, this.latest_report_data_id);
      }
    } else {
      this.reportResult = execute();
    }

    return this.reportResult;
  }

  getReportResult(maxAge) {
    const execute = () => ReportResult.getByReportId(this.id, this.getParameters().getExecutionValues(), maxAge);
    return this.prepareReportResultExecution(execute, maxAge);
  }

  getReportResultByText(maxAge, selectedReportText) {
    const reportText = selectedReportText || this.report;
    if (!reportText) {
      return new ReportResultError("Can't execute empty report.");
    }

    const parameters = this.getParameters().getExecutionValues({ joinListValues: true });
    const execute = () => ReportResult.get(this.data_source_id, reportText, parameters, maxAge, this.id);
    return this.prepareReportResultExecution(execute, maxAge);
  }

  getUrl(source, hash) {
    let url = `reports/${this.id}`;

    if (source) {
      url += "/source";
    }

    let params = {};
    if (this.getParameters().isRequired()) {
      this.getParametersDefs().forEach(param => {
        extend(params, param.toUrlParams());
      });
    }
    Object.keys(params).forEach(key => params[key] == null && delete params[key]);
    params = map(params, (value, name) => `${encodeURIComponent(name)}=${encodeURIComponent(value)}`).join("&");

    if (params !== "") {
      url += `?${params}`;
    }

    if (hash) {
      url += `#${hash}`;
    }

    return url;
  }

  getReportResultPromise() {
    return this.getReportResult().toPromise();
  }

  getParameters() {
    if (!this.$parameters) {
      this.$parameters = new Parameters(this, location.search);
    }

    return this.$parameters;
  }

  getParametersDefs(update = true) {
    return this.getParameters().get(update);
  }

  favorite() {
    return Report.favorite(this);
  }

  unfavorite() {
    return Report.unfavorite(this);
  }

  clone() {
    const newReport = clone(this);
    newReport.$parameters = null;
    newReport.getParameters();
    return newReport;
  }
}

class Parameters {
  constructor(report, reportString) {
    this.report = report;
    this.updateParameters();
    this.initFromReportString(reportString);
  }

  parseReport() {
    const fallback = () => map(this.report.options.parameters, i => i.name);

    let parameters = [];
    if (this.report.report !== undefined) {
      try {
        const parts = Mustache.parse(this.report.report);
        parameters = uniq(collectParams(parts));
      } catch (e) {
        logger("Failed parsing parameters: ", e);
        // Return current parameters so we don't reset the list
        parameters = fallback();
      }
    } else {
      parameters = fallback();
    }

    return parameters;
  }

  updateParameters(update) {
    if (this.report.report === this.cachedReportText) {
      const parameters = this.report.options.parameters;
      const hasUnprocessedParameters = find(parameters, p => !(p instanceof Parameter));
      if (hasUnprocessedParameters) {
        this.report.options.parameters = map(parameters, p =>
          p instanceof Parameter ? p : createParameter(p, this.report.id)
        );
      }
      return;
    }

    this.cachedReportText = this.report.report;
    const parameterNames = update ? this.parseReport() : map(this.report.options.parameters, p => p.name);

    this.report.options.parameters = this.report.options.parameters || [];

    const parametersMap = {};
    this.report.options.parameters.forEach(param => {
      parametersMap[param.name] = param;
    });

    parameterNames.forEach(param => {
      if (!has(parametersMap, param)) {
        this.report.options.parameters.push(
          createParameter({
            title: param,
            name: param,
            type: "text",
            value: null,
            global: false,
          })
        );
      }
    });

    const parameterExists = p => includes(parameterNames, p.name);
    const parameters = this.report.options.parameters;
    this.report.options.parameters = parameters
      .filter(parameterExists)
      .map(p => (p instanceof Parameter ? p : createParameter(p, this.report.id)));
  }

  initFromReportString(report) {
    this.get().forEach(param => {
      param.fromUrlParams(report);
    });
  }

  get(update = true) {
    this.updateParameters(update);
    return this.report.options.parameters;
  }

  add(parameterDef) {
    this.report.options.parameters = this.report.options.parameters.filter(p => p.name !== parameterDef.name);
    const param = createParameter(parameterDef);
    this.report.options.parameters.push(param);
    return param;
  }

  getMissing() {
    return map(
      filter(this.get(), p => p.isEmpty),
      i => i.title
    );
  }

  isRequired() {
    return !isEmpty(this.get());
  }

  getExecutionValues(extra = {}) {
    const params = this.get();
    return zipObject(
      map(params, i => i.name),
      map(params, i => i.getExecutionValue(extra))
    );
  }

  hasPendingValues() {
    return some(this.get(), p => p.hasPendingValue);
  }

  applyPendingValues() {
    each(this.get(), p => p.applyPendingValue());
  }

  toUrlParams() {
    if (this.get().length === 0) {
      return "";
    }

    const params = Object.assign(...this.get().map(p => p.toUrlParams()));
    Object.keys(params).forEach(key => params[key] == null && delete params[key]);
    return Object.keys(params)
      .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
      .join("&");
  }
}

function getErrorMessage(error) {
  return find([get(error, "response.data.message"), get(error, "response.statusText"), "Unknown error"], isString);
}
// TODO template remove after
function getStorageItem(key, callback) {

  if (typeof callback !== 'function') throw new Error('Invalid callback handler');

  const result = localStorage.getItem(key);

  if (result instanceof window.Promise) {
    result.then(callback);
  }
  else {
    callback(result);
  }
}

function setStorageItem(key, value, callback) {
  value = JSON.stringify(value);
  const result = localStorage.setItem(key, value);

  if (result instanceof window.Promise && callback) {
    result.then(callback);
  }
  else if (callback) {
    callback();
  }
}

export class ReportResultError {
  constructor(errorMessage) {
    this.errorMessage = errorMessage;
    this.updatedAt = moment.utc();
  }

  getUpdatedAt() {
    return this.updatedAt;
  }

  getError() {
    return this.errorMessage;
  }

  toPromise() {
    return Promise.reject(this);
  }

  // eslint-disable-next-line class-methods-use-this
  getStatus() {
    return "failed";
  }

  // eslint-disable-next-line class-methods-use-this
  getData() {
    return null;
  }

  // eslint-disable-next-line class-methods-use-this
  getLog() {
    return null;
  }
}

const getReport = report => new Report(report);
const saveOrCreateUrl = function (data) {
  if (data.id) {
    return `api/reports/${data.id}` 
  } else {
    return "api/reports"
  }    
}
const mapResults = data => ({ ...data, results: map(data.results, getReport) });
const normalizeCondition = {
  "greater than": ">",
  "less than": "<",
  equals: "=",
};
const transformResponse = data => {
  console.log("data", data)
  merge({}, data, {
    options: {
      op: normalizeCondition[data.options.op] || data.options.op,
    },
  });
}

function transformPublicState(report) {
  report = new Report(report);
  if (report.public_url) report.publicAccessEnabled = true;
  else report.publicAccessEnabled = false;
  return report;
}

const ReportService = {
  report: params => axios.get("api/reports", { params }).then(mapResults),
  get: data => axios.get("api/reports/" + data.id).then(getReport).then(transformPublicState),
  save: data => axios.post(saveOrCreateUrl(data), data).then(getReport),
  saveAs: data => axios.post("api/reports", data).then(getReport),
  delete: data => axios.delete(`api/reports/${data.id}`)
    .then(() => {
      window.location.href = '/reports';
    }),
  recent: params => axios.get(`api/reports/recent`, { params }).then(data => map(data, getReport)),
  archive: params => axios.get(`api/reports/archive`, { params })
    .then(mapResults),
  archiveReport: params => axios.delete(`api/reports/archive`, { params })
    .then(() => {
      window.location.href = '/reports/archive';
    }),
  myReports: params => axios.get("api/reports?type=my", { params }).then(mapResults),
  fork: ({ id }) => axios.post(`api/reports/${id}/fork`, { id }).then(getReport),
  resultById: data => axios.get(`api/reports/${data.id}/results.json`),
  asDropdown: data => axios.get(`api/reports/${data.id}/dropdown`),
  associatedDropdown: ({ reportId, dropdownReportId }) =>
    axios.get(`api/reports/${reportId}/dropdowns/${dropdownReportId}`),
  favorites: params => axios.get("api/reports/favorites", { params }).then(mapResults),
  favorite: data => axios.post(`api/reports/${data.id}/favorite`),
  unfavorite: data => axios.delete(`api/reports/${data.id}/favorite`),  
  getByToken: ({ token }) => axios.get(`api/reports/public/${token}`).then(transformPublicState),
};

ReportService.newReport = function newReport() {
  return new Report({
    report: "",
    name: "New Report",
    schedule: null,
    user: currentUser,
    options: {},
    tags: [],
    can_edit: true,
  });
};

ReportService.format = function formatReport(syntax, report) {
  if (syntax === "json") {
    try {
      const formatted = JSON.stringify(JSON.parse(report), " ", 4);
      return Promise.resolve(formatted);
    } catch (err) {
      return Promise.reject(String(err));
    }
  } else if (syntax === "sql") {
    return axios.post("api/reports/format", { report }).then(data => data.report);
  } else {
    return Promise.reject("Report formatting is not supported for your data source syntax.");
  }
};

extend(Report, ReportService);
