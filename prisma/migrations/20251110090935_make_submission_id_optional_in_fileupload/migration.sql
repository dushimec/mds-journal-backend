-- DropForeignKey
ALTER TABLE "public"."FileUpload" DROP CONSTRAINT "FileUpload_submissionId_fkey";

-- AlterTable
ALTER TABLE "FileUpload" ALTER COLUMN "submissionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "FileUpload" ADD CONSTRAINT "FileUpload_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE SET NULL ON UPDATE CASCADE;
