
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
  bulkDeleteArticlesValidation,
  incrementViewsValidation,
  incrementDownloadsValidation,
  getIssueStatsValidation,
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
    authenticate,
    bulkDeleteArticlesValidation,
    validate,
    ArticleController.bulkDelete
  )
  .post(
        "/:id/views",
    incrementViewsValidation,
    validate,
    ArticleController.incrementViews
  )
  .post(
    "/:id/downloads",
    incrementDownloadsValidation,
    validate,
    ArticleController.incrementDownloads
  )
  .get(
    "/stats",
    ArticleController.stats
  )
  .get(
    "/issue/:issueId/stats",
    authenticate,
    getIssueStatsValidation,
    validate,
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
