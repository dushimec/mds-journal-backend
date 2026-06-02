import { Router } from "express";
import { AuthorController } from "../controllers/author.controller";
import { authenticate, authorizeRoles } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validate";
import { param, body } from "express-validator";
import { UserRole } from "@prisma/client";

const router = Router();

/**
 * @route GET /api/v1/authors
 * @access Admin, Editor
 * @description Get all authors
 */
router.get(
  "/",
  authenticate,
  authorizeRoles(UserRole.ADMIN, UserRole.EDITOR),
  AuthorController.getAll
);

/**
 * @route GET /api/v1/authors/emails/unique
 * @access Admin, Editor
 * @description Get unique author emails
 */
router.get(
  "/emails/unique",
  authenticate,
  authorizeRoles(UserRole.ADMIN, UserRole.EDITOR),
  AuthorController.getUniqueEmails
);

/**
 * @route GET /api/v1/authors/:id
 * @access Admin, Editor
 * @description Get author by ID
 */
router.get(
  "/:id",
  authenticate,
  authorizeRoles(UserRole.ADMIN, UserRole.EDITOR),
  param("id").notEmpty().withMessage("Author ID is required"),
  validate,
  AuthorController.getById
);

/**
 * @route PATCH /api/v1/authors/:id
 * @access Admin, Editor
 * @description Update author
 */
router.patch(
  "/:id",
  authenticate,
  authorizeRoles(UserRole.ADMIN, UserRole.EDITOR),
  param("id").notEmpty().withMessage("Author ID is required"),
  validate,
  AuthorController.update
);

/**
 * @route DELETE /api/v1/authors/:id
 * @access Admin
 * @description Delete author
 */
router.delete(
  "/:id",
  authenticate,
  authorizeRoles(UserRole.ADMIN),
  param("id").notEmpty().withMessage("Author ID is required"),
  validate,
  AuthorController.delete
);

/**
 * @route GET /api/v1/authors/submission/:submissionId
 * @access Public
 * @description Get authors by submission ID
 */
router.get(
  "/submission/:submissionId",
  param("submissionId").notEmpty().withMessage("Submission ID is required"),
  validate,
  AuthorController.getBySubmission
);

export default router;
