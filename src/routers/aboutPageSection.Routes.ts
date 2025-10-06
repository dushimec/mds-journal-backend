import { Router } from "express";
import { createSection, deleteSection, getAllSections, getSectionById, updateSection } from "../controllers/aboutPageSection.Controller";
import { sectionValidation } from "../middlewares/validations/aboutSectionValidator";

const aboutSectionRoute = Router()

aboutSectionRoute.post("/", sectionValidation, createSection);
aboutSectionRoute.get("/", getAllSections);
aboutSectionRoute.get("/:id", getSectionById);
aboutSectionRoute.put("/:id", sectionValidation, updateSection);
aboutSectionRoute.delete("/:id", deleteSection);

export default aboutSectionRoute

