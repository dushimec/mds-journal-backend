-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "rejectedAt" TIMESTAMP(3),
ADD COLUMN     "reviewStartedAt" TIMESTAMP(3);
