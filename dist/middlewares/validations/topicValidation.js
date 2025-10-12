"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getByIdTopicValidation = exports.deleteTopicValidation = exports.updateTopicValidation = exports.createTopicValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createTopicValidation = [
    (0, express_validator_1.body)("name")
        .isString()
        .trim()
        .notEmpty()
        .withMessage("Name is required"),
];
exports.updateTopicValidation = [
    (0, express_validator_1.body)("name")
        .optional()
        .isString()
        .trim()
        .notEmpty()
        .withMessage("Name must be a non-empty string"),
];
exports.deleteTopicValidation = [
    (0, express_validator_1.param)("id")
        .isString()
        .notEmpty()
        .withMessage("Valid topic ID is required"),
];
exports.getByIdTopicValidation = [
    (0, express_validator_1.param)("id")
        .isString()
        .notEmpty()
        .withMessage("Valid topic ID is required"),
];
// You likely already have a `validate` middleware that runs validationResult.
//# sourceMappingURL=topicValidation.js.map