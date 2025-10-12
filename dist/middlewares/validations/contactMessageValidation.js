"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContactMessageValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createContactMessageValidation = [
    (0, express_validator_1.body)('firstName').isString().notEmpty().withMessage('First name is required'),
    (0, express_validator_1.body)('lastName').isString().notEmpty().withMessage('Last name is required'),
    (0, express_validator_1.body)('email').isEmail().withMessage('A valid email is required'),
    (0, express_validator_1.body)('institution').optional().isString(),
    (0, express_validator_1.body)('inquiryType').isString().notEmpty().withMessage('Inquiry type is required'),
    (0, express_validator_1.body)('subject').isString().notEmpty().withMessage('Subject is required'),
    (0, express_validator_1.body)('message').isString().notEmpty().withMessage('Message is required'),
];
//# sourceMappingURL=contactMessageValidation.js.map