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
exports.StageFixtures = void 0;
const stage_1 = require("./stage");
class StageFixtures {
    static get DEFAULT_A_JS() {
        return {
            x: 10,
            y: 5,
            height: 2,
            width: 2
        };
    }
    static get DEFAULT_B_JS() {
        return {
            x: 10,
            y: 500,
            height: 2,
            width: 2
        };
    }
    static get DEFAULT_C_JS() {
        return {
            x: 10,
            y: 5,
            height: 3,
            width: 2
        };
    }
    static defaultA() {
        return stage_1.Stage.fromJS(StageFixtures.DEFAULT_A_JS);
    }
    static defaultB() {
        return stage_1.Stage.fromJS(StageFixtures.DEFAULT_B_JS);
    }
    static container() {
        return stage_1.Stage.fromSize(1000, 600);
    }
}
exports.StageFixtures = StageFixtures;
//# sourceMappingURL=stage.fixtures.js.map