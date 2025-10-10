
import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';
import { matchedData } from 'express-validator';
import { sendEmail } from '../utils/email';

class NewsletterSubscriberController {
  subscribe = asyncHandler(async (req: Request, res: Response) => {
    const { email } = matchedData(req);

    const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existingSubscriber) {
      throw new AppError('This email is already subscribed', 400);
    }

    const newsletters = await prisma.newsletter.findMany();

    const subscriber = await prisma.newsletterSubscriber.create({
      data: {
        email,
        receivedNewsletters: {
            connect: newsletters.map(newsletter => ({ id: newsletter.id }))
        }
      },
    });

    // In a real application, sending a lot of emails should be done in a background job.
    if (newsletters.length > 0) {
      await Promise.all(
        newsletters.map(newsletter => sendEmail(email, newsletter.title, newsletter.content))
      );
    }

    res.status(201).json({
      status: 'success',
      data: {
        subscriber,
      },
      message: `Successfully subscribed. You should receive ${newsletters.length} previous newsletters shortly.`
    });
  });

  getAllSubscribers = asyncHandler(async (req: Request, res: Response) => {
    const subscribers = await prisma.newsletterSubscriber.findMany();

    res.status(200).json({
      status: 'success',
      results: subscribers.length,
      data: {
        subscribers,
      },
    });
  });
}

export default new NewsletterSubscriberController();
