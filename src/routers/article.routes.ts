import { Router } from "express";
import { viewArticlePdf, downloadArticlePdf, viewArticlePdfByPath, getArticlePdfUrl } from "../controllers/streamFile.controller";

const router = Router();

// GET /article/mds/:submissionId/pdf - View PDF inline in browser
router.get("/:volume/:issue/:slug.pdf", viewArticlePdf);

// GET /article/article-pdf/:doiSlug/url - Get PDF URL
router.get(/^\/article-pdf\/(.+)\/url$/, getArticlePdfUrl);

// GET /article/:doi/download - Download PDF
router.get(/^\/(.+)\/download$/, downloadArticlePdf);

export default router;
