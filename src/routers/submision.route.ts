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
    authenticate,
    createSubmissionValidation,
    validate,
    SubmissionController.create
  )
  // Single file
  .post(
  "/upload",
  authenticate,
  upload.single("file"),
  SubmissionController.uploadFile
  )

// Multiple files
  .post(
  "/upload-multiple",
  authenticate,
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
    authenticate,
    deleteSubmissionValidation,
    validate,
    SubmissionController.delete
  )
  .get("/stats", authenticate, SubmissionController.stats);

export default router;
