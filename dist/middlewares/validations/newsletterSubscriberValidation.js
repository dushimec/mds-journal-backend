"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscribeValidation = void 0;
const express_validator_1 = require("express-validator");
exports.subscribeValidation = [(0, express_validator_1.body)('email').isEmail().withMessage('A valid email is required')];
//# sourceMappingURL=newsletterSubscriberValidation.js.map