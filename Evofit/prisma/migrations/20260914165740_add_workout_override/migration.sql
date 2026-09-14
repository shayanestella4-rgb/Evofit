-- CreateTable
CREATE TABLE "user_workout_overrides" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "dayIdx" INTEGER NOT NULL,
    "exerciseIds" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_workout_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_workout_overrides_email_dayIdx_key" ON "user_workout_overrides"("email", "dayIdx");
