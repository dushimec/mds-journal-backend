"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const submission_controller_1 = require("../controllers/submission.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const upload_1 = require("../middlewares/upload");
const submissionValidation_1 = require("../middlewares/validations/submissionValidation");
const router = (0, express_1.Router)();
router
    .get("/", submissionValidation_1.getAllSubmissionsValidation, submissionValidation_1.validate, submission_controller_1.SubmissionController.getAll)
    .post("/", authMiddleware_1.authenticate, submissionValidation_1.createSubmissionValidation, submissionValidation_1.validate, submission_controller_1.SubmissionController.create)
    // Single file
    .post("/upload", authMiddleware_1.authenticate, upload_1.upload.single("file"), submission_controller_1.SubmissionController.uploadFile)
    // Multiple files
    .post("/upload-multiple", authMiddleware_1.authenticate, upload_1.upload.array("files", 5), // max 5 files
submission_controller_1.SubmissionController.uploadFiles)
    .get("/:id", authMiddleware_1.authenticate, submissionValidation_1.getByIdSubmissionValidation, submissionValidation_1.validate, submission_controller_1.SubmissionController.getById)
    .put("/:id", authMiddleware_1.authenticate, submissionValidation_1.updateSubmissionValidation, submissionValidation_1.validate, submission_controller_1.SubmissionController.update)
    .delete("/:id", authMiddleware_1.authenticate, submissionValidation_1.deleteSubmissionValidation, submissionValidation_1.validate, submission_controller_1.SubmissionController.delete)
    .get("/stats", authMiddleware_1.authenticate, submission_controller_1.SubmissionController.stats);
exports.default = router;
//# sourceMappingURL=submision.route.js.map