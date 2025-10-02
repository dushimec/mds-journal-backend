import { Router } from "express";
import { registerValidation, validate, verifyEmailValidation } from "../middlewares/validations/authValidation";
const route = Router();
import * as authController from "../controllers/auth.controller";
import { authenticate } from "../middlewares/authMiddleware";
import { loginValidation, verify2FAValidation } from "../middlewares/validations/authValidation";

route
    .post("/register", registerValidation,validate,authController.register)
    .post("/login", loginValidation, validate, authController.login)
    .post("/verify-2fa", verify2FAValidation, validate, authController.verifyTwoFactorCode)
    .post("/verify-email",verifyEmailValidation, validate, authController.verifyEmailCode)
    .post("/logout", authenticate, authController.logout);

export default route;