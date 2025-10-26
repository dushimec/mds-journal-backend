import { body } from "express-validator";

export const forgotPasswordValidator = [body("email").isEmail().withMessage("Please enter a valid email")];

export const resetPasswordValidator = [
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
];
