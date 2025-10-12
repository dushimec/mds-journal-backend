import { Request, Response } from "express";
import { matchedData } from "express-validator";
import { prisma } from "../config/database";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";
import { UserRole, SubmissionStatus } from "@prisma/client";

const getPagination = (req: Request) => {
  const page = Math.max(1, parseInt((matchedData(req) as any).page) || 1);
  const limit = Math.min(100, parseInt((matchedData(req) as any).limit) || 10);
  return { skip: (page - 1) * limit, take: limit, page };
};

export class SubmissionController {
  // File upload (single)
 static uploadFile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError("No file uploaded", 400);
    }
    console.log("Uploaded file info:", req.file);
    const fileUrl = (req.file as any).path || (req.file as any).filename || "";

    if (!fileUrl) {
      throw new AppError("Failed to get uploaded file URL from Cloudinary", 500);
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
static uploadFiles = asyncHandler(async (req: Request, res: Response) => {
  if (!req.files || !(req.files as any[]).length) {
    throw new AppError("No files uploaded", 400);
  }

  const uploadedFiles = (req.files as any[]).map((file) => {
    const fileUrl = file.path || file.filename;
    if (!fileUrl) {
      throw new AppError(`Failed to get URL for file ${file.originalname}`, 500);
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


  static create = asyncHandler(async (req: Request, res: Response) => {
    if (req.user?.role !== UserRole.AUTHOR) {
      throw new AppError("Only authors can submit, please login!", 403);
    }

    const data = matchedData(req);

    const submission = await prisma.submission.create({
      data: {
        manuscriptTitle: data.manuscriptTitle,
        abstract: data.abstract,
        topicId: data.topicId,
        keywords: data.keywords,
        status: SubmissionStatus.DRAFT,
        userId: req.user?.userId ?? null,

        authors: {
          create: data.authors.map((a: any) => ({
            fullName: a.fullName,
            email: a.email,
            affiliation: a.affiliation,
            isCorresponding: a.isCorresponding,
            order: a.order,
            userId: req.user?.userId ?? null,
          })),
        },

        files: {
          create: data.files.map((f: any) => ({
            fileName: f.fileName,
            fileType: f.fileType,
            fileUrl: f.fileUrl,
            mimeType: f.mimeType,
            fileSize: f.fileSize,
          })),
        },

        declarations: {
          create: data.declarations.map((d: any) => ({
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


  static getAll = asyncHandler(async (req: Request, res: Response) => {
    if (req.user?.role !== UserRole.ADMIN) {
      throw new AppError("Only admin, please login as ADMIN!", 403);
    }

    const { skip, take, page } = getPagination(req);
    const total = await prisma.submission.count();

    const submissions = await prisma.submission.findMany({
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        authors: true,
        files: true,
        declarations: true,
        user: { select: { firstName: true, lastName: true, email: true } },
        topic: true,
      },
    });

    res.json({
      success: true,
      data: submissions,
      meta: { total, page, lastPage: Math.ceil(total / take), perPage: take },
    });
  });


  static getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const submission = await prisma.submission.findUnique({
      where: { id: String(id) },
      include: {
        authors: true,
        files: true,
        declarations: true,
        user: { select: { firstName: true, lastName: true, email: true } },
        topic: true,
      },
    });

    if (!submission) throw new AppError("Submission not found", 404);


    if (req.user?.role === UserRole.ADMIN && submission.userId !== req.user.userId) {
      throw new AppError("Access denied, ADMIN only can access!", 403);
    }

    res.json({ success: true, data: submission });
  });


  static update = asyncHandler(async (req: Request, res: Response) => {
    const { ...data } = matchedData(req);
    const { id } = req.params;

    const submission = await prisma.submission.findUnique({ where: { id: String(id) } });

    if (!submission) throw new AppError("Submission not found", 404);

    if (req.user?.role === UserRole.AUTHOR) {
      if (submission.userId !== req.user.userId) throw new AppError("Access denied", 403);
      if (submission.status !== SubmissionStatus.DRAFT) {
        throw new AppError("Only draft submissions can be edited", 400);
      }
    }

    const updated = await prisma.submission.update({
      where: { id: String(id) },
      data,
      include: { authors: true, files: true, declarations: true },
    });

    res.json({ success: true, data: updated });
  });


  static delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = matchedData(req);
    const submission = await prisma.submission.findUnique({ where: { id: String(id) } });

    if (!submission) throw new AppError("Submission not found", 404);
    if (req.user?.role !== UserRole.ADMIN) {
      throw new AppError("Access denied, Admin only should delete submissions! ", 403);
    }

    await prisma.submission.delete({ where: { id: String(id) } });
    res.json({ success: true, message: "Submission deleted" });
  });


  static stats = asyncHandler(async (req: Request, res: Response) => {
    const total = await prisma.submission.count();
    const byStatus = await prisma.submission.groupBy({
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
