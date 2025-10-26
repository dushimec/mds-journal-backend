import { Request, Response } from "express";
import { matchedData } from "express-validator";
import { UserRole as Role } from "@prisma/client";
import { prisma } from "../config/database";
import { logger } from "../utils/logger";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";
import { hashPassword, comparePassword } from "../utils/password";
import { generateToken } from "../utils/token";
import {
  generateTwoFactorCode,
  sendTwoFactorCode,
  sendEmailVerificationCode,
  sendPasswordResetEmail,
} from "../utils/email";
import crypto from "crypto";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { firstName, lastName, email, password } = matchedData(req);

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new AppError("User with this email already exists", 409);

  const hashedPassword = await hashPassword(password);

  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: Role.AUTHOR,
      emailVerificationCode: verificationCode,
      emailVerificationExpires: expiresAt,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      emailVerified: true,
    },
  });

  try {
    await sendEmailVerificationCode(email, verificationCode);
  } catch (err) {
    logger.error(`Failed to send verification email: ${err}`);
  }

  logger.info(`New user registered: ${user.email}`);
  res.status(201).json({
    success: true,
    message: "User registered successfully. Please check your email for verification code.",
    user,
  });
});

export const verifyEmailCode = asyncHandler(async (req: Request, res: Response) => {
  const { email, code } = matchedData(req);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.emailVerificationCode)
    throw new AppError("Invalid email or code", 400);

  if (user.emailVerificationExpires! < new Date())
    throw new AppError("Verification code has expired", 400);

  if (user.emailVerificationCode !== code)
    throw new AppError("Invalid verification code", 400);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerificationCode: null,
      emailVerificationExpires: null,
    },
  });

  res.status(200).json({
    success: true,
    message: "Email verified successfully. You can now log in.",
  });
});

export const resendVerificationCode = asyncHandler(async (req: Request, res: Response) => {
  const { email } = matchedData(req);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError("User not found", 404);

  if (user.emailVerified) {
    throw new AppError("Email is already verified", 400);
  }

  const newCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerificationCode: newCode,
      emailVerificationExpires: expiresAt,
    },
  });

  try {
    await sendEmailVerificationCode(email, newCode);
  } catch (err) {
    logger.error(`Failed to send verification email: ${err}`);
    throw new AppError("Failed to send verification code. Please try again later.", 500);
  }

  res.status(200).json({
    success: true,
    message: "A new verification code has been sent to your email.",
  });
});


export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = matchedData(req);

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      password: true,
      emailVerified: true,
      twoFactorSecret: true,
      twoFactorCodeExpires: true,
    },
  });

  if (!user || !(await comparePassword(password, user.password!)))
    throw new AppError("Invalid credentials", 401);

  if (!user.emailVerified)
    throw new AppError("Please verify your email before logging in.", 403);

  // ADMIN 2FA
  if (user.role === Role.ADMIN) {
    const twoFactorCode = generateTwoFactorCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

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

  const token = generateToken({
    userId: user.id,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  });

  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    token,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
  });
});

export const verifyTwoFactorCode = asyncHandler(async (req: Request, res: Response) => {
  const { email, code } = matchedData(req);

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      twoFactorSecret: true,
      twoFactorCodeExpires: true,
    },
  });

  if (!user) throw new AppError("Invalid email or code", 401);

  if (!user.twoFactorSecret || !user.twoFactorCodeExpires)
    throw new AppError("No active two-factor authentication request", 400);

  const now = new Date();
  const isValid = user.twoFactorSecret === code;
  const isNotExpired = user.twoFactorCodeExpires > now;

  if (!isValid || !isNotExpired) {
    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorSecret: null, twoFactorCodeExpires: null },
    });

    if (!isNotExpired) throw new AppError("Two-factor code has expired", 401);
    throw new AppError("Invalid two-factor code", 401);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorSecret: null, twoFactorCodeExpires: null },
  });

  const token = generateToken({
    userId: user.id,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  });

  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    token,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) throw new AppError("Not authenticated", 401);

  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorSecret: null, twoFactorCodeExpires: null },
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully. Token should be cleared client-side.",
  });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = matchedData(req);

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.user.update({
    where: { email },
    data: { passwordResetToken, passwordResetExpires },
  });

  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(user.email, resetUrl);

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email.",
    });
  } catch (error) {
    logger.error(`Failed to send password reset email: ${error}`);
    await prisma.user.update({
      where: { email },
      data: { passwordResetToken: null, passwordResetExpires: null },
    });
    throw new AppError("Failed to send password reset email. Please try again later.", 500);
  }
});


export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  // 1️⃣ Get token from query (e.g. /api/v1/auth/reset-password?token=abc)
  const token = req.query.token as string;
  const { password } = matchedData(req);

  if (!token) {
    throw new AppError("Reset token is required.", 400);
  }

  // 2️⃣ Hash token to compare with DB
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // 3️⃣ Find matching user
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpires: { gt: new Date() },
    },
  });

  if (!user) {
    throw new AppError("Invalid or expired password reset token.", 400);
  }

  // 4️⃣ Update password
  const hashedPassword = await hashPassword(password);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });

  res.status(200).json({
    success: true,
    message: "Password has been reset successfully.",
  });
});

