import { Router } from "express";
import { TopicController } from "../controllers/topic.controller";
import { authenticate } from "../middlewares/authMiddleware";
import {
  createTopicValidation,
  updateTopicValidation,
  deleteTopicValidation,
  getByIdTopicValidation,
} from "../middlewares/validations/topicValidation";

const router = Router();

router
  .get(
    "/",
    TopicController.getAll
  )
  .post(
    "/",
    authenticate,
    createTopicValidation,
    TopicController.create
  )
  .get(
    "/:id",
    getByIdTopicValidation,
    
    TopicController.getById
  )
  .put(
    "/:id",
    authenticate,
    updateTopicValidation,
    
    TopicController.update
  )
  .delete(
    "/:id",
    authenticate,
    deleteTopicValidation,
    
    TopicController.delete
  );

export default router;