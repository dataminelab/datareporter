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
exports.urlHashConverter = exports.getHashSegments = void 0;
const view_definitions_1 = require("../../view-definitions");
const SEGMENT_SEPARATOR = "/";
const MINIMAL_HASH_SEGMENTS_COUNT = 2;
function isLegacyWithVisualizationPrefix(hashParts) {
    const [visualization, version] = hashParts;
    return view_definitions_1.version2Visualizations.has(visualization) && version === view_definitions_1.LEGACY_VIEW_DEFINITION_VERSION && hashParts.length >= 3;
}
function isVersion3VisualizationPrefix(hashParts) {
    return hashParts[0] === "3";
}
function isVersion4VisualizationPrefix(hashParts) {
    return hashParts[0] === "4";
}
function getHashSegments(hash) {
    const hashParts = hash.split(SEGMENT_SEPARATOR);
    if (hashParts.length < MINIMAL_HASH_SEGMENTS_COUNT) {
        throw new Error(`Expected ${MINIMAL_HASH_SEGMENTS_COUNT} hash segments, got ${hashParts.length}.`);
    }
    if (isLegacyWithVisualizationPrefix(hashParts)) {
        return {
            version: hashParts[1],
            encodedModel: hashParts.splice(2).join(SEGMENT_SEPARATOR),
            visualization: hashParts[0]
        };
    }
    else if (isVersion3VisualizationPrefix(hashParts)) {
        return {
            version: hashParts[0],
            encodedModel: hashParts.splice(1).join(SEGMENT_SEPARATOR),
            visualization: undefined
        };
    }
    else if (isVersion4VisualizationPrefix(hashParts)) {
        return {
            version: hashParts[0],
            encodedModel: hashParts.splice(1).join(SEGMENT_SEPARATOR),
            visualization: undefined
        };
    }
    else {
        throw new Error(`Unsupported url hash: ${hash}.`);
    }
}
exports.getHashSegments = getHashSegments;
exports.urlHashConverter = {
    essenceFromHash(hash, dataCube) {
        const { version, encodedModel, visualization } = getHashSegments(hash);
        const urlEncoder = view_definitions_1.definitionUrlEncoders[version];
        const definitionConverter = view_definitions_1.definitionConverters[version];
        const definition = urlEncoder.decodeUrlHash(encodedModel, visualization);
        return definitionConverter.fromViewDefinition(definition, dataCube);
    },
    toHash(essence, version = view_definitions_1.DEFAULT_VIEW_DEFINITION_VERSION) {
        //@ts-ignore
        const { visualization } = essence;
        const urlEncoder = view_definitions_1.definitionUrlEncoders[version];
        const definitionConverter = view_definitions_1.definitionConverters[version];
        if (urlEncoder == null || definitionConverter == null) {
            throw new Error(`Unsupported url hash version: ${version}.`);
        }
        const definition = definitionConverter.toViewDefinition(essence);
        const encodedDefinition = urlEncoder.encodeUrlHash(definition);
        const hashParts = [version, encodedDefinition];
        if (version === view_definitions_1.LEGACY_VIEW_DEFINITION_VERSION) {
            hashParts.unshift(visualization.name);
        }
        return hashParts.join(SEGMENT_SEPARATOR);
    }
};
//# sourceMappingURL=url-hash-converter.js.map