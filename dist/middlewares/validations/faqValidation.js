"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFaqValidation = exports.createFaqValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createFaqValidation = [
    (0, express_validator_1.body)('question').isString().notEmpty().withMessage('Question is required'),
    (0, express_validator_1.body)('answer').isString().notEmpty().withMessage('Answer is required'),
    (0, express_validator_1.body)('order').optional().isInt(),
];
exports.updateFaqValidation = [
    (0, express_validator_1.body)('question').optional().isString(),
    (0, express_validator_1.body)('answer').optional().isString(),
    (0, express_validator_1.body)('order').optional().isInt(),
    (0, express_validator_1.body)('isActive').optional().isBoolean(),
];
//# sourceMappingURL=faqValidation.js.map