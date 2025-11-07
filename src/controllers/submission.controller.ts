import { Request, Response } from "express";
import { matchedData } from "express-validator";
import { prisma } from "../config/database";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";
import { UserRole, SubmissionStatus } from "@prisma/client";
import axios from "axios";
import { sendSubmissionStatusEmail } from "../utils/email";
import archiver from "archiver";

const getPagination = (req: Request) => {
  const page = Math.max(1, parseInt((matchedData(req) as any).page) || 1);
  const limit = Math.min(100, parseInt((matchedData(req) as any).limit) || 10);
  return { skip: (page - 1) * limit, take: limit, page };
};

export class SubmissionController {
  // File upload (single)
 static uploadFile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError("No file uploaded", 400);
    }
    console.log("Uploaded file info:", req.file);
    const fileUrl = (req.file as any).path || (req.file as any).filename || "";

    if (!fileUrl) {
      throw new AppError("Failed to get uploaded file URL from Cloudinary", 500);
    }

    res.status(201).json({
      success: true,
      file: {
        fileName: req.file.originalname,
        fileUrl,                           
        fileType: req.file.mimetype,
        fileSize: req.file.size, 
      },
    });
  });

  // File upload (multiple)
static uploadFiles = asyncHandler(async (req: Request, res: Response) => {
  if (!req.files || !(req.files as any[]).length) {
    throw new AppError("No files uploaded", 400);
  }

  const uploadedFiles = (req.files as any[]).map((file) => {
    const fileUrl = file.path || file.filename;
    if (!fileUrl) {
      throw new AppError(`Failed to get URL for file ${file.originalname}`, 500);
    }

    return {
      fileName: file.originalname,
      fileUrl,
      fileType: file.mimetype,
      fileSize: file.size,
    };
  });

  console.log("Uploaded files info:", uploadedFiles);

  res.status(201).json({
    success: true,
    files: uploadedFiles,
  });
});


static create = asyncHandler(async (req: Request, res: Response) => {
 

  const data = matchedData(req);
  if (Array.isArray(data.keywords) && data.keywords.length > 5) {
    throw new AppError("You can only add up to 5 keywords.", 400);
  }

  const submission = await prisma.submission.create({
    data: {
      manuscriptTitle: data.manuscriptTitle,
      abstract: data.abstract,
      topicId: data.topicId,
      keywords: data.keywords,
      status: SubmissionStatus.DRAFT,
      userId: req.user?.userId ?? null,
      submittedAt: new Date(),

      authors: {
        create: data.authors.map((a: any) => ({
          fullName: a.fullName,
          email: a.email,
          affiliation: a.affiliation,
          isCorresponding: a.isCorresponding,
          order: a.order,
          userId: req.user?.userId ?? null,
        })),
      },

      files: {
        create: data.files.map((f: any) => ({
          fileName: f.fileName,
          fileType: f.fileType,
          fileUrl: f.fileUrl,
          mimeType: f.mimeType,
          fileSize: f.fileSize,
        })),
      },

      declarations: {
        create: data.declarations.map((d: any) => ({
          type: d.type,
          isChecked: d.isChecked,
          text: d.text,
        })),
      },
    },
    include: {
      authors: true,
      files: true,
      declarations: true,
    },
  });

  res.status(201).json({ success: true, data: submission });
});



  static getAll = asyncHandler(async (req: Request, res: Response) => {

    const { skip, take, page } = getPagination(req);
    const total = await prisma.submission.count();

    const submissions = await prisma.submission.findMany({
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        authors: true,
        files: true,
        declarations: true,
        user: { select: { firstName: true, lastName: true, email: true } },
        topic: true,
      },
    });

    res.json({
      success: true,
      data: submissions,
      meta: { total, page, lastPage: Math.ceil(total / take), perPage: take },
    });
  });


  static getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const submission = await prisma.submission.findUnique({
      where: { id: String(id) },
      include: {
        authors: true,
        files: true,
        declarations: true,
        user: { select: { firstName: true, lastName: true, email: true } },
        topic: true,
      },
    });

    if (!submission) throw new AppError("Submission not found", 404);



    res.json({ success: true, data: submission });
  });


  static update = asyncHandler(async (req: Request, res: Response) => {
    const { topicId, ...data } = matchedData(req);
    const { id } = req.params;

    const submission = await prisma.submission.findUnique({ where: { id: String(id) } });

    if (!submission) throw new AppError("Submission not found", 404);

    if (req.user?.role === UserRole.AUTHOR) {
      if (submission.userId !== req.user.userId) throw new AppError("Access denied", 403);
      if (submission.status !== SubmissionStatus.DRAFT) {
        throw new AppError("Only draft submissions can be edited", 400);
      }
    }

    const updated = await prisma.submission.update({
      where: { id: String(id) },
      data: { ...data, topic: { connect: { id: topicId } } },
      include: { authors: true, files: true, declarations: true },
    });

    res.json({ success: true, data: updated });
  });

static updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = matchedData(req) as { status: SubmissionStatus };

  const submission = await prisma.submission.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!submission) throw new AppError("Submission not found", 404);

  const role = req.user?.role;
  const userId = req.user?.userId;

 
  switch (role) {
    case UserRole.AUTHOR:
      if (submission.userId !== userId)
        throw new AppError("Access denied: not your submission", 403);

      const allowedForAuthor: SubmissionStatus[] = [
        SubmissionStatus.DRAFT,
        SubmissionStatus.SUBMITTED,
      ];

      if (!allowedForAuthor.includes(status)) {
        throw new AppError(
          "Authors can only change status to DRAFT or SUBMITTED",
          400
        );
      }
      break;

    case UserRole.EDITOR:
    case UserRole.REVIEWER:
    case UserRole.ADMIN:
      break;

    default:
      throw new AppError("Not authorized to change submission status", 403);
  }

  const now = new Date();
  const data: Record<string, any> = { status, updatedAt: now };

  switch (status) {
    case SubmissionStatus.SUBMITTED:
      data.submittedAt = now;
      break;

    case SubmissionStatus.UNDER_REVIEW:
      data.reviewStartedAt = now;
      break;

    case SubmissionStatus.PUBLISHED:
      data.publishedAt = now;
      break;

    case SubmissionStatus.REJECTED:
      data.rejectedAt = now;
      break;
  }

  const updated = await prisma.submission.update({
    where: { id },
    data,
    include: {
      authors: true,
      files: true,
      declarations: true,
      topic: true,
      user: { select: { firstName: true, lastName: true, email: true } },
    },
  });

  await prisma.activityLog.create({
    data: {
      action: "UPDATE_SUBMISSION_STATUS",
      details: {
        submissionId: id,
        oldStatus: submission.status,
        newStatus: status,
      },
      userId: userId!,
      timestamp: now,
    },
  });

  try {
    const email = updated.user?.email;
    if (email) {
      const frontend = process.env.FRONTEND_URL || process.env.APP_URL || "";
      const submissionLink = `${frontend}/submissions/${updated.id}`;
      const manuscriptTitle = updated.manuscriptTitle ?? "Untitled submission";
      await sendSubmissionStatusEmail(email, status, manuscriptTitle, updated.id, submissionLink);
    }
  } catch (err) {
    console.error("Failed to send submission status email:", err);
  }

  return res.status(200).json({
    success: true,
    message: `Submission status updated to ${status}`,
    data: updated,
  });
});

  static delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = matchedData(req);
    const submission = await prisma.submission.findUnique({ where: { id: String(id) } });

    if (!submission) throw new AppError("Submission not found", 404);

    await prisma.submission.delete({ where: { id: String(id) } });
    res.json({ success: true, message: "Submission deleted" });
  });


  static stats = asyncHandler(async (req: Request, res: Response) => {
    const total = await prisma.submission.count();
    const byStatus = await prisma.submission.groupBy({
      by: ["status"],
      _count: true,
    });
    const totalDownloads = await prisma.fileUpload.aggregate({
      _sum: {
        downloadCount: true,
      },
    });

    res.json({
      success: true,
      data: {
        total,
        byStatus: byStatus.map(({ status, _count }) => ({
          status,
          count: _count,
        })),
        totalDownloads: totalDownloads._sum.downloadCount || 0,
      },
    });
  });

static downloadFile = asyncHandler(async (req: Request, res: Response) => {
    const { fileId, filesId, submissionId } = req.params;

    if (!submissionId) throw new AppError("Submission ID is required", 400);

    // Ensure the submission exists
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { files: true },
    });

    if (!submission) throw new AppError("Submission not found", 404);

    // SINGLE FILE DOWNLOAD
    if (fileId) {
      const file = submission.files.find((f) => f.id === fileId);
      if (!file) throw new AppError("File not found in this submission", 404);

      await prisma.fileUpload.update({
        where: { id: fileId },
        data: { downloadCount: { increment: 1 } },
      });

      try {
        const response = await axios.get(file.fileUrl, {
          responseType: "stream",
          validateStatus: (s) => s >= 200 && s < 300,
          timeout: 15000,
        });

        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${file.fileName}"`
        );
        res.setHeader(
          "Content-Type",
          response.headers["content-type"] || "application/octet-stream"
        );

        response.data.pipe(res);
      } catch (err: any) {
        console.error("Download error:", err?.message);
        throw new AppError(
          `Failed to fetch remote file: ${err.message}`,
          err.response?.status || 502
        );
      }
      return;
    }

    // MULTIPLE FILE DOWNLOAD
    if (filesId) {
      const ids = filesId.split(",").map((id) => id.trim());
      const files = submission.files.filter((f) => ids.includes(f.id));

      if (!files.length)
        throw new AppError("No valid files found for this submission", 404);

      // Create a ZIP archive
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="submission-${submissionId}-files.zip"`
      );
      res.setHeader("Content-Type", "application/zip");

      const archive = archiver("zip", { zlib: { level: 9 } });
      archive.pipe(res);

      for (const file of files) {
        try {
          const response = await axios.get(file.fileUrl, { responseType: "stream" });
          archive.append(response.data, { name: file.fileName });

          await prisma.fileUpload.update({
            where: { id: file.id },
            data: { downloadCount: { increment: 1 } },
          });
        } catch (err: any) {
          console.warn(`Failed to fetch file ${file.fileName}:`, err?.message);
        }
      }

      await archive.finalize();
      return;
    }

    throw new AppError("Either fileId or filesId is required", 400);
  });
}
