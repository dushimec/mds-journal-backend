import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { authenticate, authorizeRoles } from "../middlewares/authMiddleware";
import { UserRole } from "@prisma/client";

const route = Router();

route.use(authenticate);

route.get("/profile", userController.getUserProfile);
route.get("/stats", authorizeRoles(UserRole.ADMIN), userController.getUserStats);

route
  .route("/")
  .get(authorizeRoles(UserRole.ADMIN), userController.getUsers);

route
  .route("/:id")
  .get(authorizeRoles(UserRole.ADMIN), userController.getUserById)
  .put(userController.updateUser)
  .delete(authorizeRoles(UserRole.ADMIN), userController.deleteUser);

export default route;
