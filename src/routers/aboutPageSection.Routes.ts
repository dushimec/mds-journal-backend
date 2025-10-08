import { Router } from "express";
import {
  createSection,
  deleteSection,
  getAllSections,
  getSectionById,
  updateSection,
} from "../controllers/aboutPageSection.Controller";
import { sectionValidation } from "../middlewares/validations/aboutSectionValidator";

const aboutSectionRoute = Router();

aboutSectionRoute
  .post("/", sectionValidation, createSection)
  .get("/", getAllSections)
  .get("/:id", getSectionById)
  .put("/:id", sectionValidation, updateSection)
  .delete("/:id", deleteSection);

export default aboutSectionRoute;
