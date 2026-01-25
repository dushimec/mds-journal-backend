import { Request, Response } from "express";
import { prisma } from "../config/database";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";
import { SubmissionStatus, FileType, UserRole, Prisma } from "@prisma/client";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { matchedData } from "express-validator";
import { sendSubmissionStatusEmail } from "../utils/email";
import { assignDoiToSubmission } from "../utils/doi";
import { uploadToR2 } from "../utils/r2Upload";

export class SubmissionController {
 static create = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("User not authenticated", 401);

  const data = req.body;
  const files = (req.files as Express.Multer.File[]) || [];

  if (!files.length) {
    throw new AppError("PDF manuscript is required", 400);
  }

  const uploadedFiles = [];

  try {
    for (const file of files) {
      const key = `submissions/temp/${file.originalname}`;

      const publicUrl = await uploadToR2({
        buffer: file.buffer,
        key,
        contentType: file.mimetype
      });

      uploadedFiles.push({
        fileName: file.originalname,
        fileUrl: publicUrl,
        mimeType: file.mimetype,
        fileSize: file.size,
        fileType: FileType.MANUSCRIPT,
        publicId: key,
      });
    }
  } catch (error: any) {
    console.error("R2 Upload Error:", error);
    throw new AppError(`File upload failed: ${error?.message || "Unknown error"}`, 500);
  }

  try {
    const submission = await prisma.submission.create({
      data: {
        manuscriptTitle: data.manuscriptTitle,
        abstract: data.abstract,
        keywords: data.keywords,
        status: SubmissionStatus.SUBMITTED,
        user: { connect: { id: req.user.userId } },
        files: { create: uploadedFiles },
      },
      include: { files: true },
    });

    res.status(201).json({
      success: true,
      data: submission,
    });
  } catch (error: any) {
    console.error("Database Error:", error);
    throw new AppError(`Failed to create submission: ${error?.message || "Unknown error"}`, 500);
  }
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

    // If a topicId was provided, attempt to connect by id, then by name; otherwise create it.
    let topicDataForUpdate: { connect?: { id: string }; create?: { name: string } } | undefined = undefined;
    if (topicId) {
      const tStr = String(topicId);
      let existingById = null as any;
      try {
        existingById = await prisma.topic.findUnique({ where: { id: tStr } });
      } catch (e) {
        existingById = null;
      }

      if (existingById) {
        topicDataForUpdate = { connect: { id: existingById.id } };
      } else {
        let existingByName = null as any;
        try {
          existingByName = await prisma.topic.findUnique({ where: { name: tStr } });
        } catch (e) {
          existingByName = null;
        }

        if (existingByName) {
          topicDataForUpdate = { connect: { id: existingByName.id } };
        } else {
          topicDataForUpdate = { create: { name: tStr } };
        }
      }
    }

    const updated = await prisma.submission.update({
      where: { id: String(id) },
      data: { ...data, ...(topicDataForUpdate && { topic: topicDataForUpdate }) },
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
        // Generate and assign DOI when publishing
        try {
          const doiSlug = await assignDoiToSubmission(id);
          data.doiSlug = doiSlug;
        } catch (error) {
          console.error("Failed to assign DOI:", error);
          // Continue without DOI for now - could be handled manually later
        }
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

 static updateEditedFile = asyncHandler(async (req: Request, res: Response) => {
 const { submissionId, fileId } = req.params;
 const file = req.file;

 if (!file) throw new AppError("No file uploaded", 400);

 const key = `submissions/${submissionId}/edited-${fileId}.pdf`;

 const publicUrl = await uploadToR2({
   buffer: file.buffer,
   key,
   contentType: file.mimetype
 });

 const updatedFile = await prisma.fileUpload.update({
   where: { id: fileId },
   data: {
     fileName: file.originalname,
     fileUrl: publicUrl,
     mimeType: file.mimetype,
     fileSize: file.size,
     isEdited: true,
     publicId: key,
   },
 });

 res.status(200).json({
   success: true,
   message: "File updated successfully",
   data: updatedFile,
 });
});
  
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


