"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchedData = exports.ResendCodeValidation = exports.verifyEmailValidation = exports.verify2FAValidation = exports.loginValidation = exports.registerValidation = exports.validate = void 0;
const express_validator_1 = require("express-validator");
Object.defineProperty(exports, "matchedData", { enumerable: true, get: function () { return express_validator_1.matchedData; } });
const logger_1 = require("../../utils/logger");
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array({ onlyFirstError: true }).map(err => err.msg);
        logger_1.logger.warn(`Validation failed: ${errorMessages.join(", ")}`);
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errorMessages,
        });
    }
    next();
};
exports.validate = validate;
exports.registerValidation = [
    (0, express_validator_1.body)("firstName")
        .trim()
        .notEmpty().withMessage("firstName is required")
        .isLength({ min: 2, max: 100 }).withMessage("firstName must be between 2 and 100 characters"),
    (0, express_validator_1.body)("lastName")
        .trim()
        .notEmpty().withMessage("lastName is required")
        .isLength({ min: 2, max: 100 }).withMessage("lastName must be between 2 and 100 characters"),
    (0, express_validator_1.body)("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Please provide a valid email")
        .normalizeEmail(),
    (0, express_validator_1.body)("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),
    (0, express_validator_1.body)("UserRole")
        .optional()
        .isIn(["AUTHOR", "EDITOR", "REVIEWER", "ADMIN", "READER"])
        .withMessage("Role must be one of: AUTHOR, EDITOR, REVIEWER, ADMIN, READER"),
];
exports.loginValidation = [
    (0, express_validator_1.body)("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Please provide a valid email")
        .normalizeEmail(),
    (0, express_validator_1.body)("password")
        .notEmpty().withMessage("Password is required"),
];
exports.verify2FAValidation = [
    (0, express_validator_1.body)("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Please provide a valid email")
        .normalizeEmail(),
    (0, express_validator_1.body)("code")
        .trim()
        .notEmpty().withMessage("2FA code is required")
        .isLength({ min: 6, max: 6 }).withMessage("2FA code must be exactly 6 digits")
        .matches(/^\d+$/).withMessage("2FA code must contain only digits"),
];
exports.verifyEmailValidation = [
    (0, express_validator_1.body)("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Please provide a valid email")
        .normalizeEmail(),
    (0, express_validator_1.body)("code")
        .trim()
        .notEmpty().withMessage("Verification code is required")
        .isLength({ min: 6, max: 6 }).withMessage("Verification code must be exactly 6 digits")
        .matches(/^\d+$/).withMessage("Verification code must contain only digits"),
];
exports.ResendCodeValidation = [
    (0, express_validator_1.body)("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Please provide a valid email")
        .normalizeEmail()
];
//# sourceMappingURL=authValidation.js.map