import { Request, Response } from "express";
import { prisma } from "../config/database";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";

export class AuthorContentController {
  /**
   * Get author content by author ID
   */
  static getAuthorContent = asyncHandler(async (req: Request, res: Response) => {
    const { authorId } = req.params;

    if (!authorId) {
      throw new AppError("Author ID is required", 400);
    }

    const author = await prisma.author.findUnique({
      where: { id: authorId },
      select: {
        id: true,
        fullName: true,
        email: true,
        affiliation: true,
        isCorresponding: true,
        pageContent: true,
        order: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!author) {
      throw new AppError("Author not found", 404);
    }

    res.json({
      success: true,
      data: author,
    });
  });

  /**
   * Update author page content (Admin only)
   */
  static updateAuthorContent = asyncHandler(async (req: Request, res: Response) => {
    const { authorId } = req.params;
    const { pageContent } = req.body;

    if (!authorId) {
      throw new AppError("Author ID is required", 400);
    }

    if (pageContent === undefined || pageContent === null) {
      throw new AppError("Page content is required", 400);
    }

    // Verify author exists
    const author = await prisma.author.findUnique({
      where: { id: authorId },
    });

    if (!author) {
      throw new AppError("Author not found", 404);
    }

    const updated = await prisma.author.update({
      where: { id: authorId },
      data: {
        pageContent: pageContent.trim() || null,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        affiliation: true,
        pageContent: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      message: "Author content updated successfully",
      data: updated,
    });
  });

  /**
   * Get all authors with their content (for admin interface)
   */
  static getAuthorsWithContent = asyncHandler(async (req: Request, res: Response) => {
    const authors = await prisma.author.findMany({
      distinct: ["email"], // Get unique authors by email
      select: {
        id: true,
        fullName: true,
        email: true,
        affiliation: true,
        pageContent: true,
        isCorresponding: true,
        order: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        fullName: "asc",
      },
    });

    res.json({
      success: true,
      data: authors,
    });
  });
}
