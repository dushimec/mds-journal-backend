"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleController = void 0;
const express_validator_1 = require("express-validator");
const database_1 = require("../config/database");
const asyncHandler_1 = require("../utils/asyncHandler");
const appError_1 = require("../utils/appError");
const client_1 = require("@prisma/client");
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("../config/cloudinary");
const getPagination = (req) => {
    const page = Math.max(1, parseInt(req.query.page || "1"));
    const limit = Math.min(100, parseInt(req.query.limit || "10"));
    return { skip: (page - 1) * limit, take: limit, page, limit };
};
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
class ArticleController {
    static create = [
        upload.single("pdf"),
        (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            if (req.user?.role !== client_1.UserRole.ADMIN &&
                req.user?.role !== client_1.UserRole.EDITOR) {
                throw new appError_1.AppError("Only ADMIN or EDITOR can create articles", 403);
            }
            const { title, authors, abstract, publishedAt, doi, topicId, keywords, isHighlighted, order, issueId, } = (0, express_validator_1.matchedData)(req);
            if (!title || !authors || !publishedAt || !topicId || !keywords) {
                throw new appError_1.AppError("Missing required fields", 400);
            }
            let pdfUrl = undefined;
            if (req.file) {
                const result = await cloudinary_1.cloudinary.uploader.upload_stream({ resource_type: "raw", folder: "articles" }, (error, result) => {
                    if (error || !result)
                        throw new appError_1.AppError("Cloudinary upload failed", 500);
                    pdfUrl = result.secure_url;
                });
                result.end(req.file);
                await new Promise((resolve) => result.on("finish", resolve));
            }
            const article = await database_1.prisma.article.create({
                data: {
                    title,
                    authors,
                    abstract,
                    publishedAt: new Date(publishedAt),
                    doi,
                    pdfUrl,
                    topicId,
                    keywords,
                    isHighlighted: isHighlighted ?? false,
                    order: order ?? 0,
                    issueId,
                },
                include: { issue: true },
            });
            res.status(201).json({ success: true, data: article });
        }),
    ];
    static getAll = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { skip, take, page, limit } = getPagination(req);
        const { topicId, highlighted, search, issueId } = req.query;
        const where = {};
        if (topicId)
            where.topicId = topicId;
        if (highlighted !== undefined)
            where.isHighlighted = highlighted === "true";
        if (issueId)
            where.issueId = issueId;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { abstract: { contains: search, mode: "insensitive" } },
            ];
        }
        const [total, articles] = await Promise.all([
            database_1.prisma.article.count({ where }),
            database_1.prisma.article.findMany({
                where,
                skip,
                take,
                orderBy: [{ publishedAt: "desc" }, { order: "asc" }],
                include: { issue: true },
            }),
        ]);
        res.json({
            success: true,
            data: articles,
            meta: {
                total,
                page,
                perPage: limit,
                lastPage: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1,
            },
        });
    });
    static getById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const article = await database_1.prisma.article.findUnique({
            where: { id: String(id) },
            include: { issue: true },
        });
        if (!article)
            throw new appError_1.AppError("Article not found", 404);
        res.json({ success: true, data: article });
    });
    static update = [
        upload.single("pdf"), // Add Multer middleware for file upload
        (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const data = (0, express_validator_1.matchedData)(req);
            const article = await database_1.prisma.article.findUnique({ where: { id: String(id) } });
            if (!article)
                throw new appError_1.AppError("Article not found", 404);
            if (req.user?.role !== client_1.UserRole.ADMIN &&
                req.user?.role !== client_1.UserRole.EDITOR) {
                throw new appError_1.AppError("Only ADMIN or EDITOR can update articles", 403);
            }
            if (req.file) {
                const uploadResult = await new Promise((resolve, reject) => {
                    const stream = cloudinary_1.cloudinary.uploader.upload_stream({ resource_type: "raw", folder: "articles" }, (error, result) => {
                        if (error)
                            return reject(new appError_1.AppError("Cloudinary upload failed", 500));
                        resolve(result);
                    });
                    stream.end(req.file);
                });
                data.pdfUrl = uploadResult.secure_url;
            }
            const updated = await database_1.prisma.article.update({
                where: { id: String(id) },
                data,
                include: { issue: true },
            });
            res.json({ success: true, data: updated });
        }),
    ];
    static delete = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const article = await database_1.prisma.article.findUnique({ where: { id: String(id) } });
        if (!article)
            throw new appError_1.AppError("Article not found", 404);
        if (req.user?.role !== client_1.UserRole.ADMIN &&
            req.user?.role !== client_1.UserRole.EDITOR) {
            throw new appError_1.AppError("Only ADMIN or EDITOR can delete articles", 403);
        }
        await database_1.prisma.article.delete({ where: { id: String(id) } });
        res.json({ success: true, message: "Article deleted" });
    });
    static incrementViews = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const article = await database_1.prisma.article.update({
            where: { id: String(id) },
            data: { views: { increment: 1 } },
        });
        res.json({ success: true, data: article });
    });
    static incrementDownloads = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const article = await database_1.prisma.article.update({
            where: { id: String(id) },
            data: { downloads: { increment: 1 } },
        });
        res.json({ success: true, data: article });
    });
    static stats = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const total = await database_1.prisma.article.count();
        const byTopic = await database_1.prisma.article.groupBy({
            by: ["topicId"],
            _count: true,
        });
        const highlighted = await database_1.prisma.article.count({
            where: { isHighlighted: true },
        });
        res.json({
            success: true,
            data: {
                total,
                highlighted,
                byTopic: byTopic.map(({ topicId, _count }) => ({
                    topicId,
                    count: _count,
                })),
            },
        });
    });
    static bulkDelete = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        if (req.user?.role !== client_1.UserRole.ADMIN &&
            req.user?.role !== client_1.UserRole.EDITOR) {
            throw new appError_1.AppError("Only ADMIN or EDITOR can bulk delete articles", 403);
        }
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            throw new appError_1.AppError("No IDs provided", 400);
        }
        const result = await database_1.prisma.article.deleteMany({
            where: { id: { in: ids } },
        });
        res.json({ success: true, deleted: result.count });
    });
    static issueStats = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { issueId } = req.params;
        const totalArticles = await database_1.prisma.article.count({ where: { issueId } });
        const totalDownloads = await database_1.prisma.article.aggregate({
            where: { issueId },
            _sum: { downloads: true },
        });
        const totalViews = await database_1.prisma.article.aggregate({
            where: { issueId },
            _sum: { views: true },
        });
        res.json({
            success: true,
            data: {
                totalArticles,
                totalDownloads: totalDownloads._sum.downloads || 0,
                totalViews: totalViews._sum.views || 0,
            },
        });
    });
    static createIssue = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        if (req.user?.role !== client_1.UserRole.ADMIN &&
            req.user?.role !== client_1.UserRole.EDITOR) {
            throw new appError_1.AppError("Only ADMIN or EDITOR can create issues", 403);
        }
        const { title, volume, number, year, publishedAt, description } = (0, express_validator_1.matchedData)(req);
        if (!title || !volume || !number || !year || !publishedAt) {
            throw new appError_1.AppError("Missing required fields", 400);
        }
        const issue = await database_1.prisma.journalIssue.create({
            data: {
                title,
                issueNumber: number,
                year,
                publishedAt: new Date(publishedAt),
            },
        });
        res.status(201).json({ success: true, data: issue });
    });
}
exports.ArticleController = ArticleController;
//# sourceMappingURL=article.controller.js.map