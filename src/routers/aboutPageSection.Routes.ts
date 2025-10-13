import { Router } from "express";
import {
  createSection,
  deleteSection,
  getAllSections,
  getSectionById,
  updateSection,
} from "../controllers/aboutPageSection.Controller";
import { sectionValidation } from "../middlewares/validations/aboutSectionValidator";
import { authenticate, authorizeRoles } from "../middlewares/authMiddleware";
import { UserRole } from "@prisma/client";

const aboutSectionRoute = Router();

aboutSectionRoute
  .post("/", sectionValidation, authenticate, authorizeRoles(UserRole.ADMIN),createSection)
  .get("/", getAllSections)
  .get("/:id", getSectionById)
  .put("/:id", sectionValidation,authenticate, authorizeRoles(UserRole.ADMIN), updateSection)
  .delete("/:id",authenticate, authorizeRoles(UserRole.ADMIN), deleteSection);

export default aboutSectionRoute;
