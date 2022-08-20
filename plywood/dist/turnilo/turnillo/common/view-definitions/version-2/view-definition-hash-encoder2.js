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
exports.ViewDefinitionHashEncoder2 = void 0;
const hash_conversions_1 = require("../hash-conversions");
class ViewDefinitionHashEncoder2 {
    decodeUrlHash(urlHash, visualization) {
        const jsArray = hash_conversions_1.hashToArray(urlHash);
        if (!(8 <= jsArray.length && jsArray.length <= 11))
            return null;
        return {
            visualization,
            timezone: jsArray[0],
            filter: jsArray[1],
            splits: jsArray[2],
            multiMeasureMode: jsArray[3],
            singleMeasure: jsArray[4],
            selectedMeasures: jsArray[5],
            pinnedDimensions: jsArray[6],
            pinnedSort: jsArray[7],
            compare: jsArray[9] || null,
            highlight: jsArray[10] || null
        };
    }
    encodeUrlHash(definition) {
        const compressed = [
            definition.timezone,
            definition.filter,
            definition.splits,
            definition.multiMeasureMode,
            definition.singleMeasure,
            definition.selectedMeasures,
            definition.pinnedDimensions,
            definition.pinnedSort,
            /*
             There were stored colors. We don't support them anymore so we write null here.
             We can't omit it here because that would force us to change decodeUrlHash and that
             would make it incompatible with old urls.
            */
            null,
            definition.compare,
            definition.highlight // 10
        ];
        return hash_conversions_1.arrayToHash(compressed);
    }
}
exports.ViewDefinitionHashEncoder2 = ViewDefinitionHashEncoder2;
//# sourceMappingURL=view-definition-hash-encoder2.js.map