import { Request, Response } from "express";
import { matchedData } from "express-validator";
import { prisma } from "../config/database";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";
import { UserRole, SubmissionStatus } from "@prisma/client";
import axios from "axios";
import { sendSubmissionStatusEmail } from "../utils/email";
import JSZip from "jszip";
import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const getPagination = (req: Request) => {
  const page = Math.max(1, parseInt((matchedData(req) as any).page) || 1);
  const limit = Math.min(100, parseInt((matchedData(req) as any).limit) || 10);
  return { skip: (page - 1) * limit, take: limit, page };
};

export class SubmissionController {


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
    const { submissionId } = req.params;
    const { fileId, files } = req.query as { fileId?: string; files?: string };

    if (!submissionId) throw new AppError("Submission ID is required", 400);

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { files: true },
    });

    if (!submission) throw new AppError("Submission not found", 404);

const getSignedUrl = (fileUrl: string) => {
try {
    // Regex to extract everything after /upload/
    const match = fileUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.(\w+)$/);

    if (!match) return null;

    const publicId = match[1]; // folder/file_name
    const format = match[2];   // file extension

    return cloudinary.url(publicId, {
      resource_type: "auto",
      format,
      sign_url: true,
      secure: true,
    });

  } catch (err) {
    console.error("❌ Cloudinary URL parse failed:", err);
    return null;
  }
};


    if (fileId) {
      const file = submission.files.find((f) => f.id === fileId);
      if (!file) throw new AppError("File not found", 404);

      const signedUrl = getSignedUrl(file.fileUrl);
      if (!signedUrl) {
        return res.status(404).json({
          success: false,
          message: `File "${file.fileName}" not found on Cloudinary.`,
        });
      }

      await prisma.fileUpload.update({
        where: { id: file.id },
        data: { downloadCount: { increment: 1 } },
      });

      return res.status(200).json({
        success: true,
        message: "File ready for download",
        fileUrl: signedUrl,
      });
    }

    // --- Multiple files download ---
    if (files) {
      const ids = files.split(",").map((id) => id.trim()).filter(Boolean);
      const selectedFiles = submission.files.filter((f) => ids.includes(f.id));

      if (!selectedFiles.length) throw new AppError("No valid files found", 404);

      const zip = new JSZip();
      const skippedFiles: string[] = [];
      let addedCount = 0;

      for (const f of selectedFiles) {
        const signedUrl = getSignedUrl(f.fileUrl);
        if (!signedUrl) {
          skippedFiles.push(f.fileName);
          continue;
        }

        try {
          const fileResp = await axios.get(signedUrl, { responseType: "arraybuffer" });
          zip.file(f.fileName, fileResp.data);

          await prisma.fileUpload.update({
            where: { id: f.id },
            data: { downloadCount: { increment: 1 } },
          });

          addedCount++;
        } catch (err: any) {
          console.error(`❌ Failed to fetch ${f.fileName}: ${err.message}`);
          skippedFiles.push(f.fileName);
        }
      }

      if (addedCount === 0) {
        return res.status(404).json({
          success: false,
          message: "None of the selected files could be downloaded.",
          skippedFiles,
        });
      }

      const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=submission_${submissionId}.zip`
      );
      res.setHeader("Content-Type", "application/zip");
      return res.send(zipBuffer);
    }

    throw new AppError("Provide ?fileId=... or ?files=id1,id2", 400);
  });
  static updateEditedFile = asyncHandler(async (req: Request, res: Response) => {
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
  const cloud = await cloudinary.uploader.upload(uploadedFile.path, {
    folder: "journal_files",
    resource_type: "auto",
  });

  // update DB record (replace the old file completely)
  const updated = await prisma.fileUpload.update({
    where: { id: String(fileId) },
    data: {
      fileName: uploadedFile.originalname,
      fileUrl: cloud.secure_url,
      mimeType: uploadedFile.mimetype,
      fileSize: uploadedFile.size,
      isEdited: true,
    },
  });

  res.status(200).json({
    success: true,
    message: "File updated successfully",
    data: updated,
  });
});
}

