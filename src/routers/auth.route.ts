import { Router } from "express";
import {
  registerValidation,
  validate,
  verifyEmailValidation,
} from "../middlewares/validations/authValidation";
const route = Router();
import * as authController from "../controllers/auth.controller";
import { authenticate } from "../middlewares/authMiddleware";
import {
  loginValidation,
  verify2FAValidation,
  ResendCodeValidation,
} from "../middlewares/validations/authValidation";
import {
  forgotPasswordValidator,
  resetPasswordValidator,
} from "../middlewares/validations/forgotPasswordValidator";

route
  .post("/register", registerValidation, validate, authController.register)
  .post(
    "/resend-code",
    ResendCodeValidation,
    validate,
    authController.resendVerificationCode
  )
  .post("/login", loginValidation, validate, authController.login)
  .post(
    "/verify-2fa",
    verify2FAValidation,
    validate,
    authController.verifyTwoFactorCode
  )
  .post(
    "/verify-email",
    verifyEmailValidation,
    validate,
    authController.verifyEmailCode
  )
  .post("/logout", authenticate, authController.logout)
  .post(
    "/forgot-password",
    forgotPasswordValidator,
    validate,
    authController.forgotPassword
  )
  .post(
    "/reset-password",
    resetPasswordValidator,
    validate,
    authController.resetPassword
  );

export default route;
