// src/validators/submissionValidator.ts
import { body, validationResult, matchedData } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { logger } from "../../utils/logger";
import { SubmissionStatus, FileType, DeclarationType } from "@prisma/client";

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

const authorValidator = body("authors.*")
  .isObject().withMessage("Each author must be an object")
  .bail()
  .custom((author) => {
    if (!author.fullName || typeof author.fullName !== "string" || author.fullName.trim().length < 2) {
      throw new Error("Author fullName is required and must be at least 2 characters");
    }
    if (!author.email || !/^\S+@\S+\.\S+$/.test(author.email)) {
      throw new Error("Author email is required and must be valid");
    }
    if (!author.affiliation || typeof author.affiliation !== "string" || author.affiliation.trim().length < 2) {
      throw new Error("Author affiliation is required and must be at least 2 characters");
    }
    if (author.isCorresponding !== undefined && typeof author.isCorresponding !== "boolean") {
      throw new Error("Author isCorresponding must be a boolean");
    }
    if (author.order !== undefined && (!Number.isInteger(author.order) || author.order < 0)) {
      throw new Error("Author order must be a non-negative integer");
    }
    return true;
  });

const fileValidator = body("files.*")
  .isObject().withMessage("Each file must be an object")
  .bail()
  .custom((file) => {
    if (!file.fileName || typeof file.fileName !== "string" || file.fileName.trim().length < 1) {
      throw new Error("File fileName is required");
    }
    if (!file.fileUrl || typeof file.fileUrl !== "string" || !file.fileUrl.startsWith("http")) {
      throw new Error("File fileUrl is required and must be a valid URL");
    }
    if (!file.mimeType || typeof file.mimeType !== "string") {
      throw new Error("File mimeType is required");
    }
    if (!file.fileSize || !Number.isInteger(file.fileSize) || file.fileSize <= 0) {
      throw new Error("File fileSize must be a positive integer");
    }
    if (file.fileType && !Object.values(FileType).includes(file.fileType)) {
      throw new Error(`File fileType must be one of: ${Object.values(FileType).join(", ")}`);
    }
    return true;
  });

const declarationValidator = body("declarations.*")
  .isObject().withMessage("Each declaration must be an object")
  .bail()
  .custom((declaration) => {
    if (declaration.type && !Object.values(DeclarationType).includes(declaration.type)) {
      throw new Error(`Declaration type must be one of: ${Object.values(DeclarationType).join(", ")}`);
    }
    if (typeof declaration.isChecked !== "boolean") {
      throw new Error("Declaration isChecked must be a boolean");
    }
    if (!declaration.text || typeof declaration.text !== "string" || declaration.text.trim().length < 5) {
      throw new Error("Declaration text is required and must be at least 5 characters");
    }
    return true;
  });

export const createSubmissionValidation = [
  body("manuscriptTitle")
    .optional({ nullable: true })
    .isString().withMessage("manuscriptTitle must be a string")
    .trim()
    .isLength({ min: 5, max: 300 }).withMessage("manuscriptTitle must be between 5 and 300 characters"),

  body("abstract")
    .optional({ nullable: true })
    .isString().withMessage("abstract must be a string")
    .trim()
    .isLength({ min: 20 }).withMessage("abstract must be at least 20 characters"),

  body("category")
    .optional({ nullable: true })
    .isString().withMessage("category must be a string")
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage("category must be between 2 and 100 characters"),

  body("keywords")
    .optional({ nullable: true })
    .isString().withMessage("keywords must be a string")
    .trim()
    .custom((value) => {
      if (value) {
        const keywords = value.split(",").map((k: string) => k.trim()).filter((k: string | any[]) => k.length > 0);
        if (keywords.length === 0) throw new Error("At least one keyword is required");
        if (keywords.some((k: string | any[]) => k.length < 2)) throw new Error("Each keyword must be at least 2 characters");
      }
      return true;
    }),

  body("authors")
    .isArray({ min: 1 }).withMessage("At least one author is required"),
  authorValidator,

  body("files")
    .isArray({ min: 1 }).withMessage("At least one file is required"),
  fileValidator,

  body("declarations")
    .isArray({ min: 1 }).withMessage("At least one declaration is required"),
  declarationValidator,
];

export const updateSubmissionValidation = [
  body("status")
    .optional()
    .isIn(Object.values(SubmissionStatus))
    .withMessage(`Status must be one of: ${Object.values(SubmissionStatus).join(", ")}`),

  body("manuscriptTitle")
    .optional({ nullable: true })
    .isString().withMessage("manuscriptTitle must be a string")
    .trim()
    .isLength({ min: 5, max: 300 }).withMessage("manuscriptTitle must be between 5 and 300 characters"),

  body("abstract")
    .optional({ nullable: true })
    .isString().withMessage("abstract must be a string")
    .trim()
    .isLength({ min: 20 }).withMessage("abstract must be at least 20 characters"),

  body("category")
    .optional({ nullable: true })
    .isString().withMessage("category must be a string")
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage("category must be between 2 and 100 characters"),

  body("keywords")
    .optional({ nullable: true })
    .isString().withMessage("keywords must be a string")
    .trim()
    .custom((value) => {
      if (value) {
        const keywords = value.split(",").map((k: string) => k.trim()).filter((k: string | any[]) => k.length > 0);
        if (keywords.some((k: string | any[]) => k.length < 2)) throw new Error("Each keyword must be at least 2 characters");
      }
      return true;
    }),
];

export const paginationValidation = [
  body("page")
    .optional()
    .isInt({ min: 1 }).withMessage("Page must be a positive integer")
    .toInt(),

  body("limit")
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100")
    .toInt(),
];

export { matchedData };