"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditorialBoardMemberController = void 0;
const express_validator_1 = require("express-validator");
const database_1 = require("../config/database");
const asyncHandler_1 = require("../utils/asyncHandler");
const appError_1 = require("../utils/appError");
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("../config/cloudinary");
const client_1 = require("@prisma/client"); // Make sure this import matches your project
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
class EditorialBoardMemberController {
    static create = [
        upload.single("profileImage"),
        (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            if (req.user?.role !== client_1.UserRole.ADMIN) {
                throw new appError_1.AppError("Only ADMIN can add editorial board members", 403);
            }
            const { fullName, role, qualifications, affiliation, bio, email, order, isActive, } = (0, express_validator_1.matchedData)(req);
            let profileImage = undefined;
            if (req.file?.buffer) {
                const uploadResult = await new Promise((resolve, reject) => {
                    const stream = cloudinary_1.cloudinary.uploader.upload_stream({ folder: "editorial-board", resource_type: "image" }, (error, result) => {
                        if (error || !result)
                            return reject(new appError_1.AppError("Cloudinary upload failed", 500));
                        resolve(result);
                    });
                    if (req.file && req.file.buffer) {
                        stream.end(req.file.buffer);
                    }
                });
                profileImage = uploadResult.secure_url;
            }
            const member = await database_1.prisma.editorialBoardMember.create({
                data: {
                    fullName,
                    role,
                    qualifications,
                    affiliation,
                    bio,
                    email,
                    order: order ?? 0,
                    isActive: isActive ?? true,
                    profileImage,
                },
            });
            res.status(201).json({ success: true, data: member });
        }),
    ];
    static update = [
        upload.single("profileImage"),
        (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const data = (0, express_validator_1.matchedData)(req);
            const member = await database_1.prisma.editorialBoardMember.findUnique({ where: { id: String(id) } });
            if (!member)
                throw new appError_1.AppError("Editorial board member not found", 404);
            if (req.file?.buffer) {
                const uploadResult = await new Promise((resolve, reject) => {
                    const stream = cloudinary_1.cloudinary.uploader.upload_stream({ folder: "editorial-board", resource_type: "image" }, (error, result) => {
                        if (error || !result)
                            return reject(new appError_1.AppError("Cloudinary upload failed", 500));
                        resolve(result);
                    });
                    if (req.file && req.file.buffer) {
                        stream.end(req.file.buffer);
                    }
                });
                data.profileImage = uploadResult.secure_url;
            }
            const updated = await database_1.prisma.editorialBoardMember.update({
                where: { id: String(id) },
                data,
            });
            res.json({ success: true, data: updated });
        }),
    ];
    static getAll = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const members = await database_1.prisma.editorialBoardMember.findMany({
            orderBy: { order: "asc" },
        });
        res.json({ success: true, data: members });
    });
    static getById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const member = await database_1.prisma.editorialBoardMember.findUnique({
            where: { id: String(id) },
        });
        if (!member)
            throw new appError_1.AppError("Editorial board member not found", 404);
        res.json({ success: true, data: member });
    });
    static delete = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const member = await database_1.prisma.editorialBoardMember.findUnique({ where: { id: String(id) } });
        if (!member)
            throw new appError_1.AppError("Editorial board member not found", 404);
        await database_1.prisma.editorialBoardMember.delete({ where: { id: String(id) } });
        res.json({ success: true, message: "Editorial board member deleted" });
    });
}
exports.EditorialBoardMemberController = EditorialBoardMemberController;
//# sourceMappingURL=editorialBoardMember.controller.js.map