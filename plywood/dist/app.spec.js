"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const chai_1 = __importStar(require("chai"));
const chai_http_1 = __importDefault(require("chai-http"));
chai_1.default.use(chai_http_1.default);
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
        chai_1.default
            .request(app_1.default)
            .post('/api/v1/plywood/expression')
            .send({ hash, dataCube })
            .then(res => {
            chai_1.expect(res.status).to.eq(200);
            chai_1.expect(res.body).to.deep.eq(expectedExpression);
        });
    });
    it("Test no hash", () => {
        chai_1.default
            .request(app_1.default)
            .post('/api/v1/plywood/expression')
            .send({ dataCube })
            .then(res => {
            chai_1.expect(res.status).to.eq(400);
        });
    });
    it("Test no data cube", () => {
        chai_1.default
            .request(app_1.default)
            .post('/api/v1/plywood/expression')
            .send({ hash })
            .then(res => {
            chai_1.expect(res.status).to.eq(400);
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
    };
    it('Should work fine postgres', () => __awaiter(void 0, void 0, void 0, function* () {
        return chai_1.default
            .request(app_1.default)
            .post('/api/v1/plywood/attributes')
            .send(Object.assign({}, input))
            .then(res => {
            chai_1.default.expect(res.status).to.equal(200);
            chai_1.default.expect(res.body.attributes.length).to.equal(input.attributes.length);
            const api_key = res.body.attributes.find(o => o.name === 'api_key');
            const created_at = res.body.attributes.find(o => o.name === 'created_at');
            const details = res.body.attributes.find(o => o.name === 'details');
            //api_key
            chai_1.default.expect(api_key).not.to.be.undefined;
            chai_1.default.expect(api_key.type).to.equal('STRING');
            chai_1.default.expect(api_key.nativeType).to.equal('CHARACTER VARYING');
            chai_1.default.expect(api_key.isSupported).to.be.true;
            //created at
            chai_1.default.expect(created_at).not.to.be.undefined;
            chai_1.default.expect(created_at.type).to.equal('TIME');
            chai_1.default.expect(created_at.nativeType).to.equal('TIMESTAMP WITH TIME ZONE');
            chai_1.default.expect(created_at.isSupported).to.be.true;
            //details
            chai_1.default.expect(details).not.to.be.undefined;
            chai_1.default.expect(details.type).to.equal('JSON');
            chai_1.default.expect(details.nativeType).to.equal('JSON');
            chai_1.default.expect(details.isSupported).to.be.false;
        });
    }));
    it('Validation missing engine', () => __awaiter(void 0, void 0, void 0, function* () {
        return chai_1.default
            .request(app_1.default)
            .post('/api/v1/plywood/attributes')
            .send(Object.assign(Object.assign({}, input), { engine: undefined }))
            .then(res => {
            chai_1.default.expect(res.status).to.equal(400);
            chai_1.default.expect(res.body.message).to.equal('Engine is missing');
            chai_1.default.expect(res.body.field).to.equal('engine');
        });
    }));
    it('Validation unsupported  engine', () => __awaiter(void 0, void 0, void 0, function* () {
        return chai_1.default
            .request(app_1.default)
            .post('/api/v1/plywood/attributes')
            .send(Object.assign(Object.assign({}, input), { engine: 'does_not_exists' }))
            .then(res => {
            chai_1.default.expect(res.status).to.equal(400);
            chai_1.default.expect(res.body.message).to.include('Engine is not supported');
            chai_1.default.expect(res.body.field).to.equal('engine');
        });
    }));
    it('Validation no  attributes', () => __awaiter(void 0, void 0, void 0, function* () {
        return chai_1.default
            .request(app_1.default)
            .post('/api/v1/plywood/attributes')
            .send(Object.assign(Object.assign({}, input), { attributes: undefined }))
            .then(res => {
            chai_1.default.expect(res.status).to.equal(400);
            chai_1.default.expect(res.body.message).to.include('Field attributes is missing');
            chai_1.default.expect(res.body.field).to.equal('attributes');
        });
    }));
});
describe("Supported engines", () => {
    it("Postgres and mysql check", () => __awaiter(void 0, void 0, void 0, function* () {
        return chai_1.default
            .request(app_1.default)
            .get('/api/v1/plywood/attributes/engines')
            .then(res => {
            chai_1.default.expect(res.status).to.equal(200);
            chai_1.default.expect(res.body.supportedEngines).to.include('postgres');
            chai_1.default.expect(res.body.supportedEngines).to.include('mysql');
        });
    }));
});
describe("Status Endpoint", () => {
    it("should return status UP on call", () => __awaiter(void 0, void 0, void 0, function* () {
        return chai_1.default
            .request(app_1.default)
            .get("/api/v1/status")
            .then(res => {
            chai_1.default.expect(res.status).to.equal(200);
            chai_1.default.expect(res.body.status).to.equal('UP');
        });
    }));
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
    it("should fail with bad expression when empty expression", () => __awaiter(void 0, void 0, void 0, function* () {
        return chai_1.default
            .request(app_1.default)
            .post("/api/v1/plywood")
            .then(res => {
            chai_1.default.expect(res.status).to.equal(400);
            chai_1.default.expect(res.body.error).to.equal("bad expression");
            chai_1.default.expect(res.body.message).to.equal("op must be defined");
        });
    }));
    it("should fail with bad expression with {} expression", () => __awaiter(void 0, void 0, void 0, function* () {
        return chai_1.default
            .request(app_1.default)
            .post("/api/v1/plywood")
            .send({})
            .then(res => {
            chai_1.default.expect(res.status).to.equal(400);
            chai_1.default.expect(res.body.error).to.equal("bad expression");
            chai_1.default.expect(res.body.message).to.equal("op must be defined");
        });
    }));
    it("should fail with data cube is null", () => __awaiter(void 0, void 0, void 0, function* () {
        return chai_1.default
            .request(app_1.default)
            .post("/api/v1/plywood")
            .send({
            context,
            expression: totalAddedExp
        })
            .then(res => {
            chai_1.default.expect(res.status).to.equal(400);
            chai_1.default.expect(res.body.error).to.equal("dataCube is null");
            chai_1.default.expect(res.body.message).to.equal("data cube must be defined");
        });
    }));
    it("should return one SQL query", () => __awaiter(void 0, void 0, void 0, function* () {
        return chai_1.default
            .request(app_1.default)
            .post("/api/v1/plywood")
            .send({
            dataCube: 'wiki',
            context: Object.assign(Object.assign({}, context), { engine: 'bigquery' }),
            expression: totalAddedExp
        })
            .then(res => {
            chai_1.default.expect(res.status).to.equal(200);
            chai_1.default.expect(res.body.queries).to.be.eql([
                [
                    "SELECT COUNT(*) AS `Count`, SUM(`added`) AS `TotalAdded` FROM `wikipedia` AS t"
                ]
            ]);
        });
    }));
    it("should work with bigquery", () => __awaiter(void 0, void 0, void 0, function* () {
        return chai_1.default
            .request(app_1.default)
            .post("/api/v1/plywood")
            .send({
            dataCube: 'wiki',
            context: Object.assign(Object.assign({}, context), { engine: 'bigquery' }),
            expression: totalAddedExp
        })
            .then(res => {
            chai_1.default.expect(res.status).to.equal(200);
            chai_1.default.expect(res.body.queries).to.be.eql([
                [
                    "SELECT COUNT(*) AS `Count`, SUM(`added`) AS `TotalAdded` FROM `wikipedia` AS t"
                ]
            ]);
        });
    }));
    it("should return two SQL queries", () => __awaiter(void 0, void 0, void 0, function* () {
        return chai_1.default
            .request(app_1.default)
            .post("/api/v1/plywood")
            .send({
            dataCube: 'wiki',
            context: Object.assign(Object.assign({}, context), { engine: 'bigquery' }),
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
            chai_1.default.expect(res.status).to.equal(200);
            chai_1.default.expect(res.body.queries).to.be.eql([
                [
                    "SELECT COUNT(*) AS `Count`, SUM(`added`) AS `TotalAdded` FROM `wikipedia` AS t",
                    "SELECT `page` AS `Page`, COUNT(*) AS `Count` FROM `wikipedia` AS t GROUP BY 1 ORDER BY `Count` DESC LIMIT 6"
                ]
            ]);
        });
    }));
});
//# sourceMappingURL=app.spec.js.map