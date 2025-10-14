
import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';
import { matchedData } from 'express-validator';

class ContactInfoController {
  createContactInfo = asyncHandler(async (req: Request, res: Response) => {
    const {
      intro,
      editorEmail,
      submissionsEmail,
      email,
      phone,
      mailingAddress,
      officeHours,
      locationDescription,
      social,
    } = matchedData(req);

    // Check if already exists
    const existing = await prisma.contactInfo.findUnique({
      where: { id: 'contact' },
    });

    if (existing) {
      throw new AppError('Contact information already exists', 400);
    }

    const contactInfo = await prisma.contactInfo.create({
      data: {
        id: 'contact',
        intro,
        editorEmail,
        submissionsEmail,
        email,
        phone,
        mailingAddress,
        officeHours,
        locationDescription,
        social,
      },
    });

    res.status(201).json({
      status: 'success',
      data: { contactInfo },
    });
  });

  getContactInfo = asyncHandler(async (req: Request, res: Response) => {
    const contactInfo = await prisma.contactInfo.findUnique({
      where: { id: 'contact' },
    });

    if (!contactInfo) {
      throw new AppError('Contact information not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: {
        contactInfo,
      },
    });
  });

  updateContactInfo = asyncHandler(async (req: Request, res: Response) => {
    const {
      intro,
      editorEmail,
      submissionsEmail,
      email,
      phone,
      mailingAddress,
      officeHours,
      locationDescription,
      social,
    } = matchedData(req);

    const updatedContactInfo = await prisma.contactInfo.update({
      where: { id: 'contact' },
      data: {
        intro,
        editorEmail,
        submissionsEmail,
        email,
        phone,
        mailingAddress,
        officeHours,
        locationDescription,
        social,
      },
    });

    res.status(200).json({
      status: 'success',
      data: {
        contactInfo: updatedContactInfo,
      },
    });
  });
}

export default new ContactInfoController();
