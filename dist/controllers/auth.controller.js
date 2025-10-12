"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.verifyTwoFactorCode = exports.login = exports.resendVerificationCode = exports.verifyEmailCode = exports.register = void 0;
const express_validator_1 = require("express-validator");
const client_1 = require("@prisma/client");
const database_1 = require("../config/database");
const logger_1 = require("../utils/logger");
const asyncHandler_1 = require("../utils/asyncHandler");
const appError_1 = require("../utils/appError");
const password_1 = require("../utils/password");
const token_1 = require("../utils/token");
const email_1 = require("../utils/email");
exports.register = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { firstName, lastName, email, password } = (0, express_validator_1.matchedData)(req);
    const existingUser = await database_1.prisma.user.findUnique({ where: { email } });
    if (existingUser)
        throw new appError_1.AppError("User with this email already exists", 409);
    const hashedPassword = await (0, password_1.hashPassword)(password);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    const user = await database_1.prisma.user.create({
        data: {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: client_1.UserRole.AUTHOR,
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
        await (0, email_1.sendEmailVerificationCode)(email, verificationCode);
    }
    catch (err) {
        logger_1.logger.error(`Failed to send verification email: ${err}`);
    }
    logger_1.logger.info(`New user registered: ${user.email}`);
    res.status(201).json({
        success: true,
        message: "User registered successfully. Please check your email for verification code.",
        user,
    });
});
exports.verifyEmailCode = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, code } = (0, express_validator_1.matchedData)(req);
    const user = await database_1.prisma.user.findUnique({ where: { email } });
    if (!user || !user.emailVerificationCode)
        throw new appError_1.AppError("Invalid email or code", 400);
    if (user.emailVerificationExpires < new Date())
        throw new appError_1.AppError("Verification code has expired", 400);
    if (user.emailVerificationCode !== code)
        throw new appError_1.AppError("Invalid verification code", 400);
    await database_1.prisma.user.update({
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
exports.resendVerificationCode = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email } = (0, express_validator_1.matchedData)(req);
    const user = await database_1.prisma.user.findUnique({ where: { email } });
    if (!user)
        throw new appError_1.AppError("User not found", 404);
    if (user.emailVerified) {
        throw new appError_1.AppError("Email is already verified", 400);
    }
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await database_1.prisma.user.update({
        where: { id: user.id },
        data: {
            emailVerificationCode: newCode,
            emailVerificationExpires: expiresAt,
        },
    });
    try {
        await (0, email_1.sendEmailVerificationCode)(email, newCode);
    }
    catch (err) {
        logger_1.logger.error(`Failed to send verification email: ${err}`);
        throw new appError_1.AppError("Failed to send verification code. Please try again later.", 500);
    }
    res.status(200).json({
        success: true,
        message: "A new verification code has been sent to your email.",
    });
});
exports.login = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = (0, express_validator_1.matchedData)(req);
    const user = await database_1.prisma.user.findUnique({
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
    if (!user || !(await (0, password_1.comparePassword)(password, user.password)))
        throw new appError_1.AppError("Invalid credentials", 401);
    if (!user.emailVerified)
        throw new appError_1.AppError("Please verify your email before logging in.", 403);
    // ADMIN 2FA
    if (user.role === client_1.UserRole.ADMIN) {
        const twoFactorCode = (0, email_1.generateTwoFactorCode)();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
        await database_1.prisma.user.update({
            where: { id: user.id },
            data: {
                twoFactorSecret: twoFactorCode,
                twoFactorCodeExpires: expiresAt,
            },
        });
        try {
            await (0, email_1.sendTwoFactorCode)(user.email, twoFactorCode);
        }
        catch (emailError) {
            logger_1.logger.error(`Failed to send 2FA email: ${emailError}`);
            throw new appError_1.AppError("Authentication code could not be sent. Please try again.", 500);
        }
        return res.status(200).json({
            success: true,
            message: "Two-factor authentication code sent to your email",
            requiresTwoFactor: true,
        });
    }
    const token = (0, token_1.generateToken)({
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
exports.verifyTwoFactorCode = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, code } = (0, express_validator_1.matchedData)(req);
    const user = await database_1.prisma.user.findUnique({
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
    if (!user)
        throw new appError_1.AppError("Invalid email or code", 401);
    if (!user.twoFactorSecret || !user.twoFactorCodeExpires)
        throw new appError_1.AppError("No active two-factor authentication request", 400);
    const now = new Date();
    const isValid = user.twoFactorSecret === code;
    const isNotExpired = user.twoFactorCodeExpires > now;
    if (!isValid || !isNotExpired) {
        await database_1.prisma.user.update({
            where: { id: user.id },
            data: { twoFactorSecret: null, twoFactorCodeExpires: null },
        });
        if (!isNotExpired)
            throw new appError_1.AppError("Two-factor code has expired", 401);
        throw new appError_1.AppError("Invalid two-factor code", 401);
    }
    await database_1.prisma.user.update({
        where: { id: user.id },
        data: { twoFactorSecret: null, twoFactorCodeExpires: null },
    });
    const token = (0, token_1.generateToken)({
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
exports.logout = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId)
        throw new appError_1.AppError("Not authenticated", 401);
    await database_1.prisma.user.update({
        where: { id: userId },
        data: { twoFactorSecret: null, twoFactorCodeExpires: null },
    });
    res.status(200).json({
        success: true,
        message: "Logged out successfully. Token should be cleared client-side.",
    });
});
//# sourceMappingURL=auth.controller.js.map