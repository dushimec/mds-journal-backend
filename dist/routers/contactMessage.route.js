"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contactMessage_controller_1 = __importDefault(require("../controllers/contactMessage.controller"));
const contactMessageValidation_1 = require("../middlewares/validations/contactMessageValidation");
const validate_1 = require("../middlewares/validate");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.post('/', contactMessageValidation_1.createContactMessageValidation, validate_1.validate, contactMessage_controller_1.default.createContactMessage);
router.get('/', authMiddleware_1.authenticate, (0, authMiddleware_1.authorizeRoles)(client_1.UserRole.ADMIN), contactMessage_controller_1.default.getAllContactMessages);
router.get('/:id', authMiddleware_1.authenticate, (0, authMiddleware_1.authorizeRoles)(client_1.UserRole.ADMIN), contactMessage_controller_1.default.getContactMessageById);
router.patch('/:id', authMiddleware_1.authenticate, (0, authMiddleware_1.authorizeRoles)(client_1.UserRole.ADMIN), contactMessage_controller_1.default.updateContactMessage);
router.delete('/:id', authMiddleware_1.authenticate, (0, authMiddleware_1.authorizeRoles)(client_1.UserRole.ADMIN), contactMessage_controller_1.default.deleteContactMessage);
exports.default = router;
//# sourceMappingURL=contactMessage.route.js.map