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
exports.Device = exports.DeviceSize = void 0;
var DeviceSize;
(function (DeviceSize) {
    DeviceSize["SMALL"] = "small";
    DeviceSize["MEDIUM"] = "medium";
    DeviceSize["LARGE"] = "large";
})(DeviceSize = exports.DeviceSize || (exports.DeviceSize = {}));
class Device {
    static getSize() {
        if (window.innerWidth <= 1080)
            return DeviceSize.SMALL;
        if (window.innerWidth <= 1250)
            return DeviceSize.MEDIUM;
        return DeviceSize.LARGE;
    }
}
exports.Device = Device;
//# sourceMappingURL=device.js.map