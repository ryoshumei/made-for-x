-- CreateTable
CREATE TABLE "general_feedback" (
    "id" SERIAL NOT NULL,
    "feedbackTypes" JSONB NOT NULL,
    "toolFeedback" TEXT,
    "customFeedback" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "general_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "general_feedback_createdAt_idx" ON "general_feedback"("createdAt");

-- CreateIndex
CREATE INDEX "general_feedback_toolFeedback_idx" ON "general_feedback"("toolFeedback");
