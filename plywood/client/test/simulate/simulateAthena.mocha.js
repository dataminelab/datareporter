/*
 * Copyright 2012-2015 Metamarkets Group Inc.
 * Copyright 2015-2020 Imply Data, Inc.
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

const { expect } = require("chai");

const plywood = require("../plywood");

const { Expression, External, Dataset, TimeRange, $, ply, r, s$ } = plywood;

const attributes = [
    { name: "time", type: "TIME" },
    { name: "some_other_time", type: "TIME" },
    { name: "some_other_time_long", type: "TIME", nativeType: "LONG" },
    { name: "color", type: "STRING" },
    { name: "cut", type: "STRING" },
    { name: "isNice", type: "BOOLEAN" },
    { name: "tags", type: "SET/STRING" },
    { name: "pugs", type: "SET/STRING" },
    { name: "carat", type: "NUMBER", nativeType: "STRING" },
    { name: "carat_n", nativeType: "STRING" },
    { name: "height_bucket", type: "NUMBER" },
    { name: "price", type: "NUMBER", unsplitable: true },
    { name: "tax", type: "NUMBER", unsplitable: true },
    {
        name: "vendor_id",
        type: "NULL",
        nativeType: "hyperUnique",
        unsplitable: true,
    },
    { name: "ip_address", type: "IP" },
    { name: "ip_prefix", type: "IP" },

    { name: "try", type: "NUMBER", nativeType: "STRING" }, // Added here because 'try' is a JS keyword
    { name: "a+b", type: "NUMBER", nativeType: "STRING" }, // Added here because it is invalid JS without escaping

];

const context = {
    diamonds: External.fromJS({
        engine: "athena",
        version: "2.0.0",
        source: "diamonds",
        timeAttribute: "time",
        attributes,
        allowSelectQueries: true,
        filter: $("time").overlap({
            start: new Date("2015-03-12T00:00:00Z"),
            end: new Date("2015-03-19T00:00:00Z"),
        }),
    })
};

describe("simulate Athena", () => {
    it("casts columns to VARCHAR for contains", () => {
        const ex = ply()
            .apply("diamonds", $("diamonds").filter('$tags.contains("ta")'))
            .apply(
                "Tags",
                $("diamonds")
                    .split("$tags", "Tag")
                    .sort("$Tag", "descending")
                    .limit(10),
            );

        const queryPlan = ex.simulateQueryPlan(context);
        expect(queryPlan.length).to.equal(1);
        expect(queryPlan[0][0]).to.include("VARCHAR");
    });

    it("casts columns to VARCHAR for regex", () => {
        const ex = ply()
            .apply("diamonds", $("diamonds").filter('$tags.match("^ta.*")'))
            .apply(
                "Tags",
                $("diamonds")
                    .split("$tags", "Tag")
                    .sort("$Tag", "descending")
                    .limit(10),
            );

        const queryPlan = ex.simulateQueryPlan(context);
        expect(queryPlan.length).to.equal(1);
        expect(queryPlan[0][0]).to.include("REGEXP");
    });

    it("works in basic case", () => {
        const ex = ply()
            .apply(
                "diamonds",
                $("diamonds").filter('$tags.overlap(["tagA", "tagB"])'),
            )
            .apply(
                "Tags",
                $("diamonds")
                    .split("$tags", "Tag")
                    .sort("$Tag", "descending")
                    .limit(10)
                    .apply(
                        "Cuts",
                        $("diamonds")
                            .split("$cut", "Cut")
                            .apply("Count", $("diamonds").count())
                            .sort("$Count", "descending")
                            .limit(10),
                    ),
            );

        const queryPlan = ex.simulateQueryPlan(context);
        expect(queryPlan.length).to.equal(2);
        expect(queryPlan[0][0]).to.include("SELECT");
        expect(queryPlan[1][0]).to.include("SELECT");
    });
});
