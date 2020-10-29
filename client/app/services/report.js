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
  find, get, isString,
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

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
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
    let url = `queries/${this.id}`;

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

const axiosFaike = {
  query:  (params) => {
    return new Promise((resolve, reject) => {
      getStorageItem('reportDB', (response) => {
        response = response ? JSON.parse(response) : [];
        const item = {
          api_key: "drv5jgXMfVAH8ZiAm5tMWHGrGaZSO6Q8pCLtflBZ",
          created_at: "2020-10-19T17:18:26.208Z",
          data_source_id: 1,
          description: null,
          id: 1,
          is_archived: false,
          is_draft: true,
          is_favorite: false,
          is_safe: true,
          last_modified_by_id: 1,
          latest_query_data_id: 1,
          options: {parameters: []},
          query: "select SUM(views), wiki from bigquery-public-data.wikipedia.pageviews_2020 where datehour > '2020-01-01' group by wiki;",
          query_hash: "12b08c5c845d47d2e8b748a9beb9a2b0",
          retrieved_at: "2020-10-19T17:18:37.094Z",
          runtime: 11.4343771934509,
          schedule: null,
          tags: [],
          updated_at: "2020-10-19T17:18:26.208Z",
          version: 1
        }
        if (response) {
          response = response.map((newItem) => {

            return Object.assign({}, item, newItem);
          })
          resolve(
              {
                count: response.length,
                page: 1,
                page_size: 20,
                results: response
              });
        } else {
          resolve(
              {
                count: [].length,
                page: 1,
                page_size: 20,
                results: []
              });
        }
      })
    })
  },
  get: (id) => {
    return new Promise((resolve, reject) => {
      getStorageItem('reportDB', (response) => {
        response = response ? JSON.parse(response) : [];
        const item = {
          api_key: "drv5jgXMfVAH8ZiAm5tMWHGrGaZSO6Q8pCLtflBZ",
          created_at: "2020-10-19T17:18:26.208Z",
          last_modified_by: "2020-10-19T17:18:26.208Z",
          data_source_id: 1,
          description: null,
          id: 1,
          is_archived: false,
          is_draft: true,
          is_favorite: false,
          is_safe: true,
          last_modified_by_id: 1,
          latest_query_data_id: 1,
          options: {parameters: []},
          query: "select SUM(views), wiki from bigquery-public-data.wikipedia.pageviews_2020 where datehour > '2020-01-01' group by wiki;",
          query_hash: "12b08c5c845d47d2e8b748a9beb9a2b0",
          retrieved_at: "2020-10-19T17:18:37.094Z",
          runtime: 11.4343771934509,
          schedule: null,
          tags: [],
          updated_at: "2020-10-19T17:18:26.208Z",
          version: 1
        }
        resolve(Object.assign(item, response.find(x => x.id === id)));
      })
    });
  },
  create: (item) => {
    return new Promise((resolve, reject) => {
      getStorageItem('reportDB', (response) => {
        response = response ? JSON.parse(response) : [];
        let data = []
        if (response) {
          data = response;
        }
        item.id = uuidv4();
        data.push(item);
        setStorageItem('reportDB', data, () => {
          resolve(item);
        })
      })
    });
  },
  save: (item) => {
    return new Promise((resolve, reject) => {
      getStorageItem('reportDB', (response) => {
        response = response ? JSON.parse(response) : [];
        let data = []
        if (response) {
          data = response;
        }
        data.map((model) => {
          if (model.id === item.id) {
            return Object.assign({}, model, item);
          } else {
            return model;
          }
        })
        setStorageItem('reportDB', data, () => {
          resolve(item);
        })
      })
    });
  },
  delete: (model) => {
    return new Promise((resolve, reject) => {
      getStorageItem('reportDB', (response) => {
        response = response ? JSON.parse(response) : [];
        response = response.filter((item) => model.id === item.connection)
        setStorageItem('reportDB', response, () => {
          resolve(model.id);
        })
      })
    });
  },
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
const saveOrCreateUrl = data => (data.id ? `api/queries/${data.id}` : "api/queries");
const mapResults = data => ({ ...data, results: map(data.results, getReport) });

const ReportService = {
  report: params => axiosFaike.query("api/queries", { params }).then(mapResults),
  get: data => axiosFaike.get(data.id, data).then(getReport),
  save: data => axiosFaike.post(saveOrCreateUrl(data), data).then(getReport),
  delete: data => axiosFaike.delete(`api/queries/${data.id}`),
  recent: params => axios.get(`api/queries/recent`, { params }).then(data => map(data, getReport)),
  archive: params => axios.get(`api/queries/archive`, { params }).then(mapResults),
  myReports: params => axios.get("api/queries/my", { params }).then(mapResults),
  fork: ({ id }) => axios.post(`api/queries/${id}/fork`, { id }).then(getReport),
  resultById: data => axios.get(`api/queries/${data.id}/results.json`),
  asDropdown: data => axios.get(`api/queries/${data.id}/dropdown`),
  associatedDropdown: ({ reportId, dropdownReportId }) =>
    axios.get(`api/queries/${reportId}/dropdowns/${dropdownReportId}`),
  favorites: params => axios.get("api/queries/favorites", { params }).then(mapResults),
  favorite: data => axios.post(`api/queries/${data.id}/favorite`),
  unfavorite: data => axios.delete(`api/queries/${data.id}/favorite`),
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
    return axios.post("api/queries/format", { report }).then(data => data.report);
  } else {
    return Promise.reject("Report formatting is not supported for your data source syntax.");
  }
};

extend(Report, ReportService);
