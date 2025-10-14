
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
    .optional()
    .isString()
    .withMessage("Manuscript title must be a string"),
  body("abstract")
    .optional()
    .isString()
    .withMessage("Abstract must be a string"),
  body("topicId")
    .optional()
    .isString()
    .withMessage("Topic ID must be a string"),
  body("keywords")
    .optional()
    .isString()
    .withMessage("Keywords must be a string"),

  body("authors")
    .optional()
    .isArray()
    .withMessage("Authors must be an array"),
  body("authors.*.fullName")
    .isString()
    .withMessage("Author fullName is required"),
  body("authors.*.email")
    .isEmail()
    .withMessage("Author email must be valid"),
  body("authors.*.affiliation")
    .isString()
    .withMessage("Author affiliation is required"),
  body("authors.*.isCorresponding")
    .optional()
    .isBoolean()
    .withMessage("isCorresponding must be boolean"),
  body("authors.*.order")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Author order must be a positive integer"),

  body("files")
    .optional()
    .isArray()
    .withMessage("Files must be an array"),
  body("files.*.fileName")
    .isString()
    .withMessage("fileName is required"),
  body("files.*.fileUrl")
    .isString()
    .withMessage("fileUrl is required"),
  body("files.*.mimeType")
    .isString()
    .withMessage("mimeType is required"),
  body("files.*.fileSize")
    .isInt({ min: 1 })
    .withMessage("fileSize must be a positive integer"),
  body("files.*.fileType")
    .optional()
    .isIn(Object.values(FileType))
    .withMessage(`fileType must be one of: ${Object.values(FileType).join(", ")}`),

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
    .isString()
    .withMessage("Declaration text is required"),
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
