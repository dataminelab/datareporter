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
import { ChainableExpression, Dataset, DatasetJS, Environment, Executor, Expression, SplitExpression } from "plywood";
import { Cluster } from "../../../common/models/cluster/cluster";
import { DataCube } from "../../../common/models/data-cube/data-cube";

function getSplitsDescription(ex: Expression): string {
  var splits: string[] = [];
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

var reloadRequested = false;

function reload() {
  if (reloadRequested) return;
  reloadRequested = true;
  window.location.reload(true);
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
  private static model: number;

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
          throw new Error("error with response: " + error.response.status + ", " + error.message);
        } else if (error.request) {
          throw new Error("no response received, " + error.message);
        } else {
          throw new Error(error.message);
        }
      });
  }

  static queryUrlExecutorFactory(dataCube: DataCube): Executor {
    const timeout = clientTimeout(dataCube.cluster);
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    function timeoutQuery(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
    async function subscribe(hash: string, modelId: number) {
      const method = "POST";
      const url = `api/reports/generate/${modelId}`;
      const data = { hash };
      let res = await Ajax.query<{
        status: number;
        data: DatasetJS; }>({ method, url, timeout, data });
      switch (res.status) {
        // 1 == PENDING (waiting to be executed)
        case 1:
          await timeoutQuery(2000);
          res = await subscribe(hash, modelId);
          return res;
        // 2 == STARTED (executing)
        case 2:
          await timeoutQuery(1500);
          res = await subscribe(hash, modelId);
          return res;
        // 3 == SUCCESS
        case 3:
          return res;
        // 200 == SUCCESS
        case 200:
          return res;
        // 4 == FAILURE
        case 4:
          return res;
        // 5 == CANCELLED
        case 5:
          return res;
        default:
          return res;
      }
    }
    return async (ex: Expression, env: Environment = {}) => {
      const modeId = this.model;
      const hash = window.location.hash.substring(window.location.hash.indexOf("4/") + 2);
      const sub = await subscribe(hash, modeId);
      return Dataset.fromJS(sub.data);
    };
  }
}
