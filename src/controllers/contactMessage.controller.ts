
import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';
import { matchedData } from 'express-validator';

class ContactMessageController {
  createContactMessage = asyncHandler(async (req: Request, res: Response) => {
    const data = matchedData(req);

    const contactMessage = await prisma.contactMessage.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        institution: data.institution,
        inquiryType: data.inquiryType,
        subject: data.subject,
        message: data.message,
      },
    });

    res.status(201).json({
      status: 'success',
      data: {
        contactMessage,
      },
    });
  });

  getAllContactMessages = asyncHandler(async (req: Request, res: Response) => {
    const contactMessages = await prisma.contactMessage.findMany();

    res.status(200).json({
      status: 'success',
      results: contactMessages.length,
      data: {
        contactMessages,
      },
    });
  });

  getContactMessageById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const contactMessage = await prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!contactMessage) {
      throw new AppError('No contact message found with that ID', 404);
    }

    res.status(200).json({
      status: 'success',
      data: {
        contactMessage,
      },
    });
  });

  updateContactMessage = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { isRead } = req.body;

    const contactMessage = await prisma.contactMessage.update({
      where: { id },
      data: {
        isRead,
      },
    });

    res.status(200).json({
      status: 'success',
      data: {
        contactMessage,
      },
    });
  });

  deleteContactMessage = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await prisma.contactMessage.delete({
      where: { id },
    });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
}

export default new ContactMessageController();
