import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { prisma } from "../config/database";
import archiver from "archiver";
import axios from "axios";
import { UserRole } from "@prisma/client";

export const downloadFile = asyncHandler(async (req: Request, res: Response) => {
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
    const fileResponse = await axios.get(downloadUrl, { responseType: "stream", timeout: 30000 });

    const fileName = file.fileName || file.id;
    const safeFileName = String(fileName).replace(/"/g, '\\"');
    const encodedFileName = encodeURIComponent(String(fileName));
    res.setHeader("Content-Type", fileResponse.headers["content-type"] || "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeFileName}"; filename*=UTF-8''${encodedFileName}`
    );
    if (fileResponse.headers["content-length"]) {
      res.setHeader("Content-Length", fileResponse.headers["content-length"]);
    }

    fileResponse.data.pipe(res);

    prisma.fileUpload
      .update({ where: { id: file.id }, data: { downloadCount: { increment: 1 } } })
      .catch((err) => console.warn("Failed to increment download count:", err));
  } catch (err: any) {
    console.error("Failed to fetch file " + file.id + " (" + downloadUrl + "):", err?.message || err);
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

    const fileResponse = await axios.get(downloadUrl, {
      responseType: "stream",
      timeout: 300000,
      maxRedirects: 10,
    });

    const baseName = file.fileName
      ? file.fileName.replace(/\.[^/.]+$/, "")
      : file.publicId
        ? file.publicId.split("/").pop() || "downloaded_file"
        : "downloaded_file";

    const originalExtension = file.fileName?.split(".").pop() || "bin";
    const originalName = baseName + "." + originalExtension;
    console.log("Streaming file with name:", originalName);

    const safeOriginalName = String(originalName).replace(/"/g, '\\"');
    const encodedOriginalName = encodeURIComponent(String(originalName));

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeOriginalName}"; filename*=UTF-8''${encodedOriginalName}`
    );

    res.setHeader("Content-Type", file.mimeType || "application/octet-stream");

    if (fileResponse.headers["content-length"]) {
      res.setHeader("Content-Length", fileResponse.headers["content-length"]);
    }

    fileResponse.data.pipe(res);
    console.log("File streaming started. Headers:", fileResponse.headers);

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

export const downloadSubmissionFiles = asyncHandler(async (req: Request, res: Response) => {
  const { submissionId } = req.params;
  const user = (req as any).user;
  if (!user) return res.status(401).json({ success: false, message: "Authentication required" });

  const submission = await prisma.submission.findUnique({ 
    where: { id: submissionId },
    include: { files: true }
  });
  if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });

  if (user.role === UserRole.AUTHOR && submission.userId !== user.userId) {
    return res.status(403).json({ success: false, message: "Access denied: not your submission" });
  }

  const files = submission.files || [];
  if (files.length === 0) return res.status(404).json({ success: false, message: "No files available for this submission" });

  const zipName = "submission-" + submissionId + "-files.zip";
  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", "attachment; filename=\"" + zipName + "\"");

  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.on("error", (err) => {
    console.error("Archive error:", err);
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
      const entryName = file.fileName || file.id;
      archive.append(resp.data, { name: entryName });
      appendedFileIds.push(file.id);
    } catch (err: any) {
      console.warn("Failed to fetch file " + file.id + " (" + downloadUrl + "):", err?.message || err);
      continue;
    }
  }

  if (appendedFileIds.length === 0) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ success: false, message: "Unable to fetch any files for download" }));
    return;
  }

  await archive.finalize();

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

