"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const asyncHandler_1 = require("../utils/asyncHandler");
const appError_1 = require("../utils/appError");
const express_validator_1 = require("express-validator");
const email_1 = require("../utils/email");
class NewsletterController {
    sendNewsletter = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { title, content } = (0, express_validator_1.matchedData)(req);
        const subscribers = await database_1.prisma.newsletterSubscriber.findMany({
            select: {
                id: true,
                email: true,
            },
        });
        if (subscribers.length === 0) {
            throw new appError_1.AppError('There are no subscribers to send a newsletter to.', 404);
        }
        const newNewsletter = await database_1.prisma.newsletter.create({
            data: {
                title,
                content,
                recipients: {
                    connect: subscribers.map(subscriber => ({ id: subscriber.id }))
                }
            },
        });
        const subscriberEmails = subscribers.map((subscriber) => subscriber.email);
        // In a real application, you might want to send these emails in a background job
        await Promise.all(subscriberEmails.map((email) => (0, email_1.sendEmail)(email, title, content)));
        res.status(200).json({
            status: 'success',
            message: `Newsletter sent to ${subscriberEmails.length} subscribers.`,
            data: newNewsletter,
        });
    });
}
exports.default = new NewsletterController();
//# sourceMappingURL=newsletter.controller.js.map