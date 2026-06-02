-- Add dynamic content fields to AuthorPage
ALTER TABLE "AuthorPage" ADD COLUMN "submissionSteps" TEXT;
ALTER TABLE "AuthorPage" ADD COLUMN "articleTypes" TEXT;
ALTER TABLE "AuthorPage" ADD COLUMN "guidelines" TEXT;
