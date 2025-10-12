"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const article_controller_1 = require("../controllers/article.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const articleValidation_1 = require("../middlewares/validations/articleValidation");
const router = (0, express_1.Router)();
router
    .get("/", articleValidation_1.getAllArticlesValidation, articleValidation_1.validate, article_controller_1.ArticleController.getAll)
    .post("/", authMiddleware_1.authenticate, articleValidation_1.createArticleValidation, articleValidation_1.validate, article_controller_1.ArticleController.create)
    .get("/:id", authMiddleware_1.authenticate, articleValidation_1.getByIdArticleValidation, articleValidation_1.validate, article_controller_1.ArticleController.getById)
    .put("/:id", authMiddleware_1.authenticate, articleValidation_1.updateArticleValidation, articleValidation_1.validate, article_controller_1.ArticleController.update)
    .delete("/:id", authMiddleware_1.authenticate, articleValidation_1.deleteArticleValidation, articleValidation_1.validate, article_controller_1.ArticleController.delete)
    .post("/bulk-delete", authMiddleware_1.authenticate, articleValidation_1.bulkDeleteArticlesValidation, articleValidation_1.validate, article_controller_1.ArticleController.bulkDelete)
    .post("/:id/views", articleValidation_1.incrementViewsValidation, articleValidation_1.validate, article_controller_1.ArticleController.incrementViews)
    .post("/:id/downloads", articleValidation_1.incrementDownloadsValidation, articleValidation_1.validate, article_controller_1.ArticleController.incrementDownloads)
    .get("/stats", article_controller_1.ArticleController.stats)
    .get("/issue/:issueId/stats", authMiddleware_1.authenticate, articleValidation_1.getIssueStatsValidation, articleValidation_1.validate, article_controller_1.ArticleController.issueStats)
    .post("/issue", authMiddleware_1.authenticate, articleValidation_1.createIssueValidation, articleValidation_1.validate, article_controller_1.ArticleController.createIssue);
exports.default = router;
//# sourceMappingURL=article.route.js.map