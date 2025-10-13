/*
  Warnings:

  - You are about to drop the `Article` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Article" DROP CONSTRAINT "Article_issueId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Article" DROP CONSTRAINT "Article_topicId_fkey";

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "journalIssueId" TEXT;

-- DropTable
DROP TABLE "public"."Article";

-- CreateTable
CREATE TABLE "AuthorPage" (
    "id" TEXT NOT NULL DEFAULT 'author-page',
    "title" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthorPage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_journalIssueId_fkey" FOREIGN KEY ("journalIssueId") REFERENCES "JournalIssue"("id") ON DELETE SET NULL ON UPDATE CASCADE;
