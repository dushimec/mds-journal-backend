"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopicController = void 0;
const express_validator_1 = require("express-validator");
const database_1 = require("../config/database");
const asyncHandler_1 = require("../utils/asyncHandler");
const appError_1 = require("../utils/appError");
const client_1 = require("@prisma/client");
class TopicController {
    static create = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        if (req.user?.role !== client_1.UserRole.ADMIN &&
            req.user?.role !== client_1.UserRole.EDITOR) {
            throw new appError_1.AppError("Only ADMIN or EDITOR can create topics", 403);
        }
        const { name } = (0, express_validator_1.matchedData)(req);
        if (!name)
            throw new appError_1.AppError("Name is required", 400);
        const topic = await database_1.prisma.topic.create({
            data: { name },
        });
        res.status(201).json({ success: true, data: topic });
    });
    static getAll = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const topics = await database_1.prisma.topic.findMany({
            orderBy: { name: "asc" },
        });
        res.json({ success: true, data: topics });
    });
    static getById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const topic = await database_1.prisma.topic.findUnique({ where: { id: String(id) } });
        if (!topic)
            throw new appError_1.AppError("Topic not found", 404);
        res.json({ success: true, data: topic });
    });
    static update = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const { name } = (0, express_validator_1.matchedData)(req);
        const topic = await database_1.prisma.topic.findUnique({ where: { id: String(id) } });
        if (!topic)
            throw new appError_1.AppError("Topic not found", 404);
        if (req.user?.role !== client_1.UserRole.ADMIN &&
            req.user?.role !== client_1.UserRole.EDITOR) {
            throw new appError_1.AppError("Only ADMIN or EDITOR can update topics", 403);
        }
        const updated = await database_1.prisma.topic.update({
            where: { id: String(id) },
            data: { name },
        });
        res.json({ success: true, data: updated });
    });
    static delete = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const topic = await database_1.prisma.topic.findUnique({ where: { id: String(id) } });
        if (!topic)
            throw new appError_1.AppError("Topic not found", 404);
        if (req.user?.role !== client_1.UserRole.ADMIN &&
            req.user?.role !== client_1.UserRole.EDITOR) {
            throw new appError_1.AppError("Only ADMIN or EDITOR can delete topics", 403);
        }
        await database_1.prisma.topic.delete({ where: { id: String(id) } });
        res.json({ success: true, message: "Topic deleted" });
    });
}
exports.TopicController = TopicController;
//# sourceMappingURL=topic.controller.js.map