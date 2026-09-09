/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2019 Allegro.pl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import axios from "axios";
import { Dataset, DatasetJS, Executor, Expression, LimitExpression, FilterExpression } from "plywood";
import { DataCube } from "../../../common/models/data-cube/data-cube";
import { setPriceButton } from "../ajax/ReportPageHeaderUtils";
import { urlHashConverter } from "../../../common/utils/url-hash-converter/url-hash-converter";
import { Essence } from "../../../common/models/essence/essence";

interface Meta {
  price: number;
  proceed_data: number;
}

interface APIResponse {
  meta: Meta;
  status: number;
  data: DatasetJS;
}

const EmptyDataset = Dataset.fromJS([]);

function getClientTimeoutDefault(): number {
  const ls = safeLocalStorage();
  const docker_timeout = ls ? ls.getItem("CLIENT_TIMEOUT") : undefined;
  return docker_timeout && docker_timeout !== "undefined" ? Number(docker_timeout) : 100000;
}

function clientTimeout(dataCube: DataCube): number {
  const clusterTimeout = Number((dataCube && dataCube.cluster && dataCube.cluster.getTimeout()) || 0);
  return getClientTimeoutDefault() + clusterTimeout;
}

let reloadRequested = false;

function reload() {
  if (reloadRequested) return;
  reloadRequested = true;
  window.location.reload();
}

function getHash() {
  return window.location.hash ? window.location.hash.substring(window.location.hash.indexOf("4/") + 2) : "";
}

export interface AjaxOptions {
  method: "GET" | "POST";
  url: string;
  timeout?: number;
  data?: any;
}

const validateStatus = (s: number) => (200 <= s && s < 300) || s === 304;

export class Ajax {
  static version: string;
  static settingsVersionGetter: () => number;
  static onUpdate: () => void;
  public static model_id: number;
  private static results: any;
  public static hash: string;

  static setInitialResults(results: any): void {
    Ajax.results = results;
  }

  static hasReadyResults(results: any): boolean {
    if (!results || !Array.isArray(results.queries) || results.queries.length === 0) {
      return false;
    }

    return results.queries.every((query: any) => Boolean(query && query.query_result && query.query_result.data));
  }

  static query<T>({ data, url, timeout, method }: AjaxOptions): Promise<T> {
    return axios({ method, url, data, timeout, validateStatus })
      .then((res) => {
        if (res && res.data.action === "update" && Ajax.onUpdate) Ajax.onUpdate();
        else if (
          (res.data.progress.results !== res.data.progress.all || res.data.progress.progress !== 100) &&
          Ajax.onUpdate
        )
          Ajax.onUpdate();
        return res.data;
      })
      .catch((error) => {
        if (error.response && error.response.data) {
          if (error.response.data.action === "reload") reload();
          else if (error.response.data.action === "update" && Ajax.onUpdate) Ajax.onUpdate();
          const message = error.response.data.message || error.message;
          throw new Error("error with response: " + error.response.status + ", " + message);
        } else if (error.request) {
          throw new Error("no response received, " + error.message);
        } else {
          throw new Error(error.message);
        }
      });
  }

  static queryUrlExecutorFactory(
    dataCube: DataCube,
    getEssence: () => Essence,
    statusCallback?: (status: any) => void,
    getExecutionStatus?: () => string
  ): Executor {
    const timeout = clientTimeout(dataCube);

    function getEssenceIfExists() {
      return getEssence ? getEssence() : null;
    }

    function timeoutQuery(ms: number) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async function subscribe(input: AjaxOptions): Promise<APIResponse> {
      const { data, method, timeout, url } = input;
      const ls = safeLocalStorage();
      if (ls) {
        data.bypass_cache = ls.getItem("bypass_cache") === "true";
        ls.removeItem("bypass_cache");
      }
      const res = await Ajax.query<APIResponse>({ method, url, timeout, data })
        .then((result) => {
          if (getExecutionStatus() === "cancelling") {
            statusCallback({
              reportResult: null,
              loadedInitialResults: true,
              error: null,
              status: "done",
              isExecuting: false,
              isCancelling: false,
              executionStatus: null,
            });
            throw new Error("Query cancelled by user");
          }
          return result;
        })
        .catch((error) => {
          statusCallback({ status: "failed", isExecuting: false, error });
          throw error;
        });
      const urlHash = getHash();
      if (!url.endsWith("filter") && urlHash && data.hash !== urlHash) {
        console.warn(`Hash mismatch: expected ${data.hash}, got ${urlHash}`);
        return res;
      } else if ([1, 2].indexOf(res.status) >= 0) {
        await timeoutQuery(2000);
        return await subscribe(input);
      } else {
        statusCallback({ status: "done", isExecuting: false });
        return res;
      }
    }

    async function subscribeToFilter(ex: LimitExpression | Expression, modelId: number) {
      const method = "POST";
      const url = `api/reports/generate/${modelId}/filter`;
      const data = { expression: ex.toJS() };
      statusCallback({ status: "processing", isExecuting: true });
      return subscribe({ method, url, timeout, data });
    }

    async function subscribeToSplit(hash: string, modelId: number) {
      const method = "POST";
      let url;
      statusCallback({ status: "processing", isExecuting: true });
      const publicPathMatch = window.location.pathname.match(/\/public\/(?:dashboards|reports)\/([^/]+)/);
      if (publicPathMatch && publicPathMatch[1]) {
        const apiKey = decodeURIComponent(publicPathMatch[1]);
        url = `api/reports/generate/${modelId}/public?api_key=${apiKey}`;
      } else {
        url = `api/reports/generate/${modelId}`;
      }
      const data = { hash };
      return subscribe({ method, url, timeout, data });
    }

    function parseMeta(sub: APIResponse) {
      // This function parses the meta information from the subscription response
      // how much the query costs and how much data has been processed
      const meta = sub.meta;
      if (!meta) return;
      // TODO: proceed_data is a byte type, parse it better, use big int
      // TODO: make it also visible on dashboard page
      setPriceButton(Number(meta.price), Number(meta.proceed_data), false);
    }

    function getHashForExpression(): string {
      const essence = getEssenceIfExists();
      return essence ? urlHashConverter.toHash(essence).substring(2) : getHash() || Ajax.hash;
    }

    function isFilterOrLimitExpression(ex: Expression): boolean {
      return (
        ex instanceof LimitExpression ||
        // @ts-ignore compiler thinks that operand does not exist in the FilterExpression
        ex.operand instanceof FilterExpression
      );
    }

    return async (ex: Expression) => {
      if (Ajax.hasReadyResults(Ajax.results)) {
        return Dataset.fromJS(Ajax.results.data || EmptyDataset);
      }

      const modelId = Ajax.model_id;
      let sub: APIResponse;

      if (isFilterOrLimitExpression(ex)) {
        sub = await subscribeToFilter(ex, modelId);
      } else {
        const hash = getHashForExpression();
        sub = await subscribeToSplit(hash, modelId);
      }

      parseMeta(sub);
      return Dataset.fromJS(sub.data || EmptyDataset);
    };
  }
}

function safeLocalStorage() {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      // Try a test write to check for SecurityError
      const testKey = "__test__";
      window.localStorage.setItem(testKey, "1");
      window.localStorage.removeItem(testKey);
      return window.localStorage;
    }
  } catch {
    // localStorage is not available
  }
  return null;
}
