"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = exports.upload = void 0;
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("../config/cloudinary");
const asyncHandler_1 = require("../utils/asyncHandler");
const appError_1 = require("../utils/appError");
// ----------------- Cloudinary storage -----------------
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.cloudinary,
    params: async (req, file) => ({
        folder: "submissions",
        resource_type: "auto",
        public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
    }),
});
// Multer middleware with limits and file type validation
exports.upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max per file
    fileFilter: (req, file, cb) => {
        const allowed = /pdf|docx|doc|zip|jpg|jpeg|png|webp/;
        if (!allowed.test(file.originalname.toLowerCase())) {
            return cb(new Error("Invalid file type"));
        }
        cb(null, true);
    },
});
//Single file upload controller
exports.uploadFile = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.file) {
        throw new appError_1.AppError("No file uploaded", 400);
    }
    console.log("Uploaded file info:", req.file);
    // Get Cloudinary URL
    const fileUrl = req.file.path || req.file.filename;
    if (!fileUrl) {
        throw new appError_1.AppError("Failed to get uploaded file URL from Cloudinary", 500);
    }
    res.status(201).json({
        success: true,
        file: {
            fileName: req.file.originalname, // Original file name
            fileUrl, // Cloudinary URL
            fileType: req.file.mimetype, // MIME type
            fileSize: req.file.size, // Size in bytes
        },
    });
});
//# sourceMappingURL=upload.js.map