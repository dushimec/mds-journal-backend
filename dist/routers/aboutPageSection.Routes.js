"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const aboutPageSection_Controller_1 = require("../controllers/aboutPageSection.Controller");
const aboutSectionValidator_1 = require("../middlewares/validations/aboutSectionValidator");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const aboutSectionRoute = (0, express_1.Router)();
aboutSectionRoute
    .post("/", aboutSectionValidator_1.sectionValidation, authMiddleware_1.authenticate, aboutPageSection_Controller_1.createSection)
    .get("/", aboutPageSection_Controller_1.getAllSections)
    .get("/:id", aboutPageSection_Controller_1.getSectionById)
    .put("/:id", aboutSectionValidator_1.sectionValidation, aboutPageSection_Controller_1.updateSection)
    .delete("/:id", aboutPageSection_Controller_1.deleteSection);
exports.default = aboutSectionRoute;
//# sourceMappingURL=aboutPageSection.Routes.js.map