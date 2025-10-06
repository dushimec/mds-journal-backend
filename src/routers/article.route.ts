import { Router } from "express";
import { ArticleController } from "../controllers/article.controller";
import { authenticate } from "../middlewares/authMiddleware";
import {
  createArticleValidation,
  updateArticleValidation,
  deleteArticleValidation,
  getAllArticlesValidation,
  getByIdArticleValidation,
  validate,
  createIssueValidation,
} from "../middlewares/validations/articleValidation";

const router = Router();

router
  .get(
    "/",
    getAllArticlesValidation,
    validate,
    ArticleController.getAll
  )
  .post(
    "/",
    authenticate,
    createArticleValidation,
    validate,
    ArticleController.create
  )
  .get(
    "/:id",
    authenticate,
    getByIdArticleValidation,
    validate,
    ArticleController.getById
  )
  .put(
    "/:id",
    authenticate,
    updateArticleValidation,
    validate,
    ArticleController.update
  )
  .delete(
    "/:id",
    authenticate,
    deleteArticleValidation,
    validate,
    ArticleController.delete
  )
  .post(
    "/bulk-delete",
    ArticleController.bulkDelete
  )
  .post(
        "/:id/views",
    ArticleController.incrementViews
  )
  .post(
    "/:id/downloads",
    ArticleController.incrementDownloads
  )
  .get(
    "/stats",
    ArticleController.stats
  )
  .get(
    "/issue/:issueId/stats",
    authenticate,
    ArticleController.issueStats
  )
  .post(
    "/issue",
    authenticate,
    createIssueValidation,
    validate,
    ArticleController.createIssue
  );

export default router;