import nodemailer from "nodemailer";
import { logger } from "./logger";

export const generateTwoFactorCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendTwoFactorCode = async (email: string, code: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Two-Factor Authentication Code",
    text: `Your 2FA code is: ${code}. It is valid for 10 minutes.`,
  };
  await transporter.sendMail(mailOptions);
};