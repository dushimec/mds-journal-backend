
import { Request, Response } from "express";
import { prisma } from "../config/database";
import { asyncHandler } from "../utils/asyncHandler";
import { matchedData } from 'express-validator';
import { AuthorGuidelineType } from '@prisma/client';
import { AppError } from "../utils/appError";

export const createAuthorGuideline = asyncHandler(async (req: Request, res: Response) => {
  const { type, content, order } = matchedData(req);

  const existingGuideline = await prisma.authorGuideline.findFirst({
    where: { OR: [{ type }, { order }] },
  });

  if (existingGuideline) {
    throw new AppError('Guideline with this type or order already exists', 409);
  }

  const guideline = await prisma.authorGuideline.create({
    data: {
      type,
      content,
      order,
    },
  });

  res.status(201).json({
    success: true,
    data: guideline,
  });
});

export const getAuthorGuidelines = asyncHandler(async (req: Request, res: Response) => {
  const guidelines = await prisma.authorGuideline.findMany({
    orderBy: {
      order: 'asc'
    }
  });
  res.status(200).json({
    success: true,
    data: guidelines,
  });
});

export const getAuthorGuidelineByType = asyncHandler(async (req: Request, res: Response) => {
  const { type } = matchedData(req) as { type: AuthorGuidelineType };
  const guideline = await prisma.authorGuideline.findFirst({
    where: {
      type: type,
    },
  });

  if (!guideline) {
    return res.status(404).json({ success: false, message: 'Guideline not found' });
  }

  res.status(200).json({
    success: true,
    data: guideline,
  });
});

export const updateAuthorGuideline = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = matchedData(req);

  const guideline = await prisma.authorGuideline.update({
    where: { id },
    data,
  });

  res.status(200).json({
    success: true,
    data: guideline,
  });
});

export const deleteAuthorGuideline = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.authorGuideline.delete({
    where: { id },
  });

  res.status(204).send();
});

export const getAuthorGuidelineStats = asyncHandler(async (req: Request, res: Response) => {
  const guidelineCount = await prisma.authorGuideline.count();

  res.status(200).json({
    success: true,
    data: {
      totalGuidelines: guidelineCount,
    },
  });
});
