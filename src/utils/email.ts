import nodemailer from "nodemailer";
import { logger } from "./logger";
import {
  passwordResetEmailTemplate,
  twoFactorEmailTemplate,
  emailVerificationTemplate,
  genericEmailTemplate,
} from "./emailTemplates";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const generateTwoFactorCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send 2FA code email
export const sendTwoFactorCode = async (email: string, code: string) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Two-Factor Authentication Code",
      html: twoFactorEmailTemplate(code),
    });
    logger.info(`2FA code sent to ${email}`);
  } catch (err) {
    logger.error(`Failed to send 2FA email to ${email}`, err);
    throw new Error("Failed to send 2FA code");
  }
};

// Send email verification code
export const sendEmailVerificationCode = async (email: string, code: string) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Email",
      html: emailVerificationTemplate(code),
    });
    logger.info(`Verification code sent to ${email}`);
  } catch (err) {
    logger.error(`Failed to send verification email to ${email}`, err);
    throw new Error("Failed to send verification email");
  }
};

// Send generic email
export const sendEmail = async (to: string, subject: string, content: string) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: genericEmailTemplate(subject, content),
    });
    logger.info(`Email sent to ${to}`);
  } catch (err) {
    logger.error(`Failed to send email to ${to}`, err);
    throw new Error("Failed to send email");
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email: string, resetUrl: string) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: passwordResetEmailTemplate(resetUrl),
    });
    logger.info(`Password reset email sent to ${email}`);
  } catch (err) {
    logger.error(`Failed to send password reset email to ${email}`, err);
    throw new Error("Failed to send password reset email");
  }
};
