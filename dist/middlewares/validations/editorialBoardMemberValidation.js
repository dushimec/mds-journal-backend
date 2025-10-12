"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchedData = exports.getByIdEditorialBoardMemberValidation = exports.deleteEditorialBoardMemberValidation = exports.updateEditorialBoardMemberValidation = exports.createEditorialBoardMemberValidation = exports.validate = void 0;
const express_validator_1 = require("express-validator");
const logger_1 = require("../../utils/logger");
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array({ onlyFirstError: true }).map(err => err.msg);
        logger_1.logger.warn(`EditorialBoardMember validation failed: ${errorMessages.join(", ")}`);
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errorMessages,
        });
    }
    next();
};
exports.validate = validate;
exports.createEditorialBoardMemberValidation = [
    (0, express_validator_1.body)("fullName").isString().withMessage("Full name is required"),
    (0, express_validator_1.body)("role").isString().withMessage("Role is required"),
    (0, express_validator_1.body)("qualifications").optional().isString(),
    (0, express_validator_1.body)("affiliation").optional().isString(),
    (0, express_validator_1.body)("bio").optional().isString(),
    (0, express_validator_1.body)("email").isEmail().withMessage("Valid email is required"),
    (0, express_validator_1.body)("order").optional().isInt({ min: 0 }).withMessage("Order must be a positive integer"),
    (0, express_validator_1.body)("isActive").optional().isBoolean(),
    // profileImage is handled by multer/cloudinary, not validated here
    exports.validate,
];
exports.updateEditorialBoardMemberValidation = [
    (0, express_validator_1.param)("id").isString().withMessage("Editorial board member ID is required"),
    (0, express_validator_1.body)("fullName").optional().isString(),
    (0, express_validator_1.body)("role").optional().isString(),
    (0, express_validator_1.body)("qualifications").optional().isString(),
    (0, express_validator_1.body)("affiliation").optional().isString(),
    (0, express_validator_1.body)("bio").optional().isString(),
    (0, express_validator_1.body)("email").optional().isEmail(),
    (0, express_validator_1.body)("order").optional().isInt({ min: 0 }),
    (0, express_validator_1.body)("isActive").optional().isBoolean(),
    // profileImage is handled by multer/cloudinary, not validated here
    exports.validate,
];
exports.deleteEditorialBoardMemberValidation = [
    (0, express_validator_1.param)("id").isString().withMessage("Editorial board member ID is required"),
    exports.validate,
];
exports.getByIdEditorialBoardMemberValidation = [
    (0, express_validator_1.param)("id").isString().withMessage("Editorial board member ID is required"),
    exports.validate,
];
var express_validator_2 = require("express-validator");
Object.defineProperty(exports, "matchedData", { enumerable: true, get: function () { return express_validator_2.matchedData; } });
//# sourceMappingURL=editorialBoardMemberValidation.js.map