import { Request, Response } from "express";
import { prisma } from "../config/database";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";
import { UserRole } from "@prisma/client";

export class AuthorController {
  // Get all unique authors
  static getAll = asyncHandler(async (req: Request, res: Response) => {
    // Check authorization
    if (req.user?.role !== UserRole.ADMIN && req.user?.role !== UserRole.EDITOR) {
      throw new AppError("Only admins and editors can view authors", 403);
    }

    const authors = await prisma.author.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        affiliation: true,
        isCorresponding: true,
        order: true,
        createdAt: true,
        updatedAt: true,
        submission: {
          select: {
            id: true,
            manuscriptTitle: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: authors,
      meta: { total: authors.length },
    });
  });

  // Get author by ID
  static getById = asyncHandler(async (req: Request, res: Response) => {
    if (req.user?.role !== UserRole.ADMIN && req.user?.role !== UserRole.EDITOR) {
      throw new AppError("Only admins and editors can view authors", 403);
    }

    const { id } = req.params;
    const author = await prisma.author.findUnique({
      where: { id },
      include: {
        submission: {
          select: {
            id: true,
            manuscriptTitle: true,
            status: true,
          },
        },
      },
    });

    if (!author) throw new AppError("Author not found", 404);

    res.json({ success: true, data: author });
  });

  // Update author
  static update = asyncHandler(async (req: Request, res: Response) => {
    if (req.user?.role !== UserRole.ADMIN && req.user?.role !== UserRole.EDITOR) {
      throw new AppError("Only admins and editors can update authors", 403);
    }

    const { id } = req.params;
    const { fullName, email, affiliation, isCorresponding } = req.body;

    // Validate required fields
    if (fullName && !fullName.trim()) {
      throw new AppError("Full name cannot be empty", 400);
    }
    if (email && !email.trim()) {
      throw new AppError("Email cannot be empty", 400);
    }

    const author = await prisma.author.findUnique({ where: { id } });
    if (!author) throw new AppError("Author not found", 404);

    const updated = await prisma.author.update({
      where: { id },
      data: {
        ...(fullName && { fullName }),
        ...(email && { email }),
        ...(affiliation !== undefined && { affiliation }),
        ...(isCorresponding !== undefined && { isCorresponding }),
      },
    });

    res.json({
      success: true,
      message: "Author updated successfully",
      data: updated,
    });
  });

  // Delete author
  static delete = asyncHandler(async (req: Request, res: Response) => {
    if (req.user?.role !== UserRole.ADMIN) {
      throw new AppError("Only admins can delete authors", 403);
    }

    const { id } = req.params;

    const author = await prisma.author.findUnique({ where: { id } });
    if (!author) throw new AppError("Author not found", 404);

    await prisma.author.delete({ where: { id } });

    res.json({
      success: true,
      message: "Author deleted successfully",
    });
  });

  // Get authors by submission
  static getBySubmission = asyncHandler(
    async (req: Request, res: Response) => {
      const { submissionId } = req.params;

      const authors = await prisma.author.findMany({
        where: { submissionId },
        orderBy: { order: "asc" },
      });

      res.json({
        success: true,
        data: authors,
      });
    }
  );

  // Get unique author emails (for deduplication)
  static getUniqueEmails = asyncHandler(async (req: Request, res: Response) => {
    if (req.user?.role !== UserRole.ADMIN && req.user?.role !== UserRole.EDITOR) {
      throw new AppError("Only admins and editors can access this", 403);
    }

    const emails = await prisma.author.findMany({
      select: {
        email: true,
        fullName: true,
      },
      distinct: ["email"],
    });

    res.json({
      success: true,
      data: emails,
    });
  });
}
