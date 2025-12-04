import { Router, Request, Response, NextFunction } from "express";
import { SubmissionController } from "../controllers/submission.controller";
import { authenticate, authorizeRoles } from "../middlewares/authMiddleware";
import { downloadFile, downloadSubmissionFiles, downloadFirstSubmissionFile } from "../controllers/streamFile.controller";
import { multipleUpload, upload } from "../middlewares/upload";
import {
  createSubmissionValidation,
  deleteSubmissionValidation,
  getAllSubmissionsValidation,
  getByIdSubmissionValidation,
  updateSubmissionValidation,
  validate,
} from "../middlewares/validations/submissionValidation";
import { UserRole, SubmissionStatus } from "@prisma/client";
import { body, param, query } from "express-validator";

const router = Router();

router.get(
  "/",
  getAllSubmissionsValidation,
  validate,
  SubmissionController.getAll
);

router.get("/file/:fileId", downloadFile);

router.get("/:submissionId/file/", downloadFirstSubmissionFile);

router.get(
  "/:submissionId/files/download",
  authenticate,
  authorizeRoles(UserRole.AUTHOR, UserRole.EDITOR, UserRole.ADMIN),
  downloadSubmissionFiles
);

router.post(
  "/",
  authenticate,
  authorizeRoles(UserRole.AUTHOR),
  createSubmissionValidation,
  validate,
   multipleUpload("files"),
  SubmissionController.create
);

// NOTE: `/:id` route is defined later to avoid conflicting with more specific routes like `/download`.

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


// Generic fetch by id (placed after more specific routes to avoid route conflicts)
router.get(
  "/:id",
  authenticate,
  authorizeRoles(UserRole.ADMIN),
  getByIdSubmissionValidation,
  validate,
  SubmissionController.getById
);

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

router.patch(
  "/:submissionId/files/:fileId/edited",
  authenticate,
  authorizeRoles(UserRole.ADMIN),
  upload.single("file"),
  SubmissionController.updateEditedFile
);


export default router;
