
import { body, validationResult, matchedData,param, query } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { logger } from "../../utils/logger";

import { FileType, DeclarationType, SubmissionStatus } from "@prisma/client";

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array({ onlyFirstError: true }).map(err => err.msg);
    logger.warn(`Submission validation failed: ${errorMessages.join(", ")}`);

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errorMessages,
    });
  }
  next();
};

export const createSubmissionValidation = [
  body("manuscriptTitle")
    .notEmpty()
    .withMessage("Manuscript title is required")
    .isString()
    .withMessage("Manuscript title must be a string"),
  body("abstract")
    .notEmpty()
    .withMessage("Abstract is required")
    .isString()
    .withMessage("Abstract must be a string"),
  body("topic")
    .notEmpty()
    .withMessage("Topic is required")
    .isString()
    .withMessage("Topic must be a string"),
  body("keywords")
    .notEmpty()
    .withMessage("Keywords are required")
    .isString()
    .withMessage("Keywords must be a string"),

  body("authors")
    .notEmpty()
    .withMessage("Authors are required")
    .isArray()
    .withMessage("Authors must be an array"),
  body("authors.*.fullName")
    .notEmpty()
    .withMessage("Author fullName is required")
    .isString()
    .withMessage("Author fullName must be a string"),
  body("authors.*.email")
    .notEmpty()
    .withMessage("Author email is required")
    .isEmail()
    .withMessage("Author email must be valid"),
  body("authors.*.affiliation")
    .optional()
    .isString()
    .withMessage("Author affiliation must be a string"),
  body("authors.*.isCorresponding")
    .optional()
    .isBoolean()
    .withMessage("isCorresponding must be boolean"),
  body("authors.*.order")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Author order must be a positive integer"),

  body("declarations")
    .optional()
    .isArray()
    .withMessage("Declarations must be an array"),
  body("declarations.*.type")
    .optional()
    .isIn(Object.values(DeclarationType))
    .withMessage(
      `Declaration type must be one of: ${Object.values(DeclarationType).join(", ")}`
    ),
  body("declarations.*.isChecked")
    .optional()
    .isBoolean()
    .withMessage("isChecked must be boolean"),
  body("declarations.*.text")
    .optional()
    .isString()
    .withMessage("Declaration text must be a string"),
];

export const updateSubmissionValidation = [
  param("id").isString().withMessage("Submission ID is required"),
  body("manuscriptTitle").optional().isString(),
  body("abstract").optional().isString(),
  body("topicId").optional().isString(),
  body("keywords").optional().isString(),
  body("status")
    .optional()
    .isIn(Object.values(SubmissionStatus))
    .withMessage(`Status must be one of: ${Object.values(SubmissionStatus).join(", ")}`),
];

export const deleteSubmissionValidation = [
  param("id").isString().withMessage("Submission ID is required"),
];

export const getByIdSubmissionValidation = [
  param("id").isString().withMessage("Submission ID is required"),
];

export const getAllSubmissionsValidation = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
];

export {matchedData}
