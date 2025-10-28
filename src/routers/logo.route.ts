import { Router } from "express";
import { upload } from "../middlewares/upload";
import { LogoController } from "../controllers/logoUpload.controller";
import { authenticate, authorizeRoles } from "../middlewares/authMiddleware";
import { UserRole } from "@prisma/client";

const router = Router();

router
  .get(
    "/",
    authenticate,
    authorizeRoles(UserRole.ADMIN),
    LogoController.getSettings
  )
  .post(
    "/",
    authenticate,
    authorizeRoles(UserRole.ADMIN),
    upload.single("logo"),
    LogoController.createSettings
  )
  .put(
    "/",
    authenticate,
    authorizeRoles(UserRole.ADMIN),
    upload.single("logo"),
    LogoController.updateSettings
  )
  .delete(
    "/logo",
    authenticate,
    authorizeRoles(UserRole.ADMIN),
    LogoController.deleteLogo
  );

export default router;
