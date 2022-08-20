"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseFormatter = void 0;
const responseFormatter = (response) => {
    return response.map(query => query.map(value => value.split('\n').join(' ').trim()));
};
exports.responseFormatter = responseFormatter;
//# sourceMappingURL=response-formatter.js.map