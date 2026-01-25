// 1️⃣ Load dotenv immediately
import dotenv from "dotenv";
dotenv.config();

import "./types";
import express from "express";
import cors from "cors";
import path from "path";
import { logger } from "./utils/logger";
import { connectDB } from "./config/database";
import mainRoute from "./routers/index";

const app = express();

// Middleware
app.use(express.json());

const corsOptions = {
  origin: ["https://www.jaedp.org", "http://localhost:3000"],
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "public", "uploads"))
);

app.use((req, res, next) => {
  req.setTimeout(5 * 60 * 1000);
  res.setTimeout(5 * 60 * 1000);
  next();
});

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the MDS API 🚀");
});

// API routes
const api = process.env.API_URL || "/api";
app.use(api, mainRoute);

// PDF URL route
app.get("/mds/article-pdf/:doiSlug/url", async (req, res) => {
  const { prisma } = await import("./config/database");
  const cloudinary = (await import("./utils/cloudinary")).default;
  const doiSlug = req.params.doiSlug;

  const submission = await prisma.submission.findFirst({
    where: {
      doiSlug,
      status: "PUBLISHED",
    },
    include: {
      files: {
        where: { fileType: "MANUSCRIPT" },
      },
    },
  });

  if (!submission || !submission.files.length) {
    return res.status(404).json({
      success: false,
      message: "Article or manuscript not found",
    });
  }

  const manuscriptFile = submission.files[0];

  let viewUrl = manuscriptFile.secureUrl;
  if (!viewUrl) {
    viewUrl = cloudinary.url(manuscriptFile.publicId || "", {
      resource_type: "raw",
      type: "upload",
      secure: true,
      sign_url: true,
    });
  }

  await prisma.fileUpload.update({
    where: { id: manuscriptFile.id },
    data: { downloadCount: { increment: 1 } },
  });

  res.json({ url: viewUrl });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error("Unhandled error", {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  if (res.headersSent) return next(err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

/**
 * 🔑 IMPORTANT:
 * - NO app.listen()
 * - NO createServer()
 * - DEFAULT EXPORT REQUIRED
 */
connectDB().catch((err) => {
  logger.error("Database connection failed", err);
});

export default app;
