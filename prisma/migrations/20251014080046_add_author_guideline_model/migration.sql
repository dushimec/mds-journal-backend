-- CreateEnum
CREATE TYPE "SubmissionManuscriptType" AS ENUM ('ORIGINAL_RESEARCH', 'POLICY_BRIEF', 'FIELD_CASE_REPORT', 'BOOK_REVIEW');

-- CreateEnum
CREATE TYPE "AuthorGuidelineType" AS ENUM ('PLAGIARISM_POLICY', 'AUTHOR_FEES', 'SUBMISSION_TYPES', 'PUBLICATION_SCHEDULE', 'ACCEPTABLE_TOPICS', 'FORMATTING_GUIDELINES', 'MANUSCRIPT_FORMAT', 'REQUIREMENTS', 'ETHICAL_STANDARDS');

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "manuscriptType" "SubmissionManuscriptType";

-- CreateTable
CREATE TABLE "AuthorGuideline" (
    "id" TEXT NOT NULL,
    "type" "AuthorGuidelineType" NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AuthorGuideline_pkey" PRIMARY KEY ("id")
);
