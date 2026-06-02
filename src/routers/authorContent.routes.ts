import { Router } from "express";
import { AuthorContentController } from "../controllers/authorContent.controller";
import { authenticate, authorizeRoles } from "../middlewares/authMiddleware";
import { UserRole } from "@prisma/client";
import { body, param } from "express-validator";
import { validate } from "../middlewares/validations/submissionValidation";

const router = Router();

// Admin: Get all authors with content
router.get(
  "/",
  authenticate,
  authorizeRoles(UserRole.ADMIN, UserRole.EDITOR),
  AuthorContentController.getAuthorsWithContent
);

// Public: Get author content by ID
router.get(
  "/:authorId",
  param("authorId").isString().withMessage("Author ID must be a string"),
  validate,
  AuthorContentController.getAuthorContent
);

// Admin: Update author page content
router.patch(
  "/:authorId",
  authenticate,
  authorizeRoles(UserRole.ADMIN),
  param("authorId").isString().withMessage("Author ID must be a string"),
  body("pageContent").optional().isString().withMessage("Page content must be a string"),
  validate,
  AuthorContentController.updateAuthorContent
);

export default router;
