"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("../config/cloudinary");
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.cloudinary,
    params: async (req, file) => ({
        folder: "submissions",
        resource_type: "auto",
        public_id: `${Date.now()}-${file.originalname.split(".")[0]}`, // unique name
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
//# sourceMappingURL=multerCloudinary.js.map