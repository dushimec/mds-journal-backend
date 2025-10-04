import { Router } from "express";
import { SubmissionController } from "../controllers/submission.controller";
import { authenticate } from "../middlewares/authMiddleware";
import { createSubmissionValidation, deleteSubmissionValidation, getAllSubmissionsValidation, getByIdSubmissionValidation, updateSubmissionValidation, validate } from "../middlewares/validations/submissionValidation";

const router = Router()

router
    .get("/",getAllSubmissionsValidation, validate, SubmissionController.getAll)
    .post("/", createSubmissionValidation,validate, SubmissionController.create)
    .get("/:id", authenticate,getByIdSubmissionValidation,validate, SubmissionController.getById)
    .put("/:id", authenticate,updateSubmissionValidation,validate, SubmissionController.update)
    .delete("/:id", authenticate,deleteSubmissionValidation,validate, SubmissionController.delete)
    .get("/stats", authenticate, SubmissionController.stats)


export default router;;