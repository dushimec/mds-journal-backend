"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.authenticate = void 0;
const token_1 = require("../utils/token");
const appError_1 = require("../utils/appError");
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new appError_1.AppError("Access denied. No token provided.", 401);
        }
        const token = authHeader.split(" ")[1];
        const decoded = (0, token_1.verifyToken)(token);
        req.user = {
            userId: decoded.userId,
            role: decoded.role,
        };
        next();
    }
    catch (error) {
        if (error instanceof appError_1.AppError) {
            return next(error);
        }
        if (error.name === "JsonWebTokenError") {
            return next(new appError_1.AppError("Invalid token", 401));
        }
        if (error.name === "TokenExpiredError") {
            return next(new appError_1.AppError("Token expired", 401));
        }
        next(new appError_1.AppError("Authentication failed", 401));
    }
};
exports.authenticate = authenticate;
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new appError_1.AppError("Access denied", 403));
        }
        if (!allowedRoles.includes(req.user.role)) {
            return next(new appError_1.AppError("You do not have permission to perform this action", 403));
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
//# sourceMappingURL=authMiddleware.js.map