// src/controllers/fileController.ts
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import { cloudinary } from "../config/cloudinary";
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";
import { prisma } from "../config/database";
import { FileType } from "@prisma/client";

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    resource_type: "auto",
    public_id: `${Date.now()}-${file.originalname.split(".").slice(0, -1).join(".")}`,
    type: "upload",
    access_mode: "public",
  }),
});


export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|docx|doc|zip|jpg|jpeg|png|webp/;
    const ext = file.originalname.toLowerCase().split(".").pop();
    if (!ext || !allowed.test(ext)) {
      return cb(new AppError("Invalid file type. Allowed: pdf, docx, doc, zip, image", 400));
    }
    cb(null, true);
  },
});

// --- Upload Single File ---
export const uploadFile = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file as any;
  if (!file || !file.path) throw new AppError("Cloudinary upload failed", 500);

  const submissionId = (req.body.submissionId || req.query.submissionId) as string;

  const savedFile = await prisma.fileUpload.create({
    data: {
      fileName: file.originalname,
      fileUrl: file.path,
      secureUrl: file.path,
      mimeType: file.mimetype,
      fileSize: file.size,
      fileType: FileType.MANUSCRIPT,
      submissionId: submissionId || undefined,
    },
  });

  res.status(201).json({
    success: true,
    file: {
      id: savedFile.id,
      fileName: savedFile.fileName,
      fileUrl: savedFile.fileUrl,
      secureUrl: savedFile.secureUrl,
      fileType: savedFile.mimeType,
      fileSize: savedFile.fileSize,
      submissionId: savedFile.submissionId,
    },
  });
});

// --- Upload Multiple Files ---
export const uploadFiles = [
  upload.array("files", 10),
  asyncHandler(async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) throw new AppError("No files uploaded", 400);

    const submissionId = (req.body.submissionId || req.query.submissionId) as string;

    const uploaded = await Promise.all(
      files.map(async (file: any) => {
        if (!file.path) throw new AppError("Cloudinary upload failed", 500);
        const saved = await prisma.fileUpload.create({
          data: {
            fileName: file.originalname,
            fileUrl: file.path,
            secureUrl: file.path,
            mimeType: file.mimetype,
            fileSize: file.size,
            fileType: FileType.MANUSCRIPT,
            submissionId: submissionId || undefined,
          },
        });
        return {
          id: saved.id,
          fileName: saved.fileName,
          fileUrl: saved.fileUrl,
          secureUrl: saved.secureUrl,
          fileType: saved.mimeType,
          fileSize: saved.fileSize,
          submissionId: saved.submissionId,
        };
      })
    );

    res.status(201).json({ success: true, files: uploaded });
  }),
];
