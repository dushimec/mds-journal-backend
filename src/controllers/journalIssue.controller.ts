
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import {prisma} from '../config/database';
import { AppError } from '../utils/appError';

export const createJournalIssue = asyncHandler(async (req: Request, res: Response) => {
  const journalIssue = await prisma.journalIssue.create({ data: req.body });
  res.status(201).json({ success: true, data: journalIssue });
});

export const getJournalIssues = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const [journalIssues, total] = await Promise.all([
    prisma.journalIssue.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.journalIssue.count(),
  ]);

  res.status(200).json({
    success: true,
    data: journalIssues,
    pagination: {
      total,
      page,
      limit,
    },
  });
});

export const getJournalIssue = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const journalIssue = await prisma.journalIssue.findUnique({
    where: { id },
    include: { submissions: true },
  });
  if (!journalIssue) {
    throw new AppError('Journal issue not found', 404);
  }
  res.status(200).json({ success: true, data: journalIssue });
});

export const updateJournalIssue = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const journalIssue = await prisma.journalIssue.update({
    where: { id },
    data: req.body,
  });
  res.status(200).json({ success: true, data: journalIssue });
});

export const deleteJournalIssue = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.journalIssue.delete({ where: { id } });
  res.status(204).json({ success: true, data: null });
});

export const getJournalIssueStats = asyncHandler(async (req: Request, res: Response) => {
    const totalIssues = await prisma.journalIssue.count();
    const totalArticles = await prisma.submission.count({
        where: {
            status: 'PUBLISHED'
        }
    });

    res.status(200).json({
        success: true,
        data: {
            totalIssues,
            totalArticles,
        },
    });
});
