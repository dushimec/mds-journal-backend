/*
  Warnings:

  - You are about to drop the column `articleCount` on the `JournalIssue` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `JournalIssue` table. All the data in the column will be lost.
  - You are about to drop the column `downloads` on the `JournalIssue` table. All the data in the column will be lost.
  - You are about to drop the column `guestEditors` on the `JournalIssue` table. All the data in the column will be lost.
  - You are about to drop the column `isSpecial` on the `JournalIssue` table. All the data in the column will be lost.
  - You are about to drop the column `issueNumber` on the `JournalIssue` table. All the data in the column will be lost.
  - You are about to drop the column `month` on the `JournalIssue` table. All the data in the column will be lost.
  - You are about to drop the column `publishedAt` on the `JournalIssue` table. All the data in the column will be lost.
  - You are about to drop the column `specialTitle` on the `JournalIssue` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `JournalIssue` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[articleSlug]` on the table `Submission` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `JournalIssue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "JournalIssue" DROP COLUMN "articleCount",
DROP COLUMN "description",
DROP COLUMN "downloads",
DROP COLUMN "guestEditors",
DROP COLUMN "isSpecial",
DROP COLUMN "issueNumber",
DROP COLUMN "month",
DROP COLUMN "publishedAt",
DROP COLUMN "specialTitle",
DROP COLUMN "title",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "articleSlug" TEXT,
ADD COLUMN     "seoPdfName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Submission_articleSlug_key" ON "Submission"("articleSlug");
