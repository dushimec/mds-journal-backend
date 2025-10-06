import { Request, Response } from "express";
import { matchedData } from "express-validator";
import { prisma } from "../config/database";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";
import { UserRole } from "@prisma/client";
import multer from "multer";
import { cloudinary } from "../config/cloudinary";

const getPagination = (req: Request) => {
  const page = Math.max(1, parseInt((req.query.page as string) || "1"));
  const limit = Math.min(100, parseInt((req.query.limit as string) || "10"));
  return { skip: (page - 1) * limit, take: limit, page, limit };
};

const upload = multer({ storage: multer.memoryStorage() });

export class ArticleController {
  static create = [
    upload.single("pdf"), 
    asyncHandler(async (req: Request, res: Response) => {
      if (
        req.user?.role !== UserRole.ADMIN &&
        req.user?.role !== UserRole.EDITOR
      ) {
        throw new AppError("Only ADMIN or EDITOR can create articles", 403);
      }

      const {
        title,
        authors,
        abstract,
        publishedAt,
        doi,
        topicId,
        keywords,
        isHighlighted,
        order,
        issueId,
      } = matchedData(req);

      if (!title || !authors || !publishedAt || !topicId || !keywords) {
        throw new AppError("Missing required fields", 400);
      }

      let pdfUrl = undefined;
      if (req.file) {
        const result = await cloudinary.uploader.upload_stream(
          { resource_type: "raw", folder: "articles" },
          (error, result) => {
            if (error || !result) throw new AppError("Cloudinary upload failed", 500);
            pdfUrl = result.secure_url;
          }
        );
        result.end(req.file.buffer);
        await new Promise((resolve) => result.on("finish", resolve));
      }

      const article = await prisma.article.create({
        data: {
          title,
          authors,
          abstract,
          publishedAt: new Date(publishedAt),
          doi,
          pdfUrl,
          topicId,
          keywords,
          isHighlighted: isHighlighted ?? false,
          order: order ?? 0,
          issueId,
        },
        include: { issue: true },
      });

      res.status(201).json({ success: true, data: article });
    }),
  ];

  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const { skip, take, page, limit } = getPagination(req);
    const { topicId, highlighted, search, issueId } = req.query; 

    const where: any = {};
    if (topicId) where.topicId = topicId;
    if (highlighted !== undefined) where.isHighlighted = highlighted === "true";
    if (issueId) where.issueId = issueId;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: "insensitive" } },
        { abstract: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const [total, articles] = await Promise.all([
      prisma.article.count({ where }),
      prisma.article.findMany({
        where,
        skip,
        take,
        orderBy: [{ publishedAt: "desc" }, { order: "asc" }],
        include: { issue: true },
      }),
    ]);

    res.json({
      success: true,
      data: articles,
      meta: {
        total,
        page,
        perPage: limit,
        lastPage: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const article = await prisma.article.findUnique({
      where: { id: String(id) },
      include: { issue: true },
    });
    if (!article) throw new AppError("Article not found", 404);
    res.json({ success: true, data: article });
  });

  static update = [
    upload.single("pdf"), // Add Multer middleware for file upload
    asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params;
      const data = matchedData(req);

      const article = await prisma.article.findUnique({ where: { id: String(id) } });
      if (!article) throw new AppError("Article not found", 404);

      if (
        req.user?.role !== UserRole.ADMIN &&
        req.user?.role !== UserRole.EDITOR
      ) {
        throw new AppError("Only ADMIN or EDITOR can update articles", 403);
      }

      if (req.file) {
        const uploadResult: any = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "raw", folder: "articles" },
            (error, result) => {
              if (error) return reject(new AppError("Cloudinary upload failed", 500));
              resolve(result);
            }
          );
          stream.end(req.file.buffer);
        });
        data.pdfUrl = uploadResult.secure_url;
      }

      const updated = await prisma.article.update({
        where: { id: String(id) },
        data,
        include: { issue: true },
      });

      res.json({ success: true, data: updated });
    }),
  ];

  static delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const article = await prisma.article.findUnique({ where: { id: String(id) } });
    if (!article) throw new AppError("Article not found", 404);

    if (
      req.user?.role !== UserRole.ADMIN &&
      req.user?.role !== UserRole.EDITOR
    ) {
      throw new AppError("Only ADMIN or EDITOR can delete articles", 403);
    }

    await prisma.article.delete({ where: { id: String(id) } });
    res.json({ success: true, message: "Article deleted" });
  });

  static incrementViews = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const article = await prisma.article.update({
      where: { id: String(id) },
      data: { views: { increment: 1 } },
    });
    res.json({ success: true, data: article });
  });

  static incrementDownloads = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const article = await prisma.article.update({
      where: { id: String(id) },
      data: { downloads: { increment: 1 } },
    });
    res.json({ success: true, data: article });
  });

  static stats = asyncHandler(async (req: Request, res: Response) => {
    const total = await prisma.article.count();
    const byTopic = await prisma.article.groupBy({
      by: ["topicId"],
      _count: true,
    });
    const highlighted = await prisma.article.count({
      where: { isHighlighted: true },
    });

    res.json({
      success: true,
      data: {
        total,
        highlighted,
        byTopic: byTopic.map(({ topicId, _count }) => ({
          topicId,
          count: _count,
        })),
      },
    });
  });

  static bulkDelete = asyncHandler(async (req: Request, res: Response) => {
    if (
      req.user?.role !== UserRole.ADMIN &&
      req.user?.role !== UserRole.EDITOR
    ) {
      throw new AppError("Only ADMIN or EDITOR can bulk delete articles", 403);
    }

    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new AppError("No IDs provided", 400);
    }

    const result = await prisma.article.deleteMany({
      where: { id: { in: ids } },
    });

    res.json({ success: true, deleted: result.count });
  });

  static issueStats = asyncHandler(async (req: Request, res: Response) => {
    const { issueId } = req.params;
    const totalArticles = await prisma.article.count({ where: { issueId } });
    const totalDownloads = await prisma.article.aggregate({
      where: { issueId },
      _sum: { downloads: true },
    });
    const totalViews = await prisma.article.aggregate({
      where: { issueId },
      _sum: { views: true },
    });
    res.json({
      success: true,
      data: {
        totalArticles,
        totalDownloads: totalDownloads._sum.downloads || 0,
        totalViews: totalViews._sum.views || 0,
      },
    });
  });

  static createIssue = asyncHandler(async (req: Request, res: Response) => {
     if (
      req.user?.role !== UserRole.ADMIN &&
      req.user?.role !== UserRole.EDITOR
    ) {
      throw new AppError("Only ADMIN or EDITOR can create issues", 403);
    }
    const { title, volume, number, year, publishedAt, description } = matchedData(req);

    if (!title || !volume || !number || !year || !publishedAt) {
      throw new AppError("Missing required fields", 400);
    }

    const issue = await prisma.journalIssue.create({
      data: {
        title,
        issueNumber: number,
        year,
        publishedAt: new Date(publishedAt),
      },
    });

    res.status(201).json({ success: true, data: issue });
  });
}
