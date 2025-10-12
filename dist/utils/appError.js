"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
const logger_1 = require("./logger");
class AppError extends Error {
    status;
    isOperational;
    constructor(message, status, meta) {
        super(message);
        this.status = status;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
        logger_1.logger.error(message);
    }
}
exports.AppError = AppError;
//# sourceMappingURL=appError.js.map