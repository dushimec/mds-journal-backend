"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const faq_controller_1 = __importDefault(require("../controllers/faq.controller"));
const faqValidation_1 = require("../middlewares/validations/faqValidation");
const validate_1 = require("../middlewares/validate");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.get('/', faq_controller_1.default.getAllFaqs);
router.post('/', authMiddleware_1.authenticate, (0, authMiddleware_1.authorizeRoles)(client_1.UserRole.ADMIN), faqValidation_1.createFaqValidation, validate_1.validate, faq_controller_1.default.createFaq);
router.get('/:id', authMiddleware_1.authenticate, (0, authMiddleware_1.authorizeRoles)(client_1.UserRole.ADMIN), faq_controller_1.default.getFaqById);
router.patch('/:id', authMiddleware_1.authenticate, (0, authMiddleware_1.authorizeRoles)(client_1.UserRole.ADMIN), faqValidation_1.updateFaqValidation, validate_1.validate, faq_controller_1.default.updateFaq);
router.delete('/:id', authMiddleware_1.authenticate, (0, authMiddleware_1.authorizeRoles)(client_1.UserRole.ADMIN), faq_controller_1.default.deleteFaq);
exports.default = router;
//# sourceMappingURL=faq.route.js.map