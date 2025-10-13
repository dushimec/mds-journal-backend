-- DropForeignKey
ALTER TABLE "public"."Author" DROP CONSTRAINT "Author_submissionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Declaration" DROP CONSTRAINT "Declaration_submissionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FileUpload" DROP CONSTRAINT "FileUpload_submissionId_fkey";

-- AddForeignKey
ALTER TABLE "Author" ADD CONSTRAINT "Author_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileUpload" ADD CONSTRAINT "FileUpload_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Declaration" ADD CONSTRAINT "Declaration_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
