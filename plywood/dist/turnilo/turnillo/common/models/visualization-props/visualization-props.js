"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.isError = exports.isLoaded = exports.isLoading = exports.loaded = exports.error = exports.loading = void 0;
var DatasetLoadStatus;
(function (DatasetLoadStatus) {
    DatasetLoadStatus[DatasetLoadStatus["LOADED"] = 0] = "LOADED";
    DatasetLoadStatus[DatasetLoadStatus["LOADING"] = 1] = "LOADING";
    DatasetLoadStatus[DatasetLoadStatus["ERROR"] = 2] = "ERROR";
})(DatasetLoadStatus || (DatasetLoadStatus = {}));
exports.loading = { status: DatasetLoadStatus.LOADING };
const error = (error) => ({ error, status: DatasetLoadStatus.ERROR });
exports.error = error;
const loaded = (dataset) => ({ status: DatasetLoadStatus.LOADED, dataset });
exports.loaded = loaded;
const isLoading = (dl) => dl.status === DatasetLoadStatus.LOADING;
exports.isLoading = isLoading;
const isLoaded = (dl) => dl.status === DatasetLoadStatus.LOADED;
exports.isLoaded = isLoaded;
const isError = (dl) => dl.status === DatasetLoadStatus.ERROR;
exports.isError = isError;
//# sourceMappingURL=visualization-props.js.map