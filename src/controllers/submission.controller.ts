import { Request, Response } from "express";
import { matchedData } from "express-validator";
import { prisma } from "../config/database";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";
import { UserRole, SubmissionStatus, FileType, DeclarationType } from "@prisma/client";

const getPagination = (req: Request) => {
  const page = Math.max(1, parseInt((matchedData(req) as any).page) || 1);
  const limit = Math.min(100, parseInt((matchedData(req) as any).limit) || 10);
  return { skip: (page - 1) * limit, take: limit, page };
};

export class SubmissionController {
  static create = asyncHandler(async (req: Request, res: Response) => {
    if (req.user?.role !== UserRole.AUTHOR) {
      throw new AppError("Only authors can submit", 403);
    }
    const data = matchedData(req);
    const authors = (data as any).authors || [];
    const files = (data as any).files || [];
    const declarations = (data as any).declarations || [];

    const submission = await prisma.submission.create({
      data: {
        ...data,
        userId: req.user.userId,
        status: SubmissionStatus.DRAFT,
        authors: { create: authors },
        files: { create: files.map((f: any) => ({ ...f, fileType: f.fileType || FileType.MANUSCRIPT })) },
        declarations: {
          create: declarations.map((d: any) => ({
            ...d,
            type: d.type || DeclarationType.ETHICAL_CONDUCT,
          })),
        },
      },
      include: { authors: true, files: true, declarations: true },
    });

    res.status(201).json({ success: true, data: submission });
  });

  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const where = req.user?.role === UserRole.AUTHOR ? { userId: req.user.userId } : {};
    const { skip, take, page } = getPagination(req);
    const total = await prisma.submission.count({ where });

    const submissions = await prisma.submission.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        authors: true,
        files: true,
        declarations: true,
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    res.json({
      success: true,
      data: submissions,
      meta: { total, page, lastPage: Math.ceil(total / take), perPage: take },
    });
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = matchedData(req);
    const submission = await prisma.submission.findUnique({
      where: { id: String(id) },
      include: {
        authors: true,
        files: true,
        declarations: true,
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    if (!submission) throw new AppError("Submission not found", 404);
    if (req.user?.role === UserRole.AUTHOR && submission.userId !== req.user.userId) {
      throw new AppError("Access denied", 403);
    }

    res.json({ success: true, data: submission });
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const { id, ...data } = matchedData(req);
    const submission = await prisma.submission.findUnique({ where: { id: String(id) } });

    if (!submission) throw new AppError("Submission not found", 404);
    if (req.user?.role === UserRole.AUTHOR) {
      if (submission.userId !== req.user.userId) throw new AppError("Access denied", 403);
      if (submission.status !== SubmissionStatus.DRAFT) throw new AppError("Only draft submissions can be edited", 400);
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
    if (req.user?.role === UserRole.AUTHOR && submission.userId !== req.user.userId) {
      throw new AppError("Access denied", 403);
    }

    await prisma.submission.delete({ where: { id: String(id) } });
    res.json({ success: true, message: "Submission deleted" });
  });

  static stats = asyncHandler(async (req: Request, res: Response) => {
    const where = req.user?.role === UserRole.AUTHOR ? { userId: req.user.userId } : {};
    const total = await prisma.submission.count({ where });
    const byStatus = await prisma.submission.groupBy({ by: ["status"], where, _count: true });

    res.json({
      success: true,
      data: {
        total,
        byStatus: byStatus.map(({ status, _count }) => ({ status, count: _count })),
      },
    });
  });
}
