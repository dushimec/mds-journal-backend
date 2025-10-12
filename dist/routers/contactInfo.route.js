"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contactInfo_controller_1 = __importDefault(require("../controllers/contactInfo.controller"));
const contactInfoValidation_1 = require("../middlewares/validations/contactInfoValidation");
const validate_1 = require("../middlewares/validate");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.post('/', authMiddleware_1.authenticate, (0, authMiddleware_1.authorizeRoles)(client_1.UserRole.ADMIN), contactInfoValidation_1.createContactInfoValidation, validate_1.validate, contactInfo_controller_1.default.createContactInfo);
router.get('/', contactInfo_controller_1.default.getContactInfo);
router.patch('/', authMiddleware_1.authenticate, (0, authMiddleware_1.authorizeRoles)(client_1.UserRole.ADMIN), contactInfoValidation_1.updateContactInfoValidation, validate_1.validate, contactInfo_controller_1.default.updateContactInfo);
exports.default = router;
//# sourceMappingURL=contactInfo.route.js.map