/*
  Warnings:

  - A unique constraint covering the columns `[doiSlug]` on the table `Submission` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "doiSlug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Submission_doiSlug_key" ON "Submission"("doiSlug");
