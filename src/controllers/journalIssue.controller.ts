
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import {prisma} from '../config/database';
import { AppError } from '../utils/appError';

export const createJournalIssue = asyncHandler(async (req: Request, res: Response) => {
  const { volume, issue, year } = req.body;

  // Validate required fields
  if (!volume || !issue || !year) {
    throw new AppError('Volume, issue, and year are required', 400);
  }

  // Validate that fields are numbers
  if (typeof volume !== 'number' || typeof issue !== 'number' || typeof year !== 'number') {
    throw new AppError('Volume, issue, and year must be numbers', 400);
  }

  const journalIssue = await prisma.journalIssue.create({
    data: { volume, issue, year }
  });
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
  const { volume, issue, year } = req.body;

  // Get the current journal issue to verify it exists
  const currentIssue = await prisma.journalIssue.findUnique({
    where: { id },
  });

  if (!currentIssue) {
    throw new AppError('Journal issue not found', 404);
  }

  // Validate that provided fields are numbers (allow partial updates)
  const updateData: any = {};
  if (volume !== undefined) {
    if (typeof volume !== 'number') {
      throw new AppError('Volume must be a number', 400);
    }
    updateData.volume = volume;
  }
  if (issue !== undefined) {
    if (typeof issue !== 'number') {
      throw new AppError('Issue must be a number', 400);
    }
    updateData.issue = issue;
  }
  if (year !== undefined) {
    if (typeof year !== 'number') {
      throw new AppError('Year must be a number', 400);
    }
    updateData.year = year;
  }

  if (Object.keys(updateData).length === 0) {
    throw new AppError('At least one valid field (volume, issue, or year) is required', 400);
  }

  const journalIssue = await prisma.journalIssue.update({
    where: { id },
    data: updateData,
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
