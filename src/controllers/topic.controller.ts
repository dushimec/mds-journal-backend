import { Request, Response } from "express";
import { matchedData } from "express-validator";
import { prisma } from "../config/database";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";
import { UserRole } from "@prisma/client";

export class TopicController {
  static create = asyncHandler(async (req: Request, res: Response) => {
    if (
      req.user?.role !== UserRole.ADMIN &&
      req.user?.role !== UserRole.EDITOR
    ) {
      throw new AppError("Only ADMIN or EDITOR can create topics", 403);
    }

    const { name } = matchedData(req);
    if (!name) throw new AppError("Name is required", 400);

    const topic = await prisma.topic.create({
      data: { name },
    });

    res.status(201).json({ success: true, data: topic });
  });

  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const topics = await prisma.topic.findMany({
      orderBy: { name: "asc" },
    });
    res.json({ success: true, data: topics });
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const topic = await prisma.topic.findUnique({ where: { id: String(id) } });
    if (!topic) throw new AppError("Topic not found", 404);
    res.json({ success: true, data: topic });
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name } = matchedData(req);

    const topic = await prisma.topic.findUnique({ where: { id: String(id) } });
    if (!topic) throw new AppError("Topic not found", 404);

    if (
      req.user?.role !== UserRole.ADMIN &&
      req.user?.role !== UserRole.EDITOR
    ) {
      throw new AppError("Only ADMIN or EDITOR can update topics", 403);
    }

    const updated = await prisma.topic.update({
      where: { id: String(id) },
      data: { name },
    });

    res.json({ success: true, data: updated });
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const topic = await prisma.topic.findUnique({ where: { id: String(id) } });
    if (!topic) throw new AppError("Topic not found", 404);

    if (
      req.user?.role !== UserRole.ADMIN &&
      req.user?.role !== UserRole.EDITOR
    ) {
      throw new AppError("Only ADMIN or EDITOR can delete topics", 403);
    }

    await prisma.topic.delete({ where: { id: String(id) } });
    res.json({ success: true, message: "Topic deleted" });
  });
}