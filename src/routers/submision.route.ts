import { Router } from "express";
import { SubmissionController } from "../controllers/submission.controller";
import { authenticate } from "../middlewares/authMiddleware";
import { upload } from "../middlewares/upload"; 
import {
  createSubmissionValidation,
  deleteSubmissionValidation,
  getAllSubmissionsValidation,
  getByIdSubmissionValidation,
  updateSubmissionValidation,
  validate,
} from "../middlewares/validations/submissionValidation";

const router = Router();

router
  .get(
    "/",
    authenticate,
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
