import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import cloudinary from "../config/cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "submissions",
    resource_type: "auto",
    public_id: `${Date.now()}-${file.originalname.split(".")[0]}`, // unique name
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
