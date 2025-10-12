"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = exports.sendEmailVerificationCode = exports.sendTwoFactorCode = exports.generateTwoFactorCode = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = require("./logger");
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
const generateTwoFactorCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
exports.generateTwoFactorCode = generateTwoFactorCode;
const sendTwoFactorCode = async (email, code) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your Two-Factor Authentication Code",
            text: `Your 2FA code is: ${code}. It is valid for 10 minutes.`,
        };
        await transporter.sendMail(mailOptions);
        logger_1.logger.info(`2FA code sent to ${email}`);
    }
    catch (err) {
        logger_1.logger.error(`Failed to send 2FA email to ${email}`, err);
        throw new Error("Failed to send 2FA code");
    }
};
exports.sendTwoFactorCode = sendTwoFactorCode;
const sendEmailVerificationCode = async (email, code) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Verify Your Email",
            text: `Your email verification code is: ${code}. It is valid for 1 hour.`,
        };
        await transporter.sendMail(mailOptions);
        logger_1.logger.info(`Verification code sent to ${email}`);
    }
    catch (err) {
        logger_1.logger.error(`Failed to send verification email to ${email}`, err);
        throw new Error("Failed to send verification email");
    }
};
exports.sendEmailVerificationCode = sendEmailVerificationCode;
const sendEmail = async (to, subject, html) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            html,
        };
        await transporter.sendMail(mailOptions);
        logger_1.logger.info(`Email sent to ${to}`);
    }
    catch (err) {
        logger_1.logger.error(`Failed to send email to ${to}`, err);
        throw new Error("Failed to send email");
    }
};
exports.sendEmail = sendEmail;
//# sourceMappingURL=email.js.map