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
import {
  ChainableExpression,
  Dataset,
  DatasetJS,
  Environment,
  Executor,
  Expression,
  LimitExpression,
  SplitExpression
} from "plywood";
import { Cluster } from "../../../common/models/cluster/cluster";
import { DataCube } from "../../../common/models/data-cube/data-cube";
import { setPriceButton } from "../../../../../pages/reports/components/ReportPageHeaderUtils";

interface Meta {
  // Inner response object that returns two parameters:
  price: number;
  proceed_data: number;
}

interface APIResponse {
    meta: Meta;
    status: number;
    data: DatasetJS;
}

const EmptyDataset = Dataset.fromJS([]);

function getSplitsDescription(ex: Expression): string {
  const splits: string[] = [];
  ex.forEach(ex => {
    if (ex instanceof ChainableExpression) {
      ex.getArgumentExpressions().forEach(action => {
        if (action instanceof SplitExpression) {
          splits.push(action.firstSplitExpression().toString());
        }
      });
    }
  });
  return splits.join(";");
}

const CLIENT_TIMEOUT_DELTA:number = 30000;

async function getDefaultTimeout() {
  const method = "GET";
  const url = `api/timeout`;
  return axios({ method, url })
    .then(res => {
      console.log("timeout", res.data)
      return res.data;
    }
  )
}

function clientTimeout(cluster: Cluster): number {
  const defaultTimeout = localStorage.getItem("CLIENT_TIMEOUT_DELTA") ? Number(localStorage.getItem("CLIENT_TIMEOUT_DELTA")) : CLIENT_TIMEOUT_DELTA;
  const clusterTimeout = cluster ? cluster.getTimeout() : 0;
  return clusterTimeout + defaultTimeout;
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
  timeout: number;
  data?: any;
}

const validateStatus = (s: number) => 200 <= s && s < 300 || s === 304;

export class Ajax {
  static version: string;

  static settingsVersionGetter: () => number;
  static onUpdate: () => void;
  private static model_id: number;
  static hash: string;

  static query<T>({ data, url, timeout, method }: AjaxOptions): Promise<T> {
    return axios({ method, url, data, timeout, validateStatus })
      .then(res => {
        if (res && res.data.action === "update" && Ajax.onUpdate) Ajax.onUpdate();
        return res.data;
      })
      .catch(error => {
        if (error.response && error.response.data) {
          if (error.response.data.action === "reload") {
            reload();
          } else if (error.response.data.action === "update" && Ajax.onUpdate) {
            Ajax.onUpdate();
          }
          var message =  error.response.data.message || error.message;
          throw new Error("error with response: " + error.response.status + ", " + message);
        } else if (error.request) {
          throw new Error("no response received, " + error.message);
        } else {
          throw new Error(error.message);
        }
      });
  }

  static queryUrlExecutorFactory(dataCube: DataCube): Executor {
    const timeout = clientTimeout(dataCube.cluster);

    function timeoutQuery(ms:number) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function subscribe(input: AjaxOptions): Promise<APIResponse> {
      const { data, method, timeout , url } = input;
      data.bypass_cache = localStorage.getItem("bypass_cache") === "true";
      localStorage.removeItem("bypass_cache");
      const res = await Ajax.query<APIResponse>({ method, url, timeout, data });
      const urlHash = getHash();
      if (urlHash && data.hash !== urlHash) {
        console.log("[INFO] subscribe is killed by hash mismatch, skipping")
        return res;
      }
      if ([1, 2].indexOf(res.status) >= 0) {
        await timeoutQuery(2000);
        return await subscribe(input);
      } else return res;
    }

    async function subscribeToFilter(ex: LimitExpression, modelId: number) {
      const method = "POST";
      const url = `api/reports/generate/${modelId}/filter`;
      const data = { expression : ex.toJS() };
      return subscribe({ method, url, timeout, data });
    }

    async function subscribeToSplit(hash: string, modelId: number) {
      const method = "POST";
      const url = `api/reports/generate/${modelId}`;
      const data = { hash };
      return subscribe({ method, url, timeout, data });
    }

    return async (ex: Expression, env: Environment = {}) => {
      const modelId = this.model_id;
      if (ex instanceof  LimitExpression) {
        const sub = await subscribeToFilter(ex, modelId);
        if (sub.meta) {
          setPriceButton(
            Number(sub.meta.price), 
            Number(sub.meta.proceed_data),
            false);
        }
        return Dataset.fromJS(sub.data || EmptyDataset);
      } else {
        const hash = getHash() || this.hash;
        const sub = await subscribeToSplit(hash, modelId);
        if (sub.meta) {
          setPriceButton(
            Number(sub.meta.price), 
            Number(sub.meta.proceed_data),
            false);
        }
        return Dataset.fromJS(sub.data || EmptyDataset);
      };
    }
  }
}