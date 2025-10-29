import { Router } from "express";
import { EditorialBoardMemberController } from "../controllers/editorialBoardMember.controller";
import { authenticate, authorizeRoles } from "../middlewares/authMiddleware";
import {
  createEditorialBoardMemberValidation,
  updateEditorialBoardMemberValidation,
  deleteEditorialBoardMemberValidation,
  getByIdEditorialBoardMemberValidation,
  validate,
} from "../middlewares/validations/editorialBoardMemberValidation";
import { upload } from "../middlewares/upload"; 
import { UserRole } from "@prisma/client";

const router = Router();

router
  .get("/", EditorialBoardMemberController.getAll)

  .post(
    "/",
    upload.single("profileImage"),
    createEditorialBoardMemberValidation,
    validate,
    EditorialBoardMemberController.create
  )

  .get(
    "/:id",
    getByIdEditorialBoardMemberValidation,
    validate,
    EditorialBoardMemberController.getById
  )

  .put(
    "/:id",
    authenticate,
    authorizeRoles(UserRole.ADMIN),
    upload.single("profileImage"),
    updateEditorialBoardMemberValidation,
    validate,
    EditorialBoardMemberController.update
  )

  .delete(
    "/:id",
    authenticate,
    authorizeRoles(UserRole.ADMIN),
    deleteEditorialBoardMemberValidation,
    validate,
    EditorialBoardMemberController.delete
  )

  .patch(
    "/:id/approve",
    authenticate,
    authorizeRoles(UserRole.ADMIN),
    EditorialBoardMemberController.approve
  );

export default router;
