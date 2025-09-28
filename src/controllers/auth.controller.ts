
import { Request, Response } from "express";
import { matchedData } from "express-validator";
import { Role } from "@prisma/client";
import { prisma } from "../config/database";
import { logger } from "../utils/logger";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";
import { hashPassword, comparePassword } from "../utils/password";
import { generateToken } from "../utils/token";
import { generateTwoFactorCode, sendTwoFactorCode } from "../utils/twoFactorAuth";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, } = matchedData(req);

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError("User with this email already exists", 409);
  }

  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: Role.READER,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  logger.info(`New user registered: ${user.email}`);
  res.status(201).json({
    success: true,
    message: "User registered successfully",
    user,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = matchedData(req);

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      password: true,
      twoFactorSecret: true,
      twoFactorCodeExpires: true,
    },
  });

  if (!user || !(await comparePassword(password, user.password))) {
    throw new AppError("Invalid credentials", 401);
  }

  if (user.role === "ADMIN") {
    const twoFactorCode = generateTwoFactorCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorSecret: twoFactorCode,
        twoFactorCodeExpires: expiresAt,
      },
    });

    try {
      await sendTwoFactorCode(user.email, twoFactorCode);
    } catch (emailError) {
      logger.error(`Failed to send 2FA email: ${emailError}`);
      throw new AppError("Authentication code could not be sent. Please try again.", 500);
    }

    return res.status(200).json({
      success: true,
      message: "Two-factor authentication code sent to your email",
      requiresTwoFactor: true,
    });
  }

  const token = generateToken({ userId: user.id, role: user.role, name: user.name, email: user.email});

  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    token,
    user: user
  });
});

export const verifyTwoFactorCode = asyncHandler(async (req: Request, res: Response) => {
  const { email, code } = matchedData(req);

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      twoFactorSecret: true,
      twoFactorCodeExpires: true,
    },
  });

  if (!user) {
    throw new AppError("Invalid email or code", 401);
  }

  if (!user.twoFactorSecret || !user.twoFactorCodeExpires) {
    throw new AppError("No active two-factor authentication request", 400);
  }

  const now = new Date();
  const isValid = user.twoFactorSecret === code;
  const isNotExpired = user.twoFactorCodeExpires > now;

  if (!isValid || !isNotExpired) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorSecret: null,
        twoFactorCodeExpires: null,
      },
    });

    if (!isNotExpired) {
      throw new AppError("Two-factor code has expired", 401);
    }
    throw new AppError("Invalid two-factor code", 401);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      twoFactorSecret: null,
      twoFactorCodeExpires: null,
    },
  });

  const token = generateToken({ userId: user.id, role: user.role, name: user.name, email: user.email});

  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new AppError("Not authenticated", 401);
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorSecret: null,
      twoFactorCodeExpires: null,
    },
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully. Token should be cleared client-side.",
  });
});

