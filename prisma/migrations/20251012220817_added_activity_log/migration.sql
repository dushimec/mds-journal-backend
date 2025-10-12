-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
