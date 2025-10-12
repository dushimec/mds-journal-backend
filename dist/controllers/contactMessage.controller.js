"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const asyncHandler_1 = require("../utils/asyncHandler");
const appError_1 = require("../utils/appError");
const express_validator_1 = require("express-validator");
class ContactMessageController {
    createContactMessage = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const data = (0, express_validator_1.matchedData)(req);
        const contactMessage = await database_1.prisma.contactMessage.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                institution: data.institution,
                inquiryType: data.inquiryType,
                subject: data.subject,
                message: data.message,
            },
        });
        res.status(201).json({
            status: 'success',
            data: {
                contactMessage,
            },
        });
    });
    getAllContactMessages = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const contactMessages = await database_1.prisma.contactMessage.findMany();
        res.status(200).json({
            status: 'success',
            results: contactMessages.length,
            data: {
                contactMessages,
            },
        });
    });
    getContactMessageById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const contactMessage = await database_1.prisma.contactMessage.findUnique({
            where: { id },
        });
        if (!contactMessage) {
            throw new appError_1.AppError('No contact message found with that ID', 404);
        }
        res.status(200).json({
            status: 'success',
            data: {
                contactMessage,
            },
        });
    });
    updateContactMessage = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const { isRead } = req.body;
        const contactMessage = await database_1.prisma.contactMessage.update({
            where: { id },
            data: {
                isRead,
            },
        });
        res.status(200).json({
            status: 'success',
            data: {
                contactMessage,
            },
        });
    });
    deleteContactMessage = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        await database_1.prisma.contactMessage.delete({
            where: { id },
        });
        res.status(204).json({
            status: 'success',
            data: null,
        });
    });
}
exports.default = new ContactMessageController();
//# sourceMappingURL=contactMessage.controller.js.map