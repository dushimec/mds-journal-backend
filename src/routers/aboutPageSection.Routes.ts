import { Router } from "express";
import {
  createSection,
  deleteSection,
  getAllSections,
  getSectionById,
  updateSection,
} from "../controllers/aboutPageSection.Controller";
import { sectionValidation } from "../middlewares/validations/aboutSectionValidator";
import { authenticate } from "../middlewares/authMiddleware";

const aboutSectionRoute = Router();

aboutSectionRoute
  .post("/", sectionValidation, authenticate, createSection)
  .get("/", getAllSections)
  .get("/:id", getSectionById)
  .put("/:id", sectionValidation, updateSection)
  .delete("/:id", deleteSection);

export default aboutSectionRoute;
