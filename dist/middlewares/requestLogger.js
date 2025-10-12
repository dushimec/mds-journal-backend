"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const logger_1 = require("../utils/logger");
const requestLogger = (req, res, next) => {
    logger_1.logger.info(`Incoming Request: ${req.method} ${req.originalUrl} from ${req.ip}`);
    next();
};
exports.requestLogger = requestLogger;
//# sourceMappingURL=requestLogger.js.map