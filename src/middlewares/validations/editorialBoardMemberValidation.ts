import { body, param, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { logger } from "../../utils/logger";

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array({ onlyFirstError: true }).map(err => err.msg);
    logger.warn(`EditorialBoardMember validation failed: ${errorMessages.join(", ")}`);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errorMessages,
    });
  }
  next();
};

export const createEditorialBoardMemberValidation = [
  body("fullName").isString().withMessage("Full name is required"),
  body("qualifications").optional().isString(),
  body("affiliation").optional().isString(),
  body("bio").optional().isString(),
  body("email").isEmail().withMessage("Valid email is required"),
  body("order").optional().isInt({ min: 0 }).withMessage("Order must be a positive integer"),
  body("isActive").optional().isBoolean(),
  // profileImage is handled by multer/cloudinary, not validated here
  validate,
];

export const updateEditorialBoardMemberValidation = [
  param("id").isString().withMessage("Editorial board member ID is required"),
  body("fullName").optional().isString(),
  body("role").optional().isString(),
  body("qualifications").optional().isString(),
  body("affiliation").optional().isString(),
  body("bio").optional().isString(),
  body("email").optional().isEmail(),
  body("order").optional().isInt({ min: 0 }),
  body("isActive").optional().isBoolean(),
  // profileImage is handled by multer/cloudinary, not validated here
  validate,
];

export const deleteEditorialBoardMemberValidation = [
  param("id").isString().withMessage("Editorial board member ID is required"),
  validate,
];

export const getByIdEditorialBoardMemberValidation = [
  param("id").isString().withMessage("Editorial board member ID is required"),
  validate,
];

export { matchedData } from "express-validator";