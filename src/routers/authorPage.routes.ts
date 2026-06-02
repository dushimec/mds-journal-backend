import { Router } from "express";
import { AuthorPageController } from "../controllers/authorPage.controller";
import { authenticate, authorizeRoles } from "../middlewares/authMiddleware";
import { UserRole } from "@prisma/client";
import { body } from "express-validator";
import { validate } from "../middlewares/validations/submissionValidation";

const router = Router();

// Public: Get author page content
router.get(
  "/",
  AuthorPageController.getAuthorPageContent
);

// Admin: Update author page content
router.patch(
  "/",
  authenticate,
  authorizeRoles(UserRole.ADMIN),
  body("title").notEmpty().withMessage("Title is required").isString(),
  body("tagline").notEmpty().withMessage("Tagline is required").isString(),
  body("submissionSteps").optional(),
  body("articleTypes").optional(),
  body("guidelines").optional(),
  validate,
  AuthorPageController.updateAuthorPageContent
);

export default router;
