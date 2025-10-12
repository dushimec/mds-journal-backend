"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const asyncHandler_1 = require("../utils/asyncHandler");
const appError_1 = require("../utils/appError");
const express_validator_1 = require("express-validator");
class ContactInfoController {
    createContactInfo = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { intro, editorEmail, submissionsEmail, mailingAddress, officeHours, locationDescription, social, } = (0, express_validator_1.matchedData)(req);
        // Check if already exists
        const existing = await database_1.prisma.contactInfo.findUnique({
            where: { id: 'contact' },
        });
        if (existing) {
            throw new appError_1.AppError('Contact information already exists', 400);
        }
        const contactInfo = await database_1.prisma.contactInfo.create({
            data: {
                id: 'contact',
                intro,
                editorEmail,
                submissionsEmail,
                mailingAddress,
                officeHours,
                locationDescription,
                social,
            },
        });
        res.status(201).json({
            status: 'success',
            data: { contactInfo },
        });
    });
    getContactInfo = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const contactInfo = await database_1.prisma.contactInfo.findUnique({
            where: { id: 'contact' },
        });
        if (!contactInfo) {
            throw new appError_1.AppError('Contact information not found', 404);
        }
        res.status(200).json({
            status: 'success',
            data: {
                contactInfo,
            },
        });
    });
    updateContactInfo = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { intro, editorEmail, submissionsEmail, mailingAddress, officeHours, locationDescription, social, } = (0, express_validator_1.matchedData)(req);
        const updatedContactInfo = await database_1.prisma.contactInfo.update({
            where: { id: 'contact' },
            data: {
                intro,
                editorEmail,
                submissionsEmail,
                mailingAddress,
                officeHours,
                locationDescription,
                social,
            },
        });
        res.status(200).json({
            status: 'success',
            data: {
                contactInfo: updatedContactInfo,
            },
        });
    });
}
exports.default = new ContactInfoController();
//# sourceMappingURL=contactInfo.controller.js.map