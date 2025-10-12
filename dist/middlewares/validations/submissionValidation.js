"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchedData = exports.getAllSubmissionsValidation = exports.getByIdSubmissionValidation = exports.deleteSubmissionValidation = exports.updateSubmissionValidation = exports.createSubmissionValidation = exports.validate = void 0;
const express_validator_1 = require("express-validator");
Object.defineProperty(exports, "matchedData", { enumerable: true, get: function () { return express_validator_1.matchedData; } });
const logger_1 = require("../../utils/logger");
const client_1 = require("@prisma/client");
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array({ onlyFirstError: true }).map(err => err.msg);
        logger_1.logger.warn(`Submission validation failed: ${errorMessages.join(", ")}`);
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errorMessages,
        });
    }
    next();
};
exports.validate = validate;
exports.createSubmissionValidation = [
    (0, express_validator_1.body)("manuscriptTitle")
        .optional()
        .isString()
        .withMessage("Manuscript title must be a string"),
    (0, express_validator_1.body)("abstract")
        .optional()
        .isString()
        .withMessage("Abstract must be a string"),
    (0, express_validator_1.body)("category")
        .optional()
        .isString()
        .withMessage("Category must be a string"),
    (0, express_validator_1.body)("keywords")
        .optional()
        .isString()
        .withMessage("Keywords must be a string"),
    (0, express_validator_1.body)("authors")
        .optional()
        .isArray()
        .withMessage("Authors must be an array"),
    (0, express_validator_1.body)("authors.*.fullName")
        .isString()
        .withMessage("Author fullName is required"),
    (0, express_validator_1.body)("authors.*.email")
        .isEmail()
        .withMessage("Author email must be valid"),
    (0, express_validator_1.body)("authors.*.affiliation")
        .isString()
        .withMessage("Author affiliation is required"),
    (0, express_validator_1.body)("authors.*.isCorresponding")
        .optional()
        .isBoolean()
        .withMessage("isCorresponding must be boolean"),
    (0, express_validator_1.body)("authors.*.order")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Author order must be a positive integer"),
    (0, express_validator_1.body)("files")
        .optional()
        .isArray()
        .withMessage("Files must be an array"),
    (0, express_validator_1.body)("files.*.fileName")
        .isString()
        .withMessage("fileName is required"),
    (0, express_validator_1.body)("files.*.fileUrl")
        .isString()
        .withMessage("fileUrl is required"),
    (0, express_validator_1.body)("files.*.mimeType")
        .isString()
        .withMessage("mimeType is required"),
    (0, express_validator_1.body)("files.*.fileSize")
        .isInt({ min: 1 })
        .withMessage("fileSize must be a positive integer"),
    (0, express_validator_1.body)("files.*.fileType")
        .optional()
        .isIn(Object.values(client_1.FileType))
        .withMessage(`fileType must be one of: ${Object.values(client_1.FileType).join(", ")}`),
    (0, express_validator_1.body)("declarations")
        .optional()
        .isArray()
        .withMessage("Declarations must be an array"),
    (0, express_validator_1.body)("declarations.*.type")
        .optional()
        .isIn(Object.values(client_1.DeclarationType))
        .withMessage(`Declaration type must be one of: ${Object.values(client_1.DeclarationType).join(", ")}`),
    (0, express_validator_1.body)("declarations.*.isChecked")
        .optional()
        .isBoolean()
        .withMessage("isChecked must be boolean"),
    (0, express_validator_1.body)("declarations.*.text")
        .isString()
        .withMessage("Declaration text is required"),
];
exports.updateSubmissionValidation = [
    (0, express_validator_1.param)("id").isString().withMessage("Submission ID is required"),
    (0, express_validator_1.body)("manuscriptTitle").optional().isString(),
    (0, express_validator_1.body)("abstract").optional().isString(),
    (0, express_validator_1.body)("category").optional().isString(),
    (0, express_validator_1.body)("keywords").optional().isString(),
    (0, express_validator_1.body)("status")
        .optional()
        .isIn(Object.values(client_1.SubmissionStatus))
        .withMessage(`Status must be one of: ${Object.values(client_1.SubmissionStatus).join(", ")}`),
];
exports.deleteSubmissionValidation = [
    (0, express_validator_1.param)("id").isString().withMessage("Submission ID is required"),
];
exports.getByIdSubmissionValidation = [
    (0, express_validator_1.param)("id").isString().withMessage("Submission ID is required"),
];
exports.getAllSubmissionsValidation = [
    (0, express_validator_1.query)("page").optional().isInt({ min: 1 }).toInt(),
    (0, express_validator_1.query)("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
];
//# sourceMappingURL=submissionValidation.js.map