"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const asyncHandler_1 = require("../utils/asyncHandler");
const appError_1 = require("../utils/appError");
const express_validator_1 = require("express-validator");
class FaqController {
    createFaq = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const data = (0, express_validator_1.matchedData)(req);
        const faq = await database_1.prisma.fAQ.create({
            data: {
                question: data.question,
                answer: data.answer,
                order: data.order,
            },
        });
        res.status(201).json({
            status: 'success',
            data: {
                faq,
            },
        });
    });
    getAllFaqs = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const faqs = await database_1.prisma.fAQ.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
        });
        res.status(200).json({
            status: 'success',
            results: faqs.length,
            data: {
                faqs,
            },
        });
    });
    getFaqById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const faq = await database_1.prisma.fAQ.findUnique({
            where: { id },
        });
        if (!faq) {
            throw new appError_1.AppError('No FAQ found with that ID', 404);
        }
        res.status(200).json({
            status: 'success',
            data: {
                faq,
            },
        });
    });
    updateFaq = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const data = (0, express_validator_1.matchedData)(req);
        const faq = await database_1.prisma.fAQ.update({
            where: { id },
            data: data,
        });
        res.status(200).json({
            status: 'success',
            data: {
                faq,
            },
        });
    });
    deleteFaq = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        await database_1.prisma.fAQ.delete({
            where: { id },
        });
        res.status(204).json({
            status: 'success',
            data: null,
        });
    });
}
exports.default = new FaqController();
//# sourceMappingURL=faq.controller.js.map