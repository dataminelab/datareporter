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
exports.TimeMonitor = void 0;
const timekeeper_1 = require("../../models/timekeeper/timekeeper");
class TimeMonitor {
    constructor(logger) {
        this.doingChecks = false;
        this.doCheck = ({ name }) => {
            const { logger, checks } = this;
            const check = checks.get(name);
            if (!check)
                return Promise.resolve(null);
            return check().then(updatedTime => {
                logger.log(`Got the latest time for '${name}' (${updatedTime.toISOString()})`);
                this.timekeeper = this.timekeeper.updateTime(name, updatedTime);
            }).catch(e => {
                logger.error(`Error getting time for '${name}': ${e.message}`);
            });
        };
        this.isStale = (timeTag) => {
            const { timekeeper, regularCheckInterval } = this;
            const now = timekeeper.now().valueOf();
            return !timeTag.time || now - timeTag.updated.valueOf() > regularCheckInterval;
        };
        this.doChecks = () => {
            const { doingChecks, timekeeper } = this;
            if (doingChecks)
                return;
            const timeTags = timekeeper.timeTags;
            this.doingChecks = true;
            const checkTasks = timeTags.filter(this.isStale).map(this.doCheck);
            Promise.all(checkTasks).then(() => {
                this.doingChecks = false;
            });
        };
        this.logger = logger;
        this.checks = new Map();
        this.regularCheckInterval = 60000;
        this.specialCheckInterval = 60000;
        this.timekeeper = timekeeper_1.Timekeeper.EMPTY;
        setInterval(this.doChecks, 1000);
    }
    removeCheck(name) {
        this.checks.delete(name);
        this.timekeeper = this.timekeeper.removeTimeTagFor(name);
        return this;
    }
    addCheck(name, check) {
        this.checks.set(name, check);
        this.timekeeper = this.timekeeper.addTimeTagFor(name);
        return this;
    }
}
exports.TimeMonitor = TimeMonitor;
//# sourceMappingURL=time-monitor.js.map