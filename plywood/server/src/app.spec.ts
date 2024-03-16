import app from "./app";
import chai, { expect } from "chai";
import chaiHttp from "chai-http";

chai.use(chaiHttp);


describe("Hash to expression endpoint", () => {

    const expectedExpression = {
        "op": "apply",
        "operand": {
            "op": "apply",
            "operand": {
                "op": "apply",
                "operand": {
                    "op": "apply",
                    "operand": {
                        "op": "literal",
                        "value": {
                            "attributes": [],
                            "data": [
                                {}
                            ]
                        },
                        "type": "DATASET"
                    },
                    "expression": {
                        "op": "filter",
                        "operand": {
                            "op": "ref",
                            "name": "users"
                        },
                        "expression": {
                            "op": "overlap",
                            "operand": {
                                "op": "ref",
                                "name": "created_at"
                            },
                            "expression": {
                                "op": "literal",
                                "value": {
                                    "setType": "TIME_RANGE",
                                    "elements": [
                                        {
                                            "start": "2021-06-08T06:16:00.000Z",
                                            "end": "2021-06-09T06:16:00.000Z"
                                        }
                                    ]
                                },
                                "type": "SET"
                            }
                        }
                    },
                    "name": "users"
                },
                "expression": {
                    "op": "literal",
                    "value": 86400000
                },
                "name": "MillisecondsInInterval"
            },
            "expression": {
                "op": "sum",
                "operand": {
                    "op": "ref",
                    "name": "users"
                },
                "expression": {
                    "op": "ref",
                    "name": "id"
                }
            },
            "name": "id"
        },
        "expression": {
            "op": "limit",
            "operand": {
                "op": "sort",
                "operand": {
                    "op": "apply",
                    "operand": {
                        "op": "split",
                        "operand": {
                            "op": "ref",
                            "name": "users"
                        },
                        "name": "name",
                        "expression": {
                            "op": "ref",
                            "name": "name"
                        },
                        "dataName": "users"
                    },
                    "expression": {
                        "op": "sum",
                        "operand": {
                            "op": "ref",
                            "name": "users"
                        },
                        "expression": {
                            "op": "ref",
                            "name": "id"
                        }
                    },
                    "name": "id"
                },
                "expression": {
                    "op": "ref",
                    "name": "id"
                },
                "direction": "descending"
            },
            "value": 5
        },
        "name": "SPLIT"
    };


    const hash = `N4IgbglgzgrghgGwgLzgFwgewHYgFwhpwBGCApiADTjTxKoY4DKZaG2A5lPqAMaYIEcAA5QyAJUwB3bngBmiMQF9qGALZlkOCgQCiaXgHoAqgBUAwlRByICNGQBOsgNqg0AT2E7CEDVYdkcvggvAHoZAAmAProVupkAAqOWBEuoBEwDuhYuAQJAIwAIlZQ9sL4ALT5qp7eQvalIEoAui3UUMJIaGmEtcGlDhCcVhG+ZNhQOcHYcH7tmA5oPCABQQQQEXF9BGKDZNzUowG8jLkgEfu846PD1F6DmJsETdRIahBLeACsbSC7EPt8K4VoFHOMrsENlY5As1LE8G5tudAnAYHYrGBEDBvC9el5gho4LAAk1mnchthIoUxhMci4ySBhBTIkwFp8QFClEA`;
    const dataCube = {
        "name": "users",
        "title": "Users",
        "timeAttribute": "created_at",
        "clusterName": "native",
        "defaultSortMeasure": "id",
        "defaultSelectedMeasures": ["id"],
        "source": "users",
        "attributes": [
            {
                "name": "api_key",
                "type": "STRING",
                "nativeType": "CHARACTER VARYING"
            },
            {
                "name": "created_at",
                "type": "TIME",
                "nativeType": "TIMESTAMP WITH TIME ZONE"
            },
            {
                "name": "disabled_at",
                "type": "TIME",
                "nativeType": "TIMESTAMP WITH TIME ZONE"
            },
            {
                "name": "email",
                "type": "STRING",
                "nativeType": "CHARACTER VARYING"
            },
            {
                "name": "groups",
                "type": "SET/STRING",
                "nativeType": "ARRAY/CHARACTER"
            },
            {
                "name": "id",
                "type": "NUMBER",
                "nativeType": "INTEGER"
            },
            {
                "name": "name",
                "type": "STRING",
                "nativeType": "CHARACTER VARYING"
            },
            {
                "name": "org_id",
                "type": "NUMBER",
                "nativeType": "INTEGER"
            },
            {
                "name": "password_hash",
                "type": "STRING",
                "nativeType": "CHARACTER VARYING"
            },
            {
                "name": "profile_image_url",
                "type": "STRING",
                "nativeType": "CHARACTER VARYING"
            },
            {
                "name": "updated_at",
                "type": "TIME",
                "nativeType": "TIMESTAMP WITH TIME ZONE"
            }
        ],
        "dimensions": [
            {
                "name": "api_key",
                "title": "Api Key",
                "formula": "$api_key"
            },
            {
                "name": "created_at",
                "title": "Created At",
                "formula": "$created_at",
                "kind": "time"
            },
            {
                "name": "details",
                "title": "Details",
                "formula": "$details"
            },
            {
                "name": "disabled_at",
                "title": "Disabled At",
                "formula": "$disabled_at",
                "kind": "time"
            },
            {
                "name": "email",
                "title": "Email",
                "formula": "$email"
            },
            {
                "name": "groups",
                "title": "Groups",
                "formula": "$groups"
            },
            {
                "name": "name",
                "title": "Name",
                "formula": "$name"
            },
            {
                "name": "password_hash",
                "title": "Password Hash",
                "formula": "$password_hash"
            },
            {
                "name": "profile_image_url",
                "title": "Profile Image Url",
                "formula": "$profile_image_url"
            },
            {
                "name": "updated_at",
                "title": "Updated At",
                "formula": "$updated_at",
                "kind": "time"
            }
        ],
        "measures": [
            {
                "name": "id",
                "title": "Id",
                "formula": "$main.sum($id)"
            },
            {
                "name": "org_id",
                "title": "Org",
                "formula": "$main.sum($org_id)"
            }
        ]
    };


    it("Success test case", () => {

        chai
            .request(app)
            .post('/api/v1/plywood/expression')
            .send({ hash, dataCube })
            .then(res => {
                expect(res.status).to.eq(200);
                expect(res.body).to.deep.eq(expectedExpression)
            });
    });


    it("Test no hash", () => {
        chai
            .request(app)
            .post('/api/v1/plywood/expression')
            .send({ dataCube })
            .then(res => {
                expect(res.status).to.eq(400);
            });
    });

    it("Test no data cube", () => {
        chai
            .request(app)
            .post('/api/v1/plywood/expression')
            .send({ hash })
            .then(res => {
                expect(res.status).to.eq(400);
            });
    });



});



describe('Attributes endpoint', () => {
    const input = {
        engine: 'postgres',
        "attributes": [
            {
                "name": "api_key",
                "type": "CHARACTER VARYING"
            },
            {
                "name": "created_at",
                "type": "TIMESTAMP WITH TIME ZONE"
            },
            {
                "name": "details",
                "type": "JSON"
            },
        ]
    }

    it('Should work fine postgres', async () => {
        return chai
            .request(app)
            .post('/api/v1/plywood/attributes')
            .send({ ...input })
            .then(res => {
                chai.expect(res.status).to.equal(200);
                chai.expect(res.body.attributes.length).to.equal(input.attributes.length);

                const api_key = res.body.attributes.find(o => o.name === 'api_key');
                const created_at = res.body.attributes.find(o => o.name === 'created_at');
                const details = res.body.attributes.find(o => o.name === 'details');


                //api_key
                chai.expect(api_key).not.to.be.undefined;
                chai.expect(api_key.type).to.equal('STRING');
                chai.expect(api_key.nativeType).to.equal('CHARACTER VARYING');
                chai.expect(api_key.isSupported).to.be.true;

                //created at
                chai.expect(created_at).not.to.be.undefined;
                chai.expect(created_at.type).to.equal('TIME');
                chai.expect(created_at.nativeType).to.equal('TIMESTAMP WITH TIME ZONE');
                chai.expect(created_at.isSupported).to.be.true;

                //details
                chai.expect(details).not.to.be.undefined;
                chai.expect(details.type).to.equal('JSON');
                chai.expect(details.nativeType).to.equal('JSON');
                chai.expect(details.isSupported).to.be.false;
            });
    });

    it('Validation missing engine', async () => {
        return chai
            .request(app)
            .post('/api/v1/plywood/attributes')
            .send({ ...input, engine: undefined })
            .then(res => {
                chai.expect(res.status).to.equal(400);
                chai.expect(res.body.message).to.equal('Engine is missing');
                chai.expect(res.body.field).to.equal('engine');

            });
    });

    it('Validation unsupported  engine', async () => {
        return chai
            .request(app)
            .post('/api/v1/plywood/attributes')
            .send({ ...input, engine: 'does_not_exists' })
            .then(res => {
                chai.expect(res.status).to.equal(400);
                chai.expect(res.body.message).to.include('Engine is not supported');
                chai.expect(res.body.field).to.equal('engine');

            });
    });

    it('Validation no  attributes', async () => {
        return chai
            .request(app)
            .post('/api/v1/plywood/attributes')
            .send({ ...input, attributes: undefined })
            .then(res => {
                chai.expect(res.status).to.equal(400);
                chai.expect(res.body.message).to.include('Field attributes is missing');
                chai.expect(res.body.field).to.equal('attributes');

            });
    });



})

describe("Supported engines", () => {
    it("Postgres and mysql check", async () => {
        return chai
            .request(app)
            .get('/api/v1/plywood/attributes/engines')
            .then(res => {
                chai.expect(res.status).to.equal(200);
                chai.expect(res.body.supportedEngines).to.include('postgres');
                chai.expect(res.body.supportedEngines).to.include('mysql');
                chai.expect(res.body.supportedEngines).to.include('druid');
            });
    })
})



describe("Status Endpoint", () => {
    it("should return status UP on call", async () => {
        return chai
            .request(app)
            .get("/api/v1/status")
            .then(res => {
                chai.expect(res.status).to.equal(200);
                chai.expect(res.body.status).to.equal('UP');
            });
    });
});

describe("Plywood Endpoint", () => {
    const context = {
        engine: 'mysql',
        source: 'wikipedia',
        timeAttribute: 'time',
        attributes: [
            { name: 'time', type: 'TIME' },
            { name: 'page', type: 'STRING' },
            { name: 'language', type: 'STRING' },
            { name: 'added', type: 'NUMBER' }
        ]
    };

    const totalAddedExp = {
        "op": "apply",
        "operand": {
            "op": "apply",
            "operand": { "op": "literal", "value": { "attributes": [], "data": [{}] }, "type": "DATASET" },
            "expression": { "op": "count", "operand": { "op": "ref", "name": "wiki" } },
            "name": "Count"
        },
        "expression": {
            "op": "sum",
            "operand": { "op": "ref", "name": "wiki" },
            "expression": { "op": "ref", "name": "added" }
        },
        "name": "TotalAdded"
    };

    it("should fail with bad expression when empty expression", async () => {
        return chai
            .request(app)
            .post("/api/v1/plywood")
            .then(res => {
                chai.expect(res.status).to.equal(400);
                chai.expect(res.body.error).to.equal("bad expression");
                chai.expect(res.body.message).to.equal("op must be defined");
            });
    });

    it("should fail with bad expression with {} expression", async () => {
        return chai
            .request(app)
            .post("/api/v1/plywood")
            .send({})
            .then(res => {
                chai.expect(res.status).to.equal(400);
                chai.expect(res.body.error).to.equal("bad expression");
                chai.expect(res.body.message).to.equal("op must be defined");
            });
    });

    it("should fail with data cube is null", async () => {
        return chai
            .request(app)
            .post("/api/v1/plywood")
            .send({
                context,
                expression: totalAddedExp
            })
            .then(res => {
                chai.expect(res.status).to.equal(400);
                chai.expect(res.body.error).to.equal("dataCube is null");
                chai.expect(res.body.message).to.equal("data cube must be defined");
            });
    });

    it("should return one SQL query", async () => {
        return chai
            .request(app)
            .post("/api/v1/plywood")
            .send({
                dataCube: 'wiki',
                context: { ...context, engine: 'bigquery' },
                expression: totalAddedExp
            })
            .then(res => {
                chai.expect(res.status).to.equal(200);
                chai.expect(res.body.queries).to.be.eql([
                    [
                        "SELECT COUNT(*) AS `Count`, SUM(`added`) AS `TotalAdded` FROM `wikipedia` AS t"
                    ]
                ]);
            });
    });

    it("should work with bigquery", async () => {
        return chai
            .request(app)
            .post("/api/v1/plywood")
            .send({
                dataCube: 'wiki',
                context: { ...context, engine: 'bigquery' },
                expression: totalAddedExp
            })
            .then(res => {
                chai.expect(res.status).to.equal(200);
                chai.expect(res.body.queries).to.be.eql([
                    [
                        "SELECT COUNT(*) AS `Count`, SUM(`added`) AS `TotalAdded` FROM `wikipedia` AS t"
                    ]
                ]);
            });
    });

    it("should return two SQL queries", async () => {
        return chai
            .request(app)
            .post("/api/v1/plywood")
            .send({
                dataCube: 'wiki',
                context: { ...context, engine: 'bigquery' },
                expression: {
                    "op": "apply",
                    "operand": totalAddedExp,
                    "expression": {
                        "op": "limit",
                        "operand": {
                            "op": "sort",
                            "operand": {
                                "op": "apply",
                                "operand": {
                                    "op": "split",
                                    "operand": { "op": "ref", "name": "wiki" },
                                    "name": "Page",
                                    "expression": { "op": "ref", "name": "page" },
                                    "dataName": "wiki"
                                },
                                "expression": { "op": "count", "operand": { "op": "ref", "name": "wiki" } },
                                "name": "Count"
                            },
                            "expression": { "op": "ref", "name": "Count" },
                            "direction": "descending"
                        },
                        "value": 6
                    },
                    "name": "Pages"
                }
            })
            .then(res => {
                chai.expect(res.status).to.equal(200);
                chai.expect(res.body.queries).to.be.eql([
                    [
                        "SELECT COUNT(*) AS `Count`, SUM(`added`) AS `TotalAdded` FROM `wikipedia` AS t",
                        "SELECT `page` AS `Page`, COUNT(*) AS `Count` FROM `wikipedia` AS t GROUP BY 1 ORDER BY `Count` DESC LIMIT 6"
                    ]
                ]);
            });
    });
});



