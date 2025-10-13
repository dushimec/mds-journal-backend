import { Router } from "express";
import { SubmissionController } from "../controllers/submission.controller";
import { authenticate, authorizeRoles } from "../middlewares/authMiddleware";
import { upload } from "../middlewares/upload"; 
import {
  createSubmissionValidation,
  deleteSubmissionValidation,
  getAllSubmissionsValidation,
  getByIdSubmissionValidation,
  updateSubmissionValidation,
  validate,
} from "../middlewares/validations/submissionValidation";
import { UserRole } from "@prisma/client";

const router = Router();

router
  .get(
    "/",
    getAllSubmissionsValidation,
    validate,
    SubmissionController.getAll
  )
  .post(
    "/",
    authenticate,authorizeRoles(UserRole.AUTHOR),
    createSubmissionValidation,
    validate,
    SubmissionController.create
  )
  // Single file
  .post(
  "/upload",
  authenticate,authorizeRoles(UserRole.AUTHOR),
  upload.single("file"),
  SubmissionController.uploadFile
  )

// Multiple files
  .post(
  "/upload-multiple",
  authenticate,authorizeRoles(UserRole.AUTHOR),
  upload.array("files", 5), // max 5 files
  SubmissionController.uploadFiles
   )

  .get(
    "/:id",
    authenticate,
    getByIdSubmissionValidation,
      authorizeRoles(UserRole.ADMIN),
    validate,
    SubmissionController.getById
  )
  .put(
    "/:id",
    authenticate,
    updateSubmissionValidation,
    validate,
    SubmissionController.update
  )
  .delete(
    "/:id",
    authenticate,authorizeRoles(UserRole.ADMIN),
    deleteSubmissionValidation,
    validate,
    SubmissionController.delete
  )
  .get("/stats", SubmissionController.stats);

export default router;
