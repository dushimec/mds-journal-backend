
import nodemailer from "nodemailer";
import { logger } from "./logger";

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

export const sendTwoFactorCode = async (email: string, code: string) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Two-Factor Authentication Code",
      text: `Your 2FA code is: ${code}. It is valid for 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`2FA code sent to ${email}`);
  } catch (err) {
    logger.error(`Failed to send 2FA email to ${email}`, err);
    throw new Error("Failed to send 2FA code");
  }
};

export const sendEmailVerificationCode = async (email: string, code: string) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Email",
      text: `Your email verification code is: ${code}. It is valid for 1 hour.`,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Verification code sent to ${email}`);
  } catch (err) {
    logger.error(`Failed to send verification email to ${email}`, err);
    throw new Error("Failed to send verification email");
  }
};

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${to}`);
  } catch (err) {
    logger.error(`Failed to send email to ${to}`, err);
    throw new Error("Failed to send email");
  }
};

export const sendPasswordResetEmail = async (email: string, resetUrl: string) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `<p>You requested a password reset. Click the link below to reset your password:</p>
             <a href="${resetUrl}">${resetUrl}</a>
             <p>This link is valid for 10 minutes.</p>`,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Password reset email sent to ${email}`);
  } catch (err) {
    logger.error(`Failed to send password reset email to ${email}`, err);
    throw new Error("Failed to send password reset email");
  }
};
