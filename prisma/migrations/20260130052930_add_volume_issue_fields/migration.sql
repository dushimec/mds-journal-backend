/*
  Warnings:

  - A unique constraint covering the columns `[volume,issue]` on the table `JournalIssue` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `issue` to the `JournalIssue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `volume` to the `JournalIssue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "JournalIssue" ADD COLUMN     "issue" INTEGER NOT NULL,
ADD COLUMN     "volume" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "issue" INTEGER,
ADD COLUMN     "volume" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "JournalIssue_volume_issue_key" ON "JournalIssue"("volume", "issue");
