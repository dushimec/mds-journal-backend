import { Router } from "express";
import AnnouncementController from "../controllers/announcement.controller";
import { body } from "express-validator";
import { authenticate, authorizeRoles } from "../middlewares/authMiddleware";
import { UserRole } from "@prisma/client";

const router = Router();

// Validators
const announcementValidator = [
  body("title").notEmpty().withMessage("Title is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("date").optional().isISO8601().toDate(),
];

router.post("/", authenticate,authorizeRoles(UserRole.ADMIN), announcementValidator, AnnouncementController.createAnnouncement);
router.get("/", AnnouncementController.getAllAnnouncements);
router.get("/:id", authenticate,authorizeRoles(UserRole.ADMIN),AnnouncementController.getAnnouncementById);
router.put("/:id", authenticate,authorizeRoles(UserRole.ADMIN),announcementValidator, AnnouncementController.updateAnnouncement);
router.delete("/:id", authenticate,authorizeRoles(UserRole.ADMIN),AnnouncementController.deleteAnnouncement);

export default router;
