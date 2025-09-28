-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "twoFactorCodeExpires" TIMESTAMP(3),
ADD COLUMN     "twoFactorSecret" TEXT;
