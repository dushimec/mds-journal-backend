-- Add views and downloads tracking to Submission model
ALTER TABLE "Submission" ADD COLUMN "views" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Submission" ADD COLUMN "downloads" INTEGER NOT NULL DEFAULT 0;
