"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.getIssueStatsValidation = exports.incrementDownloadsValidation = exports.incrementViewsValidation = exports.bulkDeleteArticlesValidation = exports.createIssueValidation = exports.getByIdArticleValidation = exports.getAllArticlesValidation = exports.deleteArticleValidation = exports.updateArticleValidation = exports.createArticleValidation = void 0;
const express_validator_1 = require("express-validator");
const validate_1 = require("../../middlewares/validate");
Object.defineProperty(exports, "validate", { enumerable: true, get: function () { return validate_1.validate; } });
exports.createArticleValidation = [
    (0, express_validator_1.body)('title').isString().notEmpty(),
    (0, express_validator_1.body)('authors').isString().notEmpty(),
    (0, express_validator_1.body)('abstract').isString().notEmpty(),
    (0, express_validator_1.body)('publishedAt').isISO8601().toDate(),
    (0, express_validator_1.body)('keywords').isString().notEmpty(),
    (0, express_validator_1.body)('isHighlighted').isBoolean().optional(),
    (0, express_validator_1.body)('order').isInt().optional(),
    (0, express_validator_1.body)('topicId').isString().optional(),
    (0, express_validator_1.body)('issueId').isString().optional(),
];
exports.updateArticleValidation = [
    (0, express_validator_1.param)('id').isMongoId(),
    (0, express_validator_1.body)('title').isString().optional(),
    (0, express_validator_1.body)('authors').isString().optional(),
    (0, express_validator_1.body)('abstract').isString().optional(),
    (0, express_validator_1.body)('publishedAt').isISO8601().toDate().optional(),
    (0, express_validator_1.body)('keywords').isString().optional(),
    (0, express_validator_1.body)('isHighlighted').isBoolean().optional(),
    (0, express_validator_1.body)('order').isInt().optional(),
    (0, express_validator_1.body)('topicId').isString().optional(),
    (0, express_validator_1.body)('issueId').isString().optional(),
];
exports.deleteArticleValidation = [
    (0, express_validator_1.param)('id').isMongoId(),
];
exports.getAllArticlesValidation = [];
exports.getByIdArticleValidation = [
    (0, express_validator_1.param)('id').isMongoId(),
];
exports.createIssueValidation = [
    (0, express_validator_1.body)('name').isString().notEmpty(),
    (0, express_validator_1.body)('issueDate').isISO8601().toDate(),
];
exports.bulkDeleteArticlesValidation = [
    (0, express_validator_1.body)('articleIds').isArray().notEmpty(),
    (0, express_validator_1.body)('articleIds.*').isMongoId(),
];
exports.incrementViewsValidation = [
    (0, express_validator_1.param)('id').isMongoId(),
];
exports.incrementDownloadsValidation = [
    (0, express_validator_1.param)('id').isMongoId(),
];
exports.getIssueStatsValidation = [
    (0, express_validator_1.param)('issueId').isMongoId(),
];
//# sourceMappingURL=articleValidation.js.map