"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleLogs = void 0;
const logger_1 = require("../logger/logger");
const handleLogs = (req, next) => {
    logger_1.logger.info(`${req.method} to  ${req.url}`);
    next();
};
exports.handleLogs = handleLogs;
//# sourceMappingURL=requestLogs.js.map