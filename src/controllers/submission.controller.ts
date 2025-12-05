import { Request, Response } from "express";
import { prisma } from "../config/database";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";
import cloudinary, { uploadBufferWithRetry } from "../utils/cloudinary";
import { SubmissionStatus, FileType, UserRole } from "@prisma/client";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { matchedData } from "express-validator";
import { sendSubmissionStatusEmail } from "../utils/email";

export class SubmissionController {
  static create = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body;

    if (!req.user) throw new AppError("User not authenticated", 401);

    const files = (req.files as Express.Multer.File[]) || [];

    const uploadedFiles: {
      fileName: string;
      fileUrl: string;
      secureUrl: string;
      mimeType: string;
      fileSize: number;
      fileType: "MANUSCRIPT";
      publicId: string;
    }[] = [];

    // Multipart/form-data often serializes JSON fields as strings. Try to parse authors and declarations
    // Accept both a JSON string, a single object, or an array.
    const parsedAuthorsRaw = data.authors ?? data.authorsJson ?? null;
    let parsedAuthors: any[] = [];
    if (parsedAuthorsRaw) {
      if (typeof parsedAuthorsRaw === "string") {
        try {
          const p = JSON.parse(parsedAuthorsRaw);
          parsedAuthors = Array.isArray(p) ? p : [p];
        } catch (e) {
          // Could be a comma-separated list or malformed JSON; leave as empty and log
          console.warn("Failed to parse authors JSON string", parsedAuthorsRaw);
        }
      } else if (Array.isArray(parsedAuthorsRaw)) {
        parsedAuthors = parsedAuthorsRaw;
      } else if (typeof parsedAuthorsRaw === "object") {
        parsedAuthors = [parsedAuthorsRaw];
      }
    }

    const parsedDeclarationsRaw =
      data.declarations ?? data.declarationsJson ?? null;
    let parsedDeclarations: any[] = [];
    if (parsedDeclarationsRaw) {
      if (typeof parsedDeclarationsRaw === "string") {
        try {
          const p = JSON.parse(parsedDeclarationsRaw);
          parsedDeclarations = Array.isArray(p) ? p : [p];
        } catch (e) {
          console.warn(
            "Failed to parse declarations JSON string",
            parsedDeclarationsRaw
          );
        }
      } else if (Array.isArray(parsedDeclarationsRaw)) {
        parsedDeclarations = parsedDeclarationsRaw;
      } else if (typeof parsedDeclarationsRaw === "object") {
        parsedDeclarations = [parsedDeclarationsRaw];
      }
    }

    for (const file of files) {
      try {
        const result = await uploadBufferWithRetry(
          file.buffer,
          { resource_type: "auto", folder: "submissions" },
          3
        );
        if (!result) throw new Error("Empty upload result");

        uploadedFiles.push({
          fileName: file.originalname,
          fileUrl: result.secure_url,
          secureUrl: result.secure_url,
          mimeType: file.mimetype,
          fileSize: file.size,
          fileType: FileType.MANUSCRIPT,
          publicId: result.public_id,
        });
      } catch (err: any) {
        console.error(
          "Cloudinary upload error for file",
          file.originalname,
          err
        );
        // Surface the underlying message but keep HTTP 500 for upload failures
        throw new AppError(
          `File upload failed: ${err?.message || String(err)}`,
          500
        );
      }
    }

    const submission = await prisma.submission.create({
      data: {
        manuscriptTitle: data.manuscriptTitle,
        abstract: data.abstract,
        keywords: data.keywords,
        status: SubmissionStatus.SUBMITTED,
        userId: req.user.userId,
        ...(parsedAuthors.length > 0 && {
          authors: {
            create: parsedAuthors.map((a: any, i: number) => ({
              fullName: a.fullName,
              email: a.email,
              affiliation: a.affiliation,
              isCorresponding: !!a.isCorresponding || i === 0,
              order: i + 1,
              userId: req.user?.userId,
            })),
          },
        }),
        ...(uploadedFiles.length > 0 && {
          files: { create: uploadedFiles },
        }),
        ...(parsedDeclarations.length > 0 && {
          declarations: {
            create: parsedDeclarations.map((d: any) => ({
              type: d.type,
              isChecked: !!d.isChecked,
              text: d.text,
            })),
          },
        }),
      },
      include: { authors: true, files: true, declarations: true },
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

    const submission = await prisma.submission.findUnique({
      where: { id: String(id) },
    });

    if (!submission) throw new AppError("Submission not found", 404);

    if (req.user?.role === UserRole.AUTHOR) {
      if (submission.userId !== req.user.userId)
        throw new AppError("Access denied", 403);
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
        const manuscriptTitle =
          updated.manuscriptTitle ?? "Untitled submission";
        await sendSubmissionStatusEmail(
          email,
          status,
          manuscriptTitle,
          updated.id,
          submissionLink
        );
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
    const submission = await prisma.submission.findUnique({
      where: { id: String(id) },
    });

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

    // Total downloads across all file uploads (safe for null return)
    const totalDownloadsAgg = await prisma.fileUpload.aggregate({
      _sum: {
        downloadCount: true,
      },
    });
    const totalDownloads = totalDownloadsAgg._sum?.downloadCount ?? 0;

    // Downloads grouped by submission (only include files tied to a submission)
    const downloadsBySubmission = await prisma.fileUpload.groupBy({
      by: ["submissionId"],
      where: { submissionId: { not: null } },
      _sum: { downloadCount: true },
      orderBy: { _sum: { downloadCount: "desc" } },
      take: 50,
    });

    // Top downloaded files (most useful for quick insights)
    const topFiles = await prisma.fileUpload.findMany({
      orderBy: { downloadCount: "desc" },
      take: 10,
      select: {
        id: true,
        fileName: true,
        submissionId: true,
        downloadCount: true,
        fileUrl: true,
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
        totalDownloads,
        downloadsBySubmission: downloadsBySubmission.map((d) => ({
          submissionId: d.submissionId,
          downloads: d._sum.downloadCount ?? 0,
        })),
        topFiles,
      },
    });
  });

  static updateEditedFile = asyncHandler(
    async (req: Request, res: Response) => {
      const { submissionId, fileId } = req.params;

      // must receive a file from multer
      const uploadedFile = req.file;
      if (!uploadedFile) throw new AppError("No file uploaded", 400);

      // check submission existence
      const submission = await prisma.submission.findUnique({
        where: { id: String(submissionId) },
      });

      if (!submission) throw new AppError("Submission not found", 404);

      // check file existence
      const oldFile = await prisma.fileUpload.findUnique({
        where: { id: String(fileId) },
      });

      if (!oldFile) throw new AppError("File not found", 404);

      // upload new file to Cloudinary
      // upload new file to Cloudinary
      let cloudResult: any = null;
      try {
        if (uploadedFile.buffer) {
          // Prefer buffer upload (memory storage)
          cloudResult = await uploadBufferWithRetry(
            uploadedFile.buffer,
            { resource_type: "auto", folder: "submissions" },
            3
          );
        } else if (uploadedFile.path) {
          // Fallback to path-based upload (disk storage)
          cloudResult = await cloudinary.uploader.upload(uploadedFile.path, {
            folder: "submissions",
            resource_type: "auto",
          });
        } else {
          throw new AppError("Uploaded file has no buffer or path", 400);
        }

        if (!cloudResult) throw new Error("Empty upload result");
      } catch (err: any) {
        console.error(
          "Cloudinary upload error for edited file",
          uploadedFile.originalname,
          err
        );
        throw new AppError(
          `File upload failed: ${err?.message || String(err)}`,
          500
        );
      }

      // update DB record (replace the old file completely)
      const updated = await prisma.fileUpload.update({
        where: { id: String(fileId) },
        data: {
          fileName: uploadedFile.originalname,
          fileUrl: cloudResult.secure_url ?? cloudResult.url,
          mimeType: uploadedFile.mimetype,
          fileSize: uploadedFile.size,
          isEdited: true,
          publicId: cloudResult.public_id ?? undefined,
        },
      });

      res.status(200).json({
        success: true,
        message: "File updated successfully",
        data: updated,
      });
    }
  );
}

function getPagination(
  req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>
): { skip: number; take: number; page: number } {
  const q = req.query || {};

  const rawPage = Array.isArray(q.page) ? q.page[0] : q.page;
  const rawPerPage = Array.isArray(q.perPage)
    ? q.perPage[0]
    : Array.isArray(q.limit)
      ? q.limit[0]
      : Array.isArray(q.take)
        ? q.take[0]
        : q.take;

  let page = parseInt(String(rawPage ?? "1"), 10);
  let take = parseInt(String(rawPerPage ?? "10"), 10);

  if (Number.isNaN(page) || page < 1) page = 1;
  if (Number.isNaN(take) || take < 1) take = 10;

  const skip = (page - 1) * take;

  return { skip, take, page };
}
