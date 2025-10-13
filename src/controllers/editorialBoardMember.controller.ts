import { Request, Response } from "express";
import { matchedData } from "express-validator";
import { prisma } from "../config/database";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";
import multer from "multer";
import { cloudinary } from "../config/cloudinary";
import { UserRole } from "@prisma/client"; // Make sure this import matches your project

const upload = multer({ storage: multer.memoryStorage() });

export class EditorialBoardMemberController {
  static create = [
    upload.single("profileImage"),
    asyncHandler(async (req: Request, res: Response) => {
    
      if (!req.file) {
        throw new AppError("Profile image is required", 400);
      }

      const {
        fullName,
        role,
        qualifications,
        affiliation,
        bio,
        email,
        order,
        isActive,
      } = matchedData(req);

      let profileImage: string | undefined = undefined;
      if (req.file?.buffer) {
        const uploadResult = await new Promise<any>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "editorial-board", resource_type: "image" },
            (error, result) => {
              if (error || !result) return reject(new AppError("Cloudinary upload failed", 500));
              resolve(result);
            }
          );
          if (req.file && req.file.buffer) {
            stream.end(req.file.buffer);
          }
        });
        profileImage = uploadResult.secure_url;
      }
      
      if (!profileImage) {
        throw new AppError("Profile image upload failed", 500);
      }

      const member = await prisma.editorialBoardMember.create({
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
    asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params;
      const data = matchedData(req);

      const member = await prisma.editorialBoardMember.findUnique({ where: { id: String(id) } });
      if (!member) throw new AppError("Editorial board member not found", 404);

      if (req.file?.buffer) {
        const uploadResult = await new Promise<any>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "editorial-board", resource_type: "image" },
            (error, result) => {
              if (error || !result) return reject(new AppError("Cloudinary upload failed", 500));
              resolve(result);
            }
          );
          if (req.file && req.file.buffer) {
            stream.end(req.file.buffer);
          }
        });
        data.profileImage = uploadResult.secure_url;
      }

      const updated = await prisma.editorialBoardMember.update({
        where: { id: String(id) },
        data,
      });

      res.json({ success: true, data: updated });
    }),
  ];

  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const members = await prisma.editorialBoardMember.findMany({
      orderBy: { order: "asc" },
    });
    res.json({ success: true, data: members });
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const member = await prisma.editorialBoardMember.findUnique({
      where: { id: String(id) },
    });
    if (!member) throw new AppError("Editorial board member not found", 404);
    res.json({ success: true, data: member });
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const member = await prisma.editorialBoardMember.findUnique({ where: { id: String(id) } });
    if (!member) throw new AppError("Editorial board member not found", 404);

    await prisma.editorialBoardMember.delete({ where: { id: String(id) } });
    res.json({ success: true, message: "Editorial board member deleted" });
  });
}
