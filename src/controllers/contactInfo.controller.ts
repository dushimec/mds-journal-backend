
import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';
import { matchedData } from 'express-validator';

class ContactInfoController {
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
    const data = matchedData(req);

    const updatedContactInfo = await prisma.contactInfo.update({
      where: { id: 'contact' },
      data: data,
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
