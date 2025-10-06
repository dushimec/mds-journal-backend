import { body, param, query, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { logger } from "../../utils/logger";

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array({ onlyFirstError: true }).map(err => err.msg);
    logger.warn(`Article validation failed: ${errorMessages.join(", ")}`);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errorMessages,
    });
  }
  next();
};

export const createArticleValidation = [
  body("title")
    .isString()
    .withMessage("Title is required"),
  body("authors")
    .isString()
    .withMessage("Authors is required"),
  body("abstract")
    .optional()
    .isString()
    .withMessage("Abstract must be a string"),
  body("publishedAt")
    .isISO8601()
    .withMessage("publishedAt must be a valid ISO date string"),
  body("doi")
    .optional()
    .isString()
    .withMessage("DOI must be a string"),
  body("pdfUrl")
    .optional()
    .isString()
    .withMessage("PDF URL must be a string"),
  body("category")
    .isString()
    .withMessage("Category is required"),
  body("keywords")
    .isString()
    .withMessage("Keywords is required"),
  body("isHighlighted")
    .optional()
    .isBoolean()
    .withMessage("isHighlighted must be boolean"),
  body("order")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Order must be a positive integer"),
  body("issueId")
    .optional()
    .isString()
    .withMessage("Issue ID must be a string"),
];

export const updateArticleValidation = [
  param("id").isString().withMessage("Article ID is required"),
  body("title").optional().isString(),
  body("authors").optional().isString(),
  body("abstract").optional().isString(),
  body("publishedAt").optional().isISO8601(),
  body("doi").optional().isString(),
  body("pdfUrl").optional().isString(),
  body("category").optional().isString(),
  body("keywords").optional().isString(),
  body("isHighlighted").optional().isBoolean(),
  body("order").optional().isInt({ min: 0 }),
  body("issueId").optional().isString(),
];

export const deleteArticleValidation = [
  param("id").isString().withMessage("Article ID is required"),
];

export const getByIdArticleValidation = [
  param("id").isString().withMessage("Article ID is required"),
];

export const getAllArticlesValidation = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  query("category").optional().isString(),
  query("highlighted").optional().isBoolean(),
  query("search").optional().isString(),
  query("issueId").optional().isString(),
];

export const createIssueValidation = [
  body("title").isString().withMessage("Title is required"),
  body("volume").isInt().withMessage("Volume is required"),
  body("number").isInt().withMessage("Number is required"),
  body("year").isInt().withMessage("Year is required"),
  body("publishedAt").isISO8601().withMessage("PublishedAt is required"),
  body("description").optional().isString(),
];

export { matchedData } from "express-validator";