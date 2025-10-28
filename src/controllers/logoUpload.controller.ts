import { Request, Response } from "express";
import { prisma } from "../config/database";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";

export class LogoController {
  static getSettings = asyncHandler(async (_req: Request, res: Response) => {
    const settings = await prisma.journalSettings.findUnique({
      where: { id: "settings" },
    });

    if (!settings) throw new AppError("Journal settings not found", 404);

    res.json({
      success: true,
      data: settings,
    });
  });

  static createSettings = asyncHandler(async (req: Request, res: Response) => {
    const { name, publisher, issn } = req.body;
    if (!name) throw new AppError("Journal name is required", 400);

    const existing = await prisma.journalSettings.findUnique({
      where: { id: "settings" },
    });

    if (existing) throw new AppError("Settings already exist. Use PUT to update instead.", 400);

    let logoUrl: string | null = null;
    if (req.file) {
      const file = req.file as any;
      logoUrl = file.path || file.filename;
      if (!logoUrl) throw new AppError("Failed to retrieve Cloudinary URL", 500);
    }

    const newSettings = await prisma.journalSettings.create({
      data: {
        id: "settings",
        name,
        publisher: publisher || "Default Publisher",
        issn: issn || null,
        logoUrl,
      },
    });

    res.status(201).json({
      success: true,
      message: "Journal settings created successfully",
      data: newSettings,
    });
  });

  static updateSettings = asyncHandler(async (req: Request, res: Response) => {
    const { name, publisher, issn } = req.body;

    const settings = await prisma.journalSettings.findUnique({
      where: { id: "settings" },
    });

    if (!settings) throw new AppError("Settings not found. Use POST to create first.", 404);

    let logoUrl: string | undefined;
    if (req.file) {
      const file = req.file as any;
      logoUrl = file.path || file.filename;
      if (!logoUrl) throw new AppError("Failed to retrieve Cloudinary URL", 500);
    }

    const updated = await prisma.journalSettings.update({
      where: { id: "settings" },
      data: {
        name: name || settings.name,
        publisher: publisher || settings.publisher,
        issn: issn || settings.issn,
        ...(logoUrl && { logoUrl }),
      },
    });

    res.json({
      success: true,
      message: "Journal settings updated successfully",
      data: updated,
    });
  });

  static deleteLogo = asyncHandler(async (_req: Request, res: Response) => {
    const settings = await prisma.journalSettings.findUnique({
      where: { id: "settings" },
    });

    if (!settings) throw new AppError("Settings not found", 404);
    if (!settings.logoUrl) throw new AppError("No logo to delete", 400);

    await prisma.journalSettings.update({
      where: { id: "settings" },
      data: { logoUrl: null },
    });

    res.json({
      success: true,
      message: "Logo removed successfully",
    });
  });
}
