import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { prisma } from "../config/database";
import archiver from "archiver";
import axios from "axios";
import { UserRole } from "@prisma/client";
import { AppError } from "../utils/appError";

export const downloadFile = asyncHandler(async (req: Request, res: Response) => {
  // Accept either `fileId` (preferred) or `id` (some routes/clients may use this)
  const fileId = (req.params as any).fileId || (req.params as any).id;

  if (!fileId) {
    return res.status(400).json({ success: false, message: "File ID is required in the route params" });
  }

  const file = await prisma.fileUpload.findUnique({ where: { id: fileId } });
  if (!file) return res.status(404).json({ success: false, message: "File not found" });

  let downloadUrl = file.fileUrl || file.secureUrl;
  if (!downloadUrl) {
    return res.status(404).json({ success: false, message: "File URL not available" });
  }

  try {
    // Fetch file contents from downloadUrl
    const fileResponse = await axios.get(downloadUrl, { responseType: "stream", timeout: 30000 });

    // Set headers with original filename and RFC5987 filename* fallback
    const fileName = file.fileName || file.id;
    const safeFileName = String(fileName).replace(/"/g, '\\"');
    const encodedFileName = encodeURIComponent(String(fileName));
    res.setHeader("Content-Type", fileResponse.headers["content-type"] || "application/octet-stream");
    // Provide both plain filename and filename* for broader browser compatibility
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeFileName}"; filename*=UTF-8''${encodedFileName}`
    );
    if (fileResponse.headers["content-length"]) {
      res.setHeader("Content-Length", fileResponse.headers["content-length"]);
    }

    // Pipe file stream to response
    fileResponse.data.pipe(res);

    // Increment download count (best-effort, non-blocking)
    prisma.fileUpload
      .update({ where: { id: file.id }, data: { downloadCount: { increment: 1 } } })
      .catch((err) => console.warn("Failed to increment download count:", err));
  } catch (err: any) {
    console.error(`Failed to fetch file ${file.id} (${downloadUrl}):`, err?.message || err);
    return res.status(500).json({ success: false, message: "Failed to download file" });
  }
});

export const downloadFirstSubmissionFile = asyncHandler(async (req: Request, res: Response) => {
  const { submissionId } = req.params;

  if (!submissionId) {
    console.log("submissionId missing in request");
    return res.status(400).json({ success: false, message: "submissionId is required" });
  }

  const file = await prisma.fileUpload.findFirst({
    where: { submissionId },
    orderBy: { createdAt: "asc" },
  });

  console.log("Found file for submission:", file);

  if (!file) {
    console.log("No file found for submissionId:", submissionId);
    return res.status(404).json({ success: false, message: "No files found" });
  }

  try {
    let downloadUrl = file.fileUrl || file.secureUrl;
    if (!downloadUrl) {
      return res.status(404).json({ success: false, message: "File URL not available" });
    }
    console.log("Using download URL:", downloadUrl);

    // Stream file with extended timeout and allow redirects
    const fileResponse = await axios.get(downloadUrl, {
      responseType: "stream",
      timeout: 300000, // 5 minutes
      maxRedirects: 10,
    });

    // Preserve original filename and extension
    const baseName = file.fileName
      ? file.fileName.replace(/\.[^/.]+$/, "") // remove existing extension
      : file.publicId
        ? file.publicId.split("/").pop() || "downloaded_file"
        : "downloaded_file";

    const originalExtension = file.fileName?.split(".").pop() || "bin";
    const originalName = `${baseName}.${originalExtension}`;
    console.log("Streaming file with name:", originalName);

    const safeOriginalName = String(originalName).replace(/"/g, '\\"');
    const encodedOriginalName = encodeURIComponent(String(originalName));

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeOriginalName}"; filename*=UTF-8''${encodedOriginalName}`
    );

    // Use correct MIME type from database, fallback to binary
    res.setHeader("Content-Type", file.mimeType || "application/octet-stream");

    if (fileResponse.headers["content-length"]) {
      res.setHeader("Content-Length", fileResponse.headers["content-length"]);
    }

    // Pipe the stream
    fileResponse.data.pipe(res);
    console.log("File streaming started. Headers:", fileResponse.headers);

    // Increment download count (non-blocking)
    prisma.fileUpload
      .update({
        where: { id: file.id },
        data: { downloadCount: { increment: 1 } },
      })
      .then(() => console.log("Download count incremented"))
      .catch((err) => console.error("Failed to increment download count:", err));

  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ success: false, message: "Failed to download file" });
  }
});

// Stream a zip containing all files for a submission and increment download counts
export const downloadSubmissionFiles = asyncHandler(async (req: Request, res: Response) => {
  const { submissionId } = req.params;

  // Require authentication — route wiring should include `authenticate` middleware but double-check here
  const user = (req as any).user;
  if (!user) return res.status(401).json({ success: false, message: "Authentication required" });

  const submission = await prisma.submission.findUnique({ where: { id: submissionId }, include: { files: true } });
  if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });

  // Authors can only download their own submissions; editors/admins may download any
  if (user.role === UserRole.AUTHOR && submission.userId !== user.userId) {
    return res.status(403).json({ success: false, message: "Access denied: not your submission" });
  }

  const files = submission.files || [];
  if (files.length === 0) return res.status(404).json({ success: false, message: "No files available for this submission" });

  // Set headers for zip download
  const zipName = `submission-${submissionId}-files.zip`;
  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", `attachment; filename="${zipName}"`);

  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.on("error", (err) => {
    console.error("Archive error:", err);
    // If archive emits an error, the asyncHandler will forward it to error middleware
  });

  archive.pipe(res);

  const appendedFileIds: string[] = [];

  for (const file of files) {
    const downloadUrl = file.fileUrl || file.secureUrl;
    if (!downloadUrl) {
      console.warn("Skipping file without URL", file.id);
      continue;
    }

    try {
      const resp = await axios.get(downloadUrl, { responseType: "stream", timeout: 30000 });
      // Use original filename inside zip; fallback to id
      const entryName = file.fileName || `${file.id}`;
      archive.append(resp.data, { name: entryName });
      appendedFileIds.push(file.id);
    } catch (err: any) {
      console.warn(`Failed to fetch file ${file.id} (${downloadUrl}):`, err?.message || err);
      // skip this file
      continue;
    }
  }

  if (appendedFileIds.length === 0) {
    // No files were appended, abort and return a clear response
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ success: false, message: "Unable to fetch any files for download" }));
    return;
  }

  // Finalize archive and wait for the response to finish streaming
  await archive.finalize();

  // Wait for the response to finish sending
  await new Promise<void>((resolve, reject) => {
    res.on("close", () => resolve());
    res.on("finish", () => resolve());
    archive.on("error", (err) => reject(err));
  });

  try {
    await Promise.all(
      appendedFileIds.map((id) =>
        prisma.fileUpload.update({ where: { id }, data: { downloadCount: { increment: 1 } } })
      )
    );
  } catch (err) {
    console.warn("Failed to increment download counts:", err);
  }
});

