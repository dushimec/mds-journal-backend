
import multer from "multer";
import { AppError } from "./appError";

const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ];
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(
    new AppError(
      "Invalid file type. Only PDF/DOC/DOCX and image files (JPEG/PNG/GIF/WebP/SVG) are allowed.",
      400
    ),
    false
  );
};

const limits = { fileSize: 20 * 1024 * 1024 };

export const upload = multer({ storage, fileFilter, limits });
export const uploadSingle = (fieldName: string) => upload.single(fieldName);
export const uploadMultiple = (fieldName: string) => upload.array(fieldName);
