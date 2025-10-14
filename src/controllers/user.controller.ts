import { Request, Response } from "express";
import { prisma } from "../config/database";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      emailVerified: true,
    },
  });
  res.status(200).json({
    success: true,
    message: "Users retrieved successfully",
    data: users,
  });
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      emailVerified: true,
      affiliation: true,
      bio: true,
      profileImage: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "User retrieved successfully",
    data: user,
  });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { firstName, lastName, affiliation, bio } = req.body;

  const user = await prisma.user.update({
    where: { id },
    data: {
      firstName,
      lastName,
      affiliation,
      bio,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      emailVerified: true,
      affiliation: true,
      bio: true,
    },
  });

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: user,
  });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.user.delete({ where: { id } });
  res.status(200).json({ 
    success: true,
    message: "User deleted successfully" 
  });
});

export const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new AppError("Not authenticated", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      emailVerified: true,
      affiliation: true,
      bio: true,
      profileImage: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "User profile retrieved successfully",
    data: user,
  });
});

export const getUserStats = asyncHandler(async (req: Request, res: Response) => {
  const users = await prisma.user.count();
  const submissions = await prisma.submission.count();
  const topics = await prisma.topic.count();

  res.status(200).json({
    success: true,
    message: "User stats retrieved successfully",
    data: {
      users,
      submissions,
      topics,
    },
  });
});
