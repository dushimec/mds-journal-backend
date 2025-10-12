"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmissionController = void 0;
const express_validator_1 = require("express-validator");
const database_1 = require("../config/database");
const asyncHandler_1 = require("../utils/asyncHandler");
const appError_1 = require("../utils/appError");
const client_1 = require("@prisma/client");
const getPagination = (req) => {
    const page = Math.max(1, parseInt((0, express_validator_1.matchedData)(req).page) || 1);
    const limit = Math.min(100, parseInt((0, express_validator_1.matchedData)(req).limit) || 10);
    return { skip: (page - 1) * limit, take: limit, page };
};
class SubmissionController {
    // File upload (single)
    static uploadFile = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        if (!req.file) {
            throw new appError_1.AppError("No file uploaded", 400);
        }
        console.log("Uploaded file info:", req.file);
        const fileUrl = req.file.path || req.file.filename || "";
        if (!fileUrl) {
            throw new appError_1.AppError("Failed to get uploaded file URL from Cloudinary", 500);
        }
        res.status(201).json({
            success: true,
            file: {
                fileName: req.file.originalname,
                fileUrl,
                fileType: req.file.mimetype,
                fileSize: req.file.size,
            },
        });
    });
    // File upload (multiple)
    static uploadFiles = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        if (!req.files || !req.files.length) {
            throw new appError_1.AppError("No files uploaded", 400);
        }
        const uploadedFiles = req.files.map((file) => {
            const fileUrl = file.path || file.filename;
            if (!fileUrl) {
                throw new appError_1.AppError(`Failed to get URL for file ${file.originalname}`, 500);
            }
            return {
                fileName: file.originalname,
                fileUrl,
                fileType: file.mimetype,
                fileSize: file.size,
            };
        });
        console.log("Uploaded files info:", uploadedFiles);
        res.status(201).json({
            success: true,
            files: uploadedFiles,
        });
    });
    static create = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        if (req.user?.role !== client_1.UserRole.AUTHOR) {
            throw new appError_1.AppError("Only authors can submit, please login!", 403);
        }
        const data = (0, express_validator_1.matchedData)(req);
        const submission = await database_1.prisma.submission.create({
            data: {
                manuscriptTitle: data.manuscriptTitle,
                abstract: data.abstract,
                topicId: data.topicId,
                keywords: data.keywords,
                status: client_1.SubmissionStatus.DRAFT,
                userId: req.user?.userId ?? null,
                authors: {
                    create: data.authors.map((a) => ({
                        fullName: a.fullName,
                        email: a.email,
                        affiliation: a.affiliation,
                        isCorresponding: a.isCorresponding,
                        order: a.order,
                        userId: req.user?.userId ?? null,
                    })),
                },
                files: {
                    create: data.files.map((f) => ({
                        fileName: f.fileName,
                        fileType: f.fileType,
                        fileUrl: f.fileUrl,
                        mimeType: f.mimeType,
                        fileSize: f.fileSize,
                    })),
                },
                declarations: {
                    create: data.declarations.map((d) => ({
                        type: d.type,
                        isChecked: d.isChecked,
                        text: d.text,
                    })),
                },
            },
            include: {
                authors: true,
                files: true,
                declarations: true,
            },
        });
        res.status(201).json({ success: true, data: submission });
    });
    static getAll = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        if (req.user?.role !== client_1.UserRole.ADMIN) {
            throw new appError_1.AppError("Only admin, please login as ADMIN!", 403);
        }
        const { skip, take, page } = getPagination(req);
        const total = await database_1.prisma.submission.count();
        const submissions = await database_1.prisma.submission.findMany({
            skip,
            take,
            orderBy: { createdAt: "desc" },
            include: {
                authors: true,
                files: true,
                declarations: true,
                user: { select: { firstName: true, lastName: true, email: true } },
            },
        });
        res.json({
            success: true,
            data: submissions,
            meta: { total, page, lastPage: Math.ceil(total / take), perPage: take },
        });
    });
    static getById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const submission = await database_1.prisma.submission.findUnique({
            where: { id: String(id) },
            include: {
                authors: true,
                files: true,
                declarations: true,
                user: { select: { firstName: true, lastName: true, email: true } },
            },
        });
        if (!submission)
            throw new appError_1.AppError("Submission not found", 404);
        if (req.user?.role === client_1.UserRole.ADMIN && submission.userId !== req.user.userId) {
            throw new appError_1.AppError("Access denied, ADMIN only can access!", 403);
        }
        res.json({ success: true, data: submission });
    });
    static update = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { ...data } = (0, express_validator_1.matchedData)(req);
        const { id } = req.params;
        const submission = await database_1.prisma.submission.findUnique({ where: { id: String(id) } });
        if (!submission)
            throw new appError_1.AppError("Submission not found", 404);
        if (req.user?.role === client_1.UserRole.AUTHOR) {
            if (submission.userId !== req.user.userId)
                throw new appError_1.AppError("Access denied", 403);
            if (submission.status !== client_1.SubmissionStatus.DRAFT) {
                throw new appError_1.AppError("Only draft submissions can be edited", 400);
            }
        }
        const updated = await database_1.prisma.submission.update({
            where: { id: String(id) },
            data,
            include: { authors: true, files: true, declarations: true },
        });
        res.json({ success: true, data: updated });
    });
    static delete = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = (0, express_validator_1.matchedData)(req);
        const submission = await database_1.prisma.submission.findUnique({ where: { id: String(id) } });
        if (!submission)
            throw new appError_1.AppError("Submission not found", 404);
        if (req.user?.role !== client_1.UserRole.ADMIN) {
            throw new appError_1.AppError("Access denied, Admin only should delete submissions! ", 403);
        }
        await database_1.prisma.submission.delete({ where: { id: String(id) } });
        res.json({ success: true, message: "Submission deleted" });
    });
    static stats = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const total = await database_1.prisma.submission.count();
        const byStatus = await database_1.prisma.submission.groupBy({
            by: ["status"],
            _count: true,
        });
        res.json({
            success: true,
            data: {
                total,
                byStatus: byStatus.map(({ status, _count }) => ({
                    status,
                    count: _count,
                })),
            },
        });
    });
}
exports.SubmissionController = SubmissionController;
//# sourceMappingURL=submission.controller.js.map