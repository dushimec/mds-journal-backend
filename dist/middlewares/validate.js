"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const express_validator_1 = require("express-validator");
const appError_1 = require("../utils/appError");
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => error.msg);
        return next(new appError_1.AppError(errorMessages.join(', '), 400));
    }
    next();
};
exports.validate = validate;
//# sourceMappingURL=validate.js.map