"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const appError_1 = require("./appError");
const logger_1 = require("./logger");
const globalErrorHandler = (err, req, res, next) => {
    if (err instanceof appError_1.AppError) {
        return res.status(err.status).json({
            success: false,
            message: err.message,
            status: err.status,
        });
    }
    logger_1.logger.error(err.message);
    return res.status(500).json({
        success: false,
        message: "Internal server error",
        status: 500,
    });
};
exports.globalErrorHandler = globalErrorHandler;
//# sourceMappingURL=ErrorHandler.js.map