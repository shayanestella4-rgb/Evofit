-- CreateTable
CREATE TABLE "progress_photos" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "progress_photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "progress_photos_email_idx" ON "progress_photos"("email");
