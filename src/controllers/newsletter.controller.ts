
import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';
import { matchedData } from 'express-validator';
import { sendEmail } from '../utils/email';

class NewsletterController {
  sendNewsletter = asyncHandler(async (req: Request, res: Response) => {
    const { title, content } = matchedData(req);

    const subscribers = await prisma.newsletterSubscriber.findMany({
      select: {
        id: true,
        email: true,
      },
    });

    if (subscribers.length === 0) {
      throw new AppError('There are no subscribers to send a newsletter to.', 404);
    }

    const newNewsletter = await prisma.newsletter.create({
      data: {
        title,
        content,
        recipients: {
          connect: subscribers.map(subscriber => ({ id: subscriber.id }))
        }
      },
    });

    const subscriberEmails = subscribers.map((subscriber) => subscriber.email);

    // In a real application, you might want to send these emails in a background job
    await Promise.all(
      subscriberEmails.map((email) => sendEmail(email, title, content))
    );

    res.status(200).json({
      status: 'success',
      message: `Newsletter sent to ${subscriberEmails.length} subscribers.`,
      data: newNewsletter,
    });
  });

  getNewsletters = asyncHandler(async (req: Request, res: Response) => {
    const newsletters = await prisma.newsletter.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!newsletters) {
      throw new AppError('No newsletters found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: newsletters,
    });
  });

  getNewsletterById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = matchedData(req);
    const newsletter = await prisma.newsletter.findUnique({
      where: { id },
    });

    if (!newsletter) {
      throw new AppError(`Newsletter with ID ${id} not found`, 404);
    }

    res.status(200).json({
      status: 'success',
      data: newsletter,
    });
  });
}

export default new NewsletterController();
