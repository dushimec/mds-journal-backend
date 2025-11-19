import { Request, Response } from "express";
import { prisma } from "../config/database";
export const globalSearch = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    const query = String(q || "").trim();

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // ----- USER SEARCH -----
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
    });

    // ----- SUBMISSIONS -----
    const submissions = await prisma.submission.findMany({
      where: {
        OR: [
          { manuscriptTitle: { contains: query, mode: "insensitive" } },
          { abstract: { contains: query, mode: "insensitive" } },
          { keywords: { contains: query, mode: "insensitive" } },
        ],
      },
    });

    // ----- AUTHORS -----
    const authors = await prisma.author.findMany({
      where: {
        OR: [
          { fullName: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
    });

    // ----- ANNOUNCEMENTS -----
    const announcements = await prisma.announcement.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
    });

    // ----- TOPICS -----
    const topics = await prisma.topic.findMany({
      where: {
        name: { contains: query, mode: "insensitive" },
      },
    });

    // ----- FAQ -----
    const faqs = await prisma.fAQ.findMany({
      where: {
        OR: [
          { question: { contains: query, mode: "insensitive" } },
          { answer: { contains: query, mode: "insensitive" } },
        ],
      },
    });

    // ----- CONTACT MESSAGES -----
    const messages = await prisma.contactMessage.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
          { subject: { contains: query, mode: "insensitive" } },
          { message: { contains: query, mode: "insensitive" } },
        ],
      },
    });

    return res.json({
      success: true,
      results: {
        users,
        submissions,
        authors,
        announcements,
        topics,
        faqs,
        messages,
      },
    });

  } catch (error) {
    console.error("Global search error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
