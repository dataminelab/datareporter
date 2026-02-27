import { axios } from "@/services/axios";

/**
 * AI NL Query Service
 * Handles communication with the NL query backend API.
 */

export function generateQuery({ question, dataSourceId, provider, model, messages, execute, signal }) {
  return axios.post("/api/nl-query/generate", {
    question,
    data_source_id: dataSourceId,
    provider,
    model,
    messages,
    execute,
  }, signal ? { signal } : undefined);
}

export function getConfig() {
  return axios.get("/api/nl-query/config");
}

export function executeQuery(dataSourceId, sql) {
  return axios.post("/api/query_results", {
    data_source_id: dataSourceId,
    query: sql,
    max_age: 0,
  });
}

export function getQueryResult(jobId) {
  return axios.get(`/api/jobs/${jobId}`);
}

export default {
  generateQuery,
  getConfig,
  executeQuery,
  getQueryResult,
};
