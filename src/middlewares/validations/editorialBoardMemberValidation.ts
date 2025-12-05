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
  body("qualifications").optional({ nullable: true }).isString(),
  body("affiliation").optional({ nullable: true }).isString(),
  body("bio").optional({ nullable: true }).isString(),
  body("email").isEmail().withMessage("Valid email is required"),
  body("order").optional({ nullable: true }).isInt({ min: 0 }).withMessage("Order must be a positive integer"),
  body("isActive").optional({ nullable: true }).isBoolean(),
  validate,
];

export const updateEditorialBoardMemberValidation = [
  param("id").isString().withMessage("Editorial board member ID is required"),
  body("fullName").optional({ nullable: true }).isString(),
  body("role").optional({ nullable: true }).isString(),
  body("qualifications").optional({ nullable: true }).isString(),
  body("affiliation").optional({ nullable: true }).isString(),
  body("bio").optional({ nullable: true }).isString(),
  body("email").optional({ nullable: true }).isEmail(),
  body("order").optional({ nullable: true }).isInt({ min: 0 }),
  body("isActive").optional({ nullable: true }).isBoolean(),
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