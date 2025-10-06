import { body } from "express-validator";


export const sectionValidation = [
  body("section").isString().withMessage("Section is required"),
  body("content").notEmpty().withMessage("Content is required"),
  body("order").optional().isInt().withMessage("Order must be an integer"),
];