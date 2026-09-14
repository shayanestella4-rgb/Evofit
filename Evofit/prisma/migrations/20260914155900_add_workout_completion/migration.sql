-- CreateTable
CREATE TABLE "workout_completions" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "workoutName" TEXT,
    "duration" INTEGER,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workout_completions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "workout_completions_email_idx" ON "workout_completions"("email");
