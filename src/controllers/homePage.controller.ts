import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { prisma } from "../config/database";
import { SubmissionStatus } from "@prisma/client";

export class HomePageController {
  static getHomePageData = asyncHandler(async (req: Request, res: Response) => {
    const recentSubmissions = await prisma.submission.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        topic: true,
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });
    
    const publishedSubmissions = await prisma.submission.findMany({
        where: { status: SubmissionStatus.PUBLISHED },
        orderBy: { updatedAt: "desc" },
        include: {
            topic: true,
            user: { select: { firstName: true, lastName: true, email: true } },
        }
    });

    const totalSubmissions = await prisma.submission.count();
    const submissionsByStatus = await prisma.submission.groupBy({
      by: ["status"],
      _count: true,
    });
    const submissionStats = {
      total: totalSubmissions,
      byStatus: submissionsByStatus.map(({ status, _count }) => ({
        status,
        count: _count,
      })),
    };

    res.json({
      success: true,
      data: {
        recentSubmissions,
        publishedSubmissions,
        submissionStats,
      },
    });
  });
}