/*
  Warnings:

  - You are about to drop the column `userId` on the `NewsletterSubscriber` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."NewsletterSubscriber" DROP CONSTRAINT "NewsletterSubscriber_userId_fkey";

-- AlterTable
ALTER TABLE "NewsletterSubscriber" DROP COLUMN "userId";