// SEO-Optimized PDF Streaming with proper headers for crawlers
export const streamArticlePdf = asyncHandler(async (req: Request, res: Response) => {
  const { volume, issue } = req.params;
  const slug = req.params.slug.replace(/\.pdf$/, "");

  if (!volume || !issue || !slug) {
    return res.status(400).json({
      success: false,
      message: "Volume, issue, and slug are required"
    });
  }

  const submission = await prisma.submission.findFirst({
    where: {
      seoPdfName: slug,
      volume: parseInt(volume),
      issue: parseInt(issue),
      status: "PUBLISHED"
    },
    include: {
      files: {
        where: { fileType: "MANUSCRIPT" }
      },
      authors: true
    }
  });

  if (!submission || !submission.files.length) {
    return res.status(404).send("Article PDF not found");
  }

  const file = submission.files[0];

  // Set proper caching headers for production
  const cacheControl = process.env.NODE_ENV === "production" 
    ? "public, max-age=31536000, immutable" 
    : "no-cache";
  
  res.setHeader("Cache-Control", cacheControl);
  res.setHeader("Content-Type", file.mimeType || "application/pdf");
  
  // Safe filename for Content-Disposition
  const safeFileName = slug + ".pdf";
  res.setHeader("Content-Disposition", "inline; filename=\"" + safeFileName + "\"");
  
  if (file.fileSize) {
    res.setHeader("Content-Length", file.fileSize);
  }
  
  // Canonical link to landing page (critical for SEO)
  const canonicalUrl = "https://www.jaedp.org/vol" + volume + "/issue" + issue + "/" + slug;
  res.setHeader("Link", "<" + canonicalUrl + ">; rel=\"canonical\"");
  
  // Allow indexing but prefer landing page
  res.setHeader("X-Robots-Tag", "index, follow");
  
  // Add scholar metadata headers (for Google Scholar PDF indexing)
  if (submission.doiSlug) {
    res.setHeader("Citation-Title", submission.manuscriptTitle || "");
    res.setHeader("Citation-Authors", submission.authors.map(a => a.fullName).join(", "));
    if (submission.publishedAt) {
      const pubDate = new Date(submission.publishedAt).toISOString();
      res.setHeader("Citation-Publication-Date", pubDate.split("T")[0]);
    }
    res.setHeader("Citation-DOI", submission.doiSlug);
    res.setHeader("Citation-Journal-Title", "JAEDP");
  }
  
  // Set Accept-Ranges for byte-range requests
  res.setHeader("Accept-Ranges", "bytes");
  
  // Stream file from storage
  try {
    const viewUrl = file.secureUrl || file.fileUrl;
    if (!viewUrl) {
      return res.status(404).send("File URL not available");
    }
    
    const fileResponse = await axios.get(viewUrl, {
      responseType: "stream",
      timeout: 60000,
      validateStatus: (status) => status === 200 || status === 206
    });
    
    // Forward important headers from source
    if (fileResponse.headers["content-type"]) {
      res.setHeader("Content-Type", fileResponse.headers["content-type"]);
    }
    if (fileResponse.headers["content-length"]) {
      res.setHeader("Content-Length", fileResponse.headers["content-length"]);
    }
    
    fileResponse.data.pipe(res);
    
    // Increment download count (non-blocking)
    prisma.fileUpload.update({
      where: { id: file.id },
      data: { downloadCount: { increment: 1 } }
    }).catch(err => console.warn("Failed to increment download count:", err));
    
  } catch (error: any) {
    console.error("PDF stream error (" + file.id + "):", error?.message || error);
    return res.status(500).send("Failed to load PDF");
  }
});

// GET /article/:submissionId/pdf
export const viewArticlePdf = asyncHandler(
  async (req: Request, res: Response) => {
    const { volume, issue, slug } = req.params;

    if (!volume || !issue || !slug) {
      return res.status(400).json({
        success: false,
        message: "Volume, issue, and slug are required"
      });
    }

    const submission = await prisma.submission.findFirst({
      where: {
        articleSlug: slug,
        volume: parseInt(volume),
        issue: parseInt(issue),
        status: "PUBLISHED"
      },
      include: {
        files: {
          where: {
            fileType: "MANUSCRIPT"
          }
        }
      }
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Article not found or not published"
      });
    }

    const manuscriptFile = submission.files[0];

    if (!manuscriptFile) {
      return res.status(404).json({
        success: false,
        message: "Manuscript file not available"
      });
    }

    await prisma.fileUpload.update({
      where: { id: manuscriptFile.id },
      data: {
        downloadCount: {
          increment: 1
        }
      }
    });

    const viewUrl =
      manuscriptFile.secureUrl ||
      manuscriptFile.fileUrl;

    if (!viewUrl) {
      return res.status(404).json({
        success: false,
        message: "File URL not available"
      });
    }

    try {
      const fileResponse = await axios.get(viewUrl, {
        responseType: "stream",
        timeout: 30000
      });

      const fileName =
        submission.articleSlug || manuscriptFile.fileName;

      const safeFileName = fileName + ".pdf";

      res.setHeader(
        "Content-Type",
        fileResponse.headers["content-type"] || "application/pdf"
      );

      res.setHeader(
        "Content-Disposition",
        "inline; filename=\"" + safeFileName + "\""
      );

      if (fileResponse.headers["content-length"]) {
        res.setHeader(
          "Content-Length",
          fileResponse.headers["content-length"]
        );
      }

      res.setHeader("Cache-Control", "public, max-age=86400");

      fileResponse.data.pipe(res);

    } catch (error: any) {

      console.error(
        "PDF stream error (" + manuscriptFile.id + "):",
        error?.message || error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to load PDF"
      });
    }
  }
);


export const viewArticlePdfByPath = asyncHandler(async (req: Request, res: Response) => {
  const doiSlug = req.params.path || (req.params as any)[0];
  const doi = doiSlug?.replace('.pdf', '');

  if (!doi) {
    return res.status(400).json({ success: false, message: "DOI is required" });
  }

  const submission = await prisma.submission.findFirst({
    where: { doiSlug: doi, status: "PUBLISHED" },
    include: { files: true }
  });

  if (!submission) {
    return res.status(404).json({ success: false, message: "Article not found" });
  }

  const manuscriptFile = submission.files.find(
    (f) => f.fileType === "MANUSCRIPT"
  );

  if (!manuscriptFile) {
    return res.status(404).json({ success: false, message: "Manuscript file not found" });
  }

  const viewUrl = manuscriptFile.secureUrl || manuscriptFile.fileUrl;

  if (!viewUrl) {
    return res.status(404).json({ success: false, message: "File URL not available" });
  }

  try {
    const fileResponse = await axios.get(viewUrl, {
      responseType: "stream",
      timeout: 60000
    });

    const fileName = manuscriptFile.fileName || doi + ".pdf";
    const safeFileName = fileName.replace(/"/g, '');
    const encodedFileName = encodeURIComponent(fileName);

    res.setHeader(
      "Content-Type",
      fileResponse.headers["content-type"] || "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=\"" + safeFileName + "\"; filename*=UTF-8''" + encodedFileName
    );

    if (fileResponse.headers["content-length"]) {
      res.setHeader("Content-Length", fileResponse.headers["content-length"]);
    }

    fileResponse.data.pipe(res);

  } catch (error: any) {
    console.error("PDF fetch failed:", error?.message || error);
    res.status(500).json({ success: false, message: "Failed to retrieve PDF" });
  }
});

export const getArticlePdfUrl = asyncHandler(async (req: Request, res: Response) => {
  const { doiSlug } = req.params;

  if (!doiSlug) {
    return res.status(400).json({ success: false, message: "DOI slug is required" });
  }

  const submission = await prisma.submission.findFirst({
    where: { doiSlug, status: "PUBLISHED" },
    include: { files: true }
  });

  if (!submission) {
    return res.status(404).json({ success: false, message: "Article not found" });
  }

  const manuscriptFile = submission.files.find(
    (f) => f.fileType === "MANUSCRIPT"
  );

  if (!manuscriptFile) {
    return res.status(404).json({ success: false, message: "Manuscript file not found" });
  }

  let viewUrl = manuscriptFile.secureUrl;
  if (!viewUrl && manuscriptFile.publicId) {
    try {
      const cloudinary = (await import("../utils/cloudinary")).default;
      viewUrl = cloudinary.url(manuscriptFile.publicId, {
        resource_type: "raw",
        type: "upload",
        secure: true,
        flags: "attachment",
        format: "pdf"
      });
    } catch (e) {
      console.error("Cloudinary URL generation failed:", e);
    }
  }

  if (!viewUrl) {
    return res.status(404).json({ success: false, message: "Unable to generate PDF URL" });
  }

  res.json({
    success: true,
    data: {
      url: viewUrl,
      fileName: manuscriptFile.fileName,
      mimeType: manuscriptFile.mimeType
    }
  });
});
