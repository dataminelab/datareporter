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

interface APIResponse {
    status: number;
    data: DatasetJS;
}

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

const CLIENT_TIMEOUT_DELTA = 5000;

function clientTimeout(cluster: Cluster): number {
  const clusterTimeout = cluster ? cluster.getTimeout() : 0;
  return clusterTimeout + CLIENT_TIMEOUT_DELTA;
}

let reloadRequested = false;

function reload() {
  if (reloadRequested) return;
  reloadRequested = true;
  window.location.reload();
}


export interface AjaxOptions {
  method: "GET" | "POST";
  url: string;
  timeout: number;
  data?: any;
}

const validateStatus = (s: number) => 200 <= s && s < 300 || s === 304;

var buttonVisible = false;
function setPriceButton(meta: any) {
  const mediaButton = document.getElementById("meta-button");
  if (!mediaButton) return;
  if (!buttonVisible) {
    buttonVisible = true;
    mediaButton.style.display = "block";
  }
  let priceDiv = document.querySelector("#_price");
  let currentPrice = meta.price + parseInt(priceDiv.getAttribute("alt"))
  priceDiv.setAttribute("alt", currentPrice);
  priceDiv.innerHTML = "Price: " + currentPrice.toString().slice(0,6) + " $";     
  let bytesDiv = document.querySelector("#_proceed_data");
  let currentBytes = meta.proceed_data + parseInt(bytesDiv.getAttribute("alt"))
  bytesDiv.setAttribute("alt", currentBytes);
  let gbType = (currentBytes / 8) / 1024 / 1024 / 1024;
  bytesDiv.innerHTML = "Bytes: " + gbType.toString().slice(0,6) + " GB";
}

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
    // @ts-ignore
    function timeoutQuery(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function subscribe(input: AjaxOptions): Promise<APIResponse> {
        const { data, method, timeout , url } = input;
        const bypass_cache = window.localStorage.getItem("bypass_cache") === "true" || false;
        if (bypass_cache) {
          data.bypass_cache = true;
          window.localStorage.removeItem("bypass_cache");
        } else {
          data.bypass_cache = false;
        }
        const res = await Ajax.query<APIResponse>({ method, url, timeout, data });
        if ([1, 2].indexOf(res.status) >= 0) {
            await timeoutQuery(2000);
            return await subscribe(input);
       } else return res;
    }

    async function  subscribeToFilter(ex: LimitExpression, modelId: number) {
      const method = "POST";
      const url = `api/reports/generate/${modelId}/filter`;
      const data = { expression : ex.toJS() };
      return subscribe({ method, url, timeout, data });
    }

    async function  subscribeToSplit(hash: string, modelId: number) {
      const method = "POST";
      const url = `api/reports/generate/${modelId}`; 
      const data = { hash };
      return subscribe({ method, url, timeout, data });
    }

    return async (ex: Expression, env: Environment = {}) => {
      const modelId = this.model_id;
      if (ex instanceof  LimitExpression) {
        const sub = await subscribeToFilter(ex, modelId);
        return Dataset.fromJS(sub.data);
      }
      var hash;
      if (window.location.hash) {
        hash = window.location.hash.substring(window.location.hash.indexOf("4/") + 2);
      } else {
        hash = this.hash;
      }
      const sub = await subscribeToSplit(hash, modelId);
      // @ts-ignore
      if (sub.meta) {
        // @ts-ignore
        setPriceButton(sub.meta);
      }
      return Dataset.fromJS(sub.data);
    };
  }
}
