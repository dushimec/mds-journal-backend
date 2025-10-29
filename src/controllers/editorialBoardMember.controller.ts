import { Request, Response } from "express";
import { matchedData } from "express-validator";
import { prisma } from "../config/database";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";
import { UserRole } from "@prisma/client";

export class EditorialBoardMemberController {
  static create = asyncHandler(async (req: Request, res: Response) => {
    const {
      fullName,
      qualifications,
      affiliation,
      bio,
      email,
      order,
      isActive,
    } = req.body;

    const profileImage = (req.file as any)?.path; // ✅ Cloudinary URL

    const member = await prisma.editorialBoardMember.create({
      data: {
        fullName,
        qualifications,
        affiliation,
        bio,
        email,
        order: parseInt(order, 10) || 0,
        isActive: isActive === "true",
        profileImage,
        role: UserRole.EDITOR,
      },
    });

    res.status(201).json({ success: true, data: member });
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = matchedData(req);

    const member = await prisma.editorialBoardMember.findUnique({
      where: { id: String(id) },
    });
    if (!member) throw new AppError("Editorial board member not found", 404);

    if (req.file) data.profileImage = (req.file as any).path;

    const updated = await prisma.editorialBoardMember.update({
      where: { id: String(id) },
      data,
    });

    res.json({ success: true, data: updated });
  });

  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const members = await prisma.editorialBoardMember.findMany({
      orderBy: { order: "asc" },
    });
    res.json({ success: true, data: members });
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const member = await prisma.editorialBoardMember.findUnique({
      where: { id: String(id) },
    });
    if (!member) throw new AppError("Editorial board member not found", 404);
    res.json({ success: true, data: member });
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const member = await prisma.editorialBoardMember.findUnique({
      where: { id: String(id) },
    });
    if (!member) throw new AppError("Editorial board member not found", 404);

    await prisma.editorialBoardMember.delete({ where: { id: String(id) } });
    res.json({ success: true, message: "Editorial board member deleted" });
  });

  static approve = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const member = await prisma.editorialBoardMember.findUnique({
      where: { id: String(id) },
    });
    if (!member) throw new AppError("Editorial board member not found", 404);
    if (member.isApproved)
      throw new AppError("Member is already approved", 400);

    const updatedMember = await prisma.editorialBoardMember.update({
      where: { id: String(id) },
      data: { isApproved: true },
    });

    res.json({
      success: true,
      message: "Member approved successfully",
      data: updatedMember,
    });
  });
}
