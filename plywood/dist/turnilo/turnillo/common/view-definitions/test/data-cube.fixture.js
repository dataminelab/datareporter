"use strict";
/*
 * Copyright 2017-2018 Allegro.pl
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
exports.dataCube = void 0;
const data_cube_1 = require("../../models/data-cube/data-cube");
const dimensions_1 = require("../../models/dimension/dimensions");
const dimension_1 = require("./dimension");
const measure_1 = require("./measure");
exports.dataCube = new data_cube_1.DataCube({
    clusterName: "druid",
    dimensions: dimensions_1.Dimensions.fromDimensions(dimension_1.dimensions),
    measures: measure_1.measuresCollection,
    name: "fixture",
    source: "custom",
    timeAttribute: dimension_1.timeDimension.expression
});
//# sourceMappingURL=data-cube.fixture.js.map