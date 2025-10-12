"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const newsletter_controller_1 = __importDefault(require("../controllers/newsletter.controller"));
const newsletterSubscriber_controller_1 = __importDefault(require("../controllers/newsletterSubscriber.controller"));
const newsletterValidation_1 = require("../middlewares/validations/newsletterValidation");
const newsletterSubscriberValidation_1 = require("../middlewares/validations/newsletterSubscriberValidation");
const validate_1 = require("../middlewares/validate");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.post('/send', authMiddleware_1.authenticate, (0, authMiddleware_1.authorizeRoles)(client_1.UserRole.ADMIN), newsletterValidation_1.sendNewsletterValidation, validate_1.validate, newsletter_controller_1.default.sendNewsletter);
router.post('/subscribe', newsletterSubscriberValidation_1.subscribeValidation, validate_1.validate, newsletterSubscriber_controller_1.default.subscribe);
router.get('/subscribers', authMiddleware_1.authenticate, (0, authMiddleware_1.authorizeRoles)(client_1.UserRole.ADMIN), newsletterSubscriber_controller_1.default.getAllSubscribers);
exports.default = router;
//# sourceMappingURL=newsletter.route.js.map