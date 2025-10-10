
import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';
import { matchedData } from 'express-validator';

class FaqController {
  createFaq = asyncHandler(async (req: Request, res: Response) => {
    const data = matchedData(req);
    const faq = await prisma.fAQ.create({
      data: {
        question: data.question,
        answer: data.answer,
        order: data.order,
      },
    });
    res.status(201).json({
      status: 'success',
      data: {
        faq,
      },
    });
  });

  getAllFaqs = asyncHandler(async (req: Request, res: Response) => {
    const faqs = await prisma.fAQ.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    res.status(200).json({
      status: 'success',
      results: faqs.length,
      data: {
        faqs,
      },
    });
  });

  getFaqById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const faq = await prisma.fAQ.findUnique({
      where: { id },
    });

    if (!faq) {
      throw new AppError('No FAQ found with that ID', 404);
    }

    res.status(200).json({
      status: 'success',
      data: {
        faq,
      },
    });
  });

  updateFaq = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = matchedData(req);

    const faq = await prisma.fAQ.update({
      where: { id },
      data: data,
    });

    res.status(200).json({
      status: 'success',
      data: {
        faq,
      },
    });
  });

  deleteFaq = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await prisma.fAQ.delete({
      where: { id },
    });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
}

export default new FaqController();
