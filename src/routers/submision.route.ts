import { Router } from "express";
import { SubmissionController } from "../controllers/submission.controller";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router()

router
    .get("/", SubmissionController.getAll)
    .post("/",  SubmissionController.create)
    .get("/:id", authenticate, SubmissionController.getById)
    .put("/:id", authenticate, SubmissionController.update)
    .delete("/:id", authenticate, SubmissionController.delete)
    .get("/stats", authenticate, SubmissionController.stats)


export default router;;