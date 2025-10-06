import { Router } from "express";
import { EditorialBoardMemberController } from "../controllers/editorialBoardMember.controller";
import { authenticate } from "../middlewares/authMiddleware";
import {
  createEditorialBoardMemberValidation,
  updateEditorialBoardMemberValidation,
  deleteEditorialBoardMemberValidation,
  getByIdEditorialBoardMemberValidation,
  validate,
} from "../middlewares/validations/editorialBoardMemberValidation";

const router = Router();

router
  .get(
    "/",
    EditorialBoardMemberController.getAll
  )
  .post(
    "/",
    authenticate,
    createEditorialBoardMemberValidation,
    validate,
    ...EditorialBoardMemberController.create
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
    updateEditorialBoardMemberValidation,
    validate,
    ...EditorialBoardMemberController.update
  )
  .delete(
    "/:id",
    authenticate,
    deleteEditorialBoardMemberValidation,
    validate,
    EditorialBoardMemberController.delete
  );

export default router;