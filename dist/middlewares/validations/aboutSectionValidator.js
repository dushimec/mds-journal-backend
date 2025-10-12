"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sectionValidation = void 0;
const express_validator_1 = require("express-validator");
exports.sectionValidation = [
    (0, express_validator_1.body)("section").isString().withMessage("Section is required"),
    (0, express_validator_1.body)("content").notEmpty().withMessage("Content is required"),
    (0, express_validator_1.body)("order").optional().isInt().withMessage("Order must be an integer"),
];
//# sourceMappingURL=aboutSectionValidator.js.map