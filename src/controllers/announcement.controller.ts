import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';
import { matchedData } from 'express-validator';

class AnnouncementController {
  // Create a new announcement
  createAnnouncement = asyncHandler(async (req: Request, res: Response) => {
    const data = matchedData(req);

    const announcement = await prisma.announcement.create({
      data: {
        title: data.title,
        description: data.description,
        date: data.date, // optionally pass a date, else use default
      },
    });

    res.status(201).json({
      status: 'success',
      data: {
        announcement,
      },
    });
  });

  // Get all announcements
  getAllAnnouncements = asyncHandler(async (req: Request, res: Response) => {
    const announcements = await prisma.announcement.findMany({
      orderBy: { date: 'desc' }, // latest first
    });

    res.status(200).json({
      status: 'success',
      results: announcements.length,
      data: {
        announcements,
      },
    });
  });

  // Get a single announcement by ID
  getAnnouncementById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const announcement = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      throw new AppError('No announcement found with that ID', 404);
    }

    res.status(200).json({
      status: 'success',
      data: { announcement },
    });
  });

  // Update an announcement
  updateAnnouncement = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = matchedData(req); // expects title, description, date

    const updated = await prisma.announcement.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
      },
    });

    res.status(200).json({
      status: 'success',
      data: { announcement: updated },
    });
  });

  // Delete an announcement
  deleteAnnouncement = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    await prisma.announcement.delete({
      where: { id },
    });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
}

export default new AnnouncementController();
