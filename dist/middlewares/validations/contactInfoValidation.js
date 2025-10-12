"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateContactInfoValidation = exports.createContactInfoValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createContactInfoValidation = [
    (0, express_validator_1.body)('intro').notEmpty().isString(),
    (0, express_validator_1.body)('editorEmail').notEmpty().isEmail(),
    (0, express_validator_1.body)('submissionsEmail').notEmpty().isEmail(),
    (0, express_validator_1.body)('mailingAddress').notEmpty().isString(),
    (0, express_validator_1.body)('officeHours').notEmpty().isString(),
    (0, express_validator_1.body)('locationDescription').notEmpty().isString(),
    (0, express_validator_1.body)('social').optional().isObject(),
];
exports.updateContactInfoValidation = [
    (0, express_validator_1.body)('intro').optional().isString(),
    (0, express_validator_1.body)('editorEmail').optional().isEmail(),
    (0, express_validator_1.body)('submissionsEmail').optional().isEmail(),
    (0, express_validator_1.body)('mailingAddress').optional().isString(),
    (0, express_validator_1.body)('officeHours').optional().isString(),
    (0, express_validator_1.body)('locationDescription').optional().isString(),
    (0, express_validator_1.body)('social').optional().isObject(),
];
//# sourceMappingURL=contactInfoValidation.js.map