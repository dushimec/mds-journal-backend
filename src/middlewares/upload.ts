import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import cloudinary from "../config/cloudinary";
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";

// ----------------- Cloudinary storage -----------------
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "submissions",
    resource_type: "auto",
    public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
  }),
});

// Multer middleware with limits and file type validation
export const upload = multer({
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
export const uploadFile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError("No file uploaded", 400);
  }

  console.log("Uploaded file info:", req.file);

  // Get Cloudinary URL
  const fileUrl = (req.file as any).path || (req.file as any).filename;
  if (!fileUrl) {
    throw new AppError("Failed to get uploaded file URL from Cloudinary", 500);
  }

  res.status(201).json({
    success: true,
    file: {
      fileName: req.file.originalname, // Original file name
      fileUrl,                         // Cloudinary URL
      fileType: req.file.mimetype,     // MIME type
      fileSize: req.file.size,         // Size in bytes
    },
  });
});
