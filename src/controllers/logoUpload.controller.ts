import { Request, Response } from "express";
import { prisma } from "../config/database";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";
import cloudinary, { uploadBufferWithRetry } from "../utils/cloudinary";

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
      // If middleware used memoryStorage, prefer buffer upload
      try {
        let result: any = null;
        if (file.buffer) {
          result = await uploadBufferWithRetry(file.buffer, { resource_type: "auto", folder: "logos" }, 3);
        } else if (file.path) {
          result = await cloudinary.uploader.upload(file.path, { resource_type: "auto", folder: "logos" });
        }

        logoUrl = result?.secure_url ?? result?.url ?? file.path ?? file.filename ?? null;
        if (!logoUrl) throw new AppError("Failed to retrieve Cloudinary URL", 500);
      } catch (err: any) {
        console.error("Logo upload error:", err);
        throw new AppError("Failed to retrieve Cloudinary URL", 500);
      }
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

  let logoUrl: string | undefined;
  if (req.file) {
    const file = req.file as any;
    try {
      let result: any = null;
      if (file.buffer) {
        result = await uploadBufferWithRetry(file.buffer, { resource_type: "auto", folder: "logos" }, 3);
      } else if (file.path) {
        result = await cloudinary.uploader.upload(file.path, { resource_type: "auto", folder: "logos" });
      }

      logoUrl = result?.secure_url ?? result?.url ?? file.path ?? file.filename ?? undefined;
      if (!logoUrl) throw new AppError("Failed to retrieve Cloudinary URL", 500);
    } catch (err: any) {
      console.error("Logo upload error:", err);
      throw new AppError("Failed to retrieve Cloudinary URL", 500);
    }
  }

  const updated = await prisma.journalSettings.upsert({
    where: { id: "settings" },
    update: {
      ...(name && { name }),
      ...(publisher && { publisher }),
      ...(issn && { issn }),
      ...(logoUrl && { logoUrl }),
    },
    create: {
      id: "settings",
      name: name || "Default Journal Name",
      publisher: publisher || "Default Publisher",
      issn: issn || "0000-0000",
      ...(logoUrl && { logoUrl }),
    },
  });

  res.json({
    success: true,
    message: "Journal settings saved successfully",
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