// GET /article/:submissionId/pdf
export const viewArticlePdf = asyncHandler(
  async (req: Request, res: Response) => {
    const { submissionId } = req.params;

    if (!submissionId) {
      return res.status(400).json({ success: false, message: "Submission ID is required" });
    }

    // Find published submission by submissionId
    const submission = await prisma.submission.findFirst({
      where: {
        id: submissionId,
        status: "PUBLISHED",
      },
      include: {
        files: {
          where: {
            fileType: "MANUSCRIPT",
          },
        },
      },
    });

    if (!submission) {
      return res.status(404).json({ success: false, message: "Article not found or not published" });
    }

    const manuscriptFile = submission.files[0];
    if (!manuscriptFile) {
      return res.status(404).json({ success: false, message: "Manuscript file not available" });
    }

    // Increment download count for viewing
    await prisma.fileUpload.update({
      where: { id: manuscriptFile.id },
      data: { downloadCount: { increment: 1 } },
    });

    let viewUrl = manuscriptFile.fileUrl || manuscriptFile.secureUrl;
    if (!viewUrl) {
      return res.status(404).json({ success: false, message: "File URL not available" });
    }

    try {
      // Fetch file contents from viewUrl
      const fileResponse = await axios.get(viewUrl, { responseType: "stream", timeout: 30000 });

      // Set headers for inline viewing
      const fileName = manuscriptFile.fileName || manuscriptFile.id;
      const safeFileName = String(fileName).replace(/"/g, '\\"');
      res.setHeader("Content-Type", fileResponse.headers["content-type"] || "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${safeFileName}"`
      );
      if (fileResponse.headers["content-length"]) {
        res.setHeader("Content-Length", fileResponse.headers["content-length"]);
      }

      // Pipe file stream to response
      fileResponse.data.pipe(res);
    } catch (err: any) {
      console.error(`Failed to fetch file ${manuscriptFile.id} (${viewUrl}):`, err?.message || err);
      return res.status(500).json({ success: false, message: "Failed to view file" });
    }
  }
);


export const viewArticlePdfByPath = asyncHandler(async (req: Request, res: Response) => {
  const doiSlug = req.params.path || (req.params as any)[0];
  const doi = doiSlug?.replace('.pdf', '');

  if (!doi) {
    return res.status(400).json({ success: false, message: "DOI is required" });
  }

  // Find published submission by doiSlug
  const submission = await prisma.submission.findFirst({
    where: {
      doiSlug: doi,
      status: "PUBLISHED",
    },
    include: {
      files: {
        where: {
          fileType: "MANUSCRIPT",
        },
      },
    },
  });

  if (!submission) {
    return res.status(404).json({ success: false, message: "Article not found or not published" });
  }

  const manuscriptFile = submission.files[0];
  if (!manuscriptFile) {
    return res.status(404).json({ success: false, message: "Manuscript file not available" });
  }

  // Increment download count for viewing (as per requirements)
  await prisma.fileUpload.update({
    where: { id: manuscriptFile.id },
    data: { downloadCount: { increment: 1 } },
  });

  let viewUrl = manuscriptFile.fileUrl || manuscriptFile.secureUrl;
  if (!viewUrl) {
    return res.status(404).json({ success: false, message: "File URL not available" });
  }

  // Set headers for inline viewing
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "inline");

  // Redirect to URL for inline viewing
  return res.redirect(viewUrl);
});

export const getArticlePdfUrl = asyncHandler(async (req: Request, res: Response) => {
  const doiSlug = req.params[0];

  if (!doiSlug) {
    return res.status(400).json({ success: false, message: "DOI is required" });
  }

  // Find published submission by doiSlug
  const submission = await prisma.submission.findFirst({
    where: {
      doiSlug,
      status: "PUBLISHED",
    },
    include: {
      files: {
        where: {
          fileType: "MANUSCRIPT",
        },
      },
    },
  });

  if (!submission) {
    return res.status(404).json({ success: false, message: "Article not found or not published" });
  }

  const manuscriptFile = submission.files[0];
  if (!manuscriptFile) {
    return res.status(404).json({ success: false, message: "Manuscript file not available" });
  }

  // Increment download count for viewing
  await prisma.fileUpload.update({
    where: { id: manuscriptFile.id },
    data: { downloadCount: { increment: 1 } },
  });

  let viewUrl = manuscriptFile.fileUrl || manuscriptFile.secureUrl;
  if (!viewUrl) {
    return res.status(404).json({ success: false, message: "File URL not available" });
  }

  res.json({ url: viewUrl });
});

export const downloadArticlePdf = asyncHandler(async (req: Request, res: Response) => {
  const { doi } = req.params;
  const doiValue = doi || (req.params as any)[0];

  if (!doiValue) {
    return res.status(400).json({ success: false, message: "DOI is required" });
  }

  // Find published submission by doiSlug
  const submission = await prisma.submission.findFirst({
    where: {
      doiSlug: doiValue,
      status: "PUBLISHED",
    },
    include: {
      files: {
        where: {
          fileType: "MANUSCRIPT",
        },
      },
    },
  });

  if (!submission) {
    return res.status(404).json({ success: false, message: "Article not found or not published" });
  }

  const manuscriptFile = submission.files[0];
  if (!manuscriptFile) {
    return res.status(404).json({ success: false, message: "Manuscript file not available" });
  }

  // Increment download count
  await prisma.fileUpload.update({
    where: { id: manuscriptFile.id },
    data: { downloadCount: { increment: 1 } },
  });

  const downloadUrl = manuscriptFile.fileUrl || manuscriptFile.secureUrl;
  if (!downloadUrl) {
    return res.status(404).json({ success: false, message: "File URL not available" });
  }

  // Set headers for download
  const fileName = manuscriptFile.fileName || `${doi}.pdf`;
  const safeFileName = String(fileName).replace(/"/g, '\\"');
  const encodedFileName = encodeURIComponent(String(fileName));

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${safeFileName}"; filename*=UTF-8''${encodedFileName}`
  );

  // Redirect to download URL
  return res.redirect(downloadUrl);
});

