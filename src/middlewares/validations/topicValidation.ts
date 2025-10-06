import { body, param } from "express-validator";

export const createTopicValidation = [
  body("name")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Name is required"),
];

export const updateTopicValidation = [
  body("name")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Name must be a non-empty string"),
];

export const deleteTopicValidation = [
  param("id")
    .isString()
    .notEmpty()
    .withMessage("Valid topic ID is required"),
];

export const getByIdTopicValidation = [
  param("id")
    .isString()
    .notEmpty()
    .withMessage("Valid topic ID is required"),
];

// You likely already have a `validate` middleware that runs validationResult.