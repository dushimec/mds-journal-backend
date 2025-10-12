"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const asyncHandler_1 = require("../utils/asyncHandler");
const appError_1 = require("../utils/appError");
const express_validator_1 = require("express-validator");
const email_1 = require("../utils/email");
class NewsletterSubscriberController {
    subscribe = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { email } = (0, express_validator_1.matchedData)(req);
        const existingSubscriber = await database_1.prisma.newsletterSubscriber.findUnique({
            where: { email },
        });
        if (existingSubscriber) {
            throw new appError_1.AppError('This email is already subscribed', 400);
        }
        const newsletters = await database_1.prisma.newsletter.findMany();
        const subscriber = await database_1.prisma.newsletterSubscriber.create({
            data: {
                email,
                receivedNewsletters: {
                    connect: newsletters.map(newsletter => ({ id: newsletter.id }))
                }
            },
        });
        // In a real application, sending a lot of emails should be done in a background job.
        if (newsletters.length > 0) {
            await Promise.all(newsletters.map(newsletter => (0, email_1.sendEmail)(email, newsletter.title, newsletter.content)));
        }
        res.status(201).json({
            status: 'success',
            data: {
                subscriber,
            },
            message: `Successfully subscribed. You should receive ${newsletters.length} previous newsletters shortly.`
        });
    });
    getAllSubscribers = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const subscribers = await database_1.prisma.newsletterSubscriber.findMany();
        res.status(200).json({
            status: 'success',
            results: subscribers.length,
            data: {
                subscribers,
            },
        });
    });
}
exports.default = new NewsletterSubscriberController();
//# sourceMappingURL=newsletterSubscriber.controller.js.map