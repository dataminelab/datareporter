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
exports.DataCubeFixtures = void 0;
const datareporter_plywood_1 = require("datareporter-plywood");
const cluster_fixtures_1 = require("../cluster/cluster.fixtures");
const dimensions_fixtures_1 = require("../dimension/dimensions.fixtures");
const measures_fixtures_1 = require("../measure/measures.fixtures");
const data_cube_1 = require("./data-cube");
var executor = datareporter_plywood_1.basicExecutorFactory({
    datasets: {
        wiki: datareporter_plywood_1.Dataset.fromJS([]),
        twitter: datareporter_plywood_1.Dataset.fromJS([])
    }
});
class DataCubeFixtures {
    static get WIKI_JS() {
        return {
            name: "wiki",
            title: "Wiki",
            description: "Wiki full description something about articles and editors",
            clusterName: "druid-wiki",
            source: "wiki",
            introspection: "none",
            attributes: [
                { name: "time", type: "TIME" },
                { name: "articleName", type: "STRING" },
                { name: "page", type: "STRING" },
                { name: "userChars", type: "SET/STRING" },
                { name: "count", type: "NUMBER", unsplitable: true, maker: { op: "count" } }
            ],
            dimensions: dimensions_fixtures_1.DimensionsFixtures.wikiJS(),
            measures: measures_fixtures_1.MeasuresFixtures.wikiJS(),
            timeAttribute: "time",
            defaultTimezone: "Etc/UTC",
            defaultDuration: "P3D",
            defaultSortMeasure: "count",
            defaultPinnedDimensions: ["articleName"],
            defaultSelectedMeasures: ["count"],
            maxSplits: 4,
            refreshRule: {
                time: new Date("2016-04-30T12:39:51.350Z"),
                rule: "fixed"
            }
        };
    }
    static get TWITTER_JS() {
        return {
            name: "twitter",
            title: "Twitter",
            description: "Twitter full description should go here - tweets and followers",
            clusterName: "druid-twitter",
            source: "twitter",
            introspection: "none",
            dimensions: dimensions_fixtures_1.DimensionsFixtures.twitterJS(),
            measures: measures_fixtures_1.MeasuresFixtures.twitterJS(),
            timeAttribute: "time",
            defaultTimezone: "Etc/UTC",
            defaultDuration: "P3D",
            defaultSortMeasure: "count",
            defaultPinnedDimensions: ["tweet"],
            refreshRule: {
                rule: "realtime"
            }
        };
    }
    static wiki() {
        return data_cube_1.DataCube.fromJS(DataCubeFixtures.WIKI_JS, { executor });
    }
    static twitter() {
        return data_cube_1.DataCube.fromJS(DataCubeFixtures.TWITTER_JS, { executor });
    }
    static customCube(title, description, extendedDescription = "") {
        return data_cube_1.DataCube.fromJS({
            name: "custom",
            title,
            description,
            extendedDescription,
            clusterName: "druid-custom",
            source: "custom",
            introspection: "none",
            dimensions: [],
            measures: [],
            timeAttribute: "time",
            defaultTimezone: "Etc/UTC",
            defaultDuration: "P3D",
            maxSplits: 4,
            refreshRule: {
                rule: "realtime"
            }
        }, { executor });
    }
    static customCubeWithGuard() {
        return data_cube_1.DataCube.fromJS({
            name: "some-name",
            title: "customDataCubeWithGuard",
            description: "",
            extendedDescription: "",
            clusterName: "druid-custom",
            source: "custom",
            introspection: "none",
            dimensions: [],
            measures: [],
            timeAttribute: "time",
            defaultTimezone: "Etc/UTC",
            defaultDuration: "P3D",
            maxSplits: 4,
            refreshRule: {
                rule: "realtime"
            }
        }, { executor, cluster: cluster_fixtures_1.ClusterFixtures.druidTwitterClusterJSWithGuard() });
    }
}
exports.DataCubeFixtures = DataCubeFixtures;
//# sourceMappingURL=data-cube.fixtures.js.map