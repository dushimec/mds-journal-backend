import { Router } from "express";
import { 
  viewArticlePdf, 
  viewArticlePdfByPath, 
  getArticlePdfUrl,
  streamArticlePdf 
} from "../controllers/streamFile.controller";
import {
  getArticleBibtex,
  getArticleRis,
  getArticleCitation,
  getArticleReferences
} from "../controllers/citation.controller";

const router = Router();

// PDF Routes - SEO-optimized streaming
router.get("/vol:volume/issue:issue/:slug.pdf", streamArticlePdf);

// Citation Routes
router.get("/vol:volume/issue:issue/:slug/citation", getArticleCitation);
router.get("/vol:volume/issue:issue/:slug/citation/bibtex", getArticleBibtex);
router.get("/vol:volume/issue:issue/:slug/citation/ris", getArticleRis);

// References Route
router.get("/vol:volume/issue:issue/:slug/references", getArticleReferences);

// Legacy routes
router.get("/article-pdf/:doiSlug/url", getArticlePdfUrl);


export default router;
