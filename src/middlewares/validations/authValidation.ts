import { body, validationResult, matchedData } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { logger } from "../../utils/logger";

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array({ onlyFirstError: true }).map(err => err.msg);
    logger.warn(`Validation failed: ${errorMessages.join(", ")}`);

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errorMessages,
    });
  }
  next();
};

export const registerValidation = [
  body("firstName")
    .trim()
    .notEmpty().withMessage("firstName is required")
    .isLength({ min: 2, max: 100 }).withMessage("firstName must be between 2 and 100 characters"),
  
  body("lastName")
    .trim()
    .notEmpty().withMessage("lastName is required")
    .isLength({ min: 2, max: 100 }).withMessage("lastName must be between 2 and 100 characters"),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email")
    .normalizeEmail(), 

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),

  body("UserRole")
    .optional()
    .isIn(["AUTHOR", "EDITOR", "REVIEWER", "ADMIN", "READER"])
    .withMessage("Role must be one of: AUTHOR, EDITOR, REVIEWER, ADMIN, READER"),
];

export const loginValidation = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required"),
];

export const verify2FAValidation = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("code")
    .trim()
    .notEmpty().withMessage("2FA code is required")
    .isLength({ min: 6, max: 6 }).withMessage("2FA code must be exactly 6 digits")
    .matches(/^\d+$/).withMessage("2FA code must contain only digits"),
];

export const verifyEmailValidation = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("code")
    .trim()
    .notEmpty().withMessage("Verification code is required")
    .isLength({ min: 6, max: 6 }).withMessage("Verification code must be exactly 6 digits")
    .matches(/^\d+$/).withMessage("Verification code must contain only digits"),
];

export const ResendCodeValidation = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email")
    .normalizeEmail()
];

export { matchedData };
