import { Router, Request, Response, NextFunction } from "express";
import { SubmissionController } from "../controllers/submission.controller";
import { authenticate, authorizeRoles } from "../middlewares/authMiddleware";
import { upload ,uploadFile, uploadFiles} from "../middlewares/upload";
import {
  createSubmissionValidation,
  deleteSubmissionValidation,
  getAllSubmissionsValidation,
  getByIdSubmissionValidation,
  updateSubmissionValidation,
  validate,
} from "../middlewares/validations/submissionValidation";
import { UserRole, SubmissionStatus } from "@prisma/client";
import { body, param } from "express-validator";

const router = Router();

router.get(
  "/",
  getAllSubmissionsValidation,
  validate,
  SubmissionController.getAll
);

router.post(
  "/",
  authenticate,
  authorizeRoles(UserRole.AUTHOR),
  createSubmissionValidation,
  validate,
  SubmissionController.create
);

router.post(
  "/upload",
  authenticate,
  authorizeRoles(UserRole.AUTHOR),
  upload.single("file"),
  uploadFile
);

router.post(
  "/upload-multiple",
  authenticate,
  authorizeRoles(UserRole.AUTHOR),
  uploadFiles
);

router.get(
  "/:id",
  authenticate,
  authorizeRoles(UserRole.ADMIN),
  getByIdSubmissionValidation,
  validate,
  SubmissionController.getById
);

router.put(
  "/:id",
  authenticate,
  authorizeRoles(UserRole.AUTHOR, UserRole.EDITOR, UserRole.ADMIN),
  updateSubmissionValidation,
  validate,
  SubmissionController.update
);

router.delete(
  "/:id",
  authenticate,
  authorizeRoles(UserRole.ADMIN),
  deleteSubmissionValidation,
  validate,
  SubmissionController.delete
);

router.get(
  "/stats",
  authenticate,
  authorizeRoles(UserRole.ADMIN, UserRole.EDITOR),
  SubmissionController.stats
);

router.get("/:submissionId/download", SubmissionController.downloadFile);

router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles(UserRole.ADMIN, UserRole.EDITOR, UserRole.REVIEWER, UserRole.AUTHOR),
  [
    param("id").isString().notEmpty().withMessage("Submission ID is required"),
    body("status")
      .isIn(Object.values(SubmissionStatus))
      .withMessage("Invalid submission status"),
  ],
  validate,
  SubmissionController.updateStatus
);

export default router;
