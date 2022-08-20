"use strict";
/*
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
const chai_1 = require("chai");
const data_cube_fixtures_1 = require("../../models/data-cube/data-cube.fixtures");
const essence_1 = require("../../models/essence/essence");
//@ts-ignore
const essence_fixtures_1 = require("../../models/essence/essence.fixtures");
const hash_conversions_1 = require("../../view-definitions/hash-conversions");
const url_hash_converter_1 = require("./url-hash-converter");
const url_hash_converter_fixtures_1 = require("./url-hash-converter.fixtures");
describe("urlHashConverter", () => {
    describe("version 2", () => {
        const ver2 = [
            { version: "2", hash: url_hash_converter_fixtures_1.UrlHashConverterFixtures.tableHashVersion2(), essence: essence_fixtures_1.EssenceFixtures.wikiTable() },
            { version: "2", hash: url_hash_converter_fixtures_1.UrlHashConverterFixtures.lineChartVersion2(), essence: essence_fixtures_1.EssenceFixtures.wikiLineChart() }
        ];
        ver2.forEach(({ version, hash, essence }) => {
            //@ts-ignore
            const { visualization } = essence;
            it(`decodes ${visualization.name} version ${version} correctly`, () => {
                const decodedEssence = url_hash_converter_1.urlHashConverter.essenceFromHash(hash, data_cube_fixtures_1.DataCubeFixtures.wiki());
                chai_1.expect(decodedEssence.toJS()).to.deep.equal(essence.toJS());
            });
        });
    });
    describe("version 3", () => {
        const ver3 = [
            { version: "3", hash: url_hash_converter_fixtures_1.UrlHashConverterFixtures.tableHashVersion3(), essence: essence_fixtures_1.EssenceFixtures.wikiTable() },
            { version: "3", hash: url_hash_converter_fixtures_1.UrlHashConverterFixtures.lineChartVersion3(), essence: essence_fixtures_1.EssenceFixtures.wikiLineChart() }
        ];
        ver3.forEach(({ version, hash, essence }) => {
            //@ts-ignore
            const { visualization } = essence;
            it(`decodes ${visualization.name} version ${version} correctly`, () => {
                const decodedEssence = url_hash_converter_1.urlHashConverter.essenceFromHash(hash, data_cube_fixtures_1.DataCubeFixtures.wiki());
                chai_1.expect(decodedEssence.toJS()).to.deep.equal(essence.toJS());
            });
        });
    });
    describe("version 4", () => {
        const ver4 = [
            { version: "4", hash: url_hash_converter_fixtures_1.UrlHashConverterFixtures.tableHashVersion4(), essence: essence_fixtures_1.EssenceFixtures.wikiTable() },
            { version: "4", hash: url_hash_converter_fixtures_1.UrlHashConverterFixtures.lineChartVersion4(), essence: essence_fixtures_1.EssenceFixtures.wikiLineChart() }
        ];
        ver4.forEach(({ version, hash, essence }) => {
            //@ts-ignore
            const { visualization } = essence;
            it(`decodes ${visualization.name} version ${version} correctly`, () => {
                const decodedEssence = url_hash_converter_1.urlHashConverter.essenceFromHash(hash, data_cube_fixtures_1.DataCubeFixtures.wiki());
                chai_1.expect(decodedEssence.toJS()).to.deep.equal(essence.toJS());
            });
            it(`is symmetric in decode/encode for ${visualization.name} in version ${version}`, () => {
                const encodedHash = url_hash_converter_1.urlHashConverter.toHash(essence, version);
                const decodedEssence = url_hash_converter_1.urlHashConverter.essenceFromHash(encodedHash, data_cube_fixtures_1.DataCubeFixtures.wiki());
                chai_1.expect(essence.toJS()).to.deep.equal(decodedEssence.toJS());
            });
            function decodeHash(hash) {
                const { encodedModel } = url_hash_converter_1.getHashSegments(hash);
                return hash_conversions_1.hashToObject(encodedModel);
            }
            it(`is symmetric in encode/decode for ${visualization.name} in version ${version}`, () => {
                const decodedEssence = url_hash_converter_1.urlHashConverter.essenceFromHash(hash, data_cube_fixtures_1.DataCubeFixtures.wiki());
                const encodedHash = url_hash_converter_1.urlHashConverter.toHash(decodedEssence, version);
                try {
                    chai_1.expect(encodedHash).to.equal(hash);
                }
                catch (e) {
                    // rethrow assertion on decoded hashes for readability
                    // expect(decodeHash(encodedHash), "decoded hashes").to.deep.equal(decodeHash(hash));
                    // if test fails but expect on decoded succeeds (error in test definition) rethrow original assertion exception.
                    throw e;
                }
            });
        });
    });
    const minimalNumberOfSegmentsTests = [
        { version: "2", hash: url_hash_converter_fixtures_1.UrlHashConverterFixtures.noSlashInEncodedDefinition2() },
        { version: "3", hash: url_hash_converter_fixtures_1.UrlHashConverterFixtures.noSlashInEncodedDefinition3() }
    ];
    minimalNumberOfSegmentsTests.forEach(({ version, hash }) => {
        it(`decodes version ${version} with minimal number of segments`, () => {
            const decodedEssence = url_hash_converter_1.urlHashConverter.essenceFromHash(hash, data_cube_fixtures_1.DataCubeFixtures.wiki());
            chai_1.expect(decodedEssence).to.be.an.instanceOf(essence_1.Essence);
        });
    });
    const wrongHashStructureTests = [
        { hash: "table/2", errorMessage: "Unsupported url hash: table/2" },
        { hash: "xxyz", errorMessage: "Expected 2 hash segments, got 1." },
        { hash: "3", errorMessage: "Expected 2 hash segments, got 1." },
        { hash: "3/AAAAA", errorMessage: "Unexpected end of JSON input" }
    ];
    wrongHashStructureTests.forEach(({ hash, errorMessage }) => {
        it(`throws error for hash: "${hash}" with wrong structure`, () => {
            const essenceFromHashCall = () => url_hash_converter_1.urlHashConverter.essenceFromHash(hash, data_cube_fixtures_1.DataCubeFixtures.wiki());
            chai_1.expect(essenceFromHashCall).to.throw(errorMessage);
        });
    });
});
//# sourceMappingURL=url-hash-converter.mocha.js.map