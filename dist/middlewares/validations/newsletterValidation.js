"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNewsletterValidation = void 0;
const express_validator_1 = require("express-validator");
exports.sendNewsletterValidation = [
    (0, express_validator_1.body)('title').isString().notEmpty().withMessage('Title is required'),
    (0, express_validator_1.body)('content').isString().notEmpty().withMessage('Content is required'),
];
//# sourceMappingURL=newsletterValidation.js.map