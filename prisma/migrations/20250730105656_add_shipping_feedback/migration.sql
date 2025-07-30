-- CreateTable
CREATE TABLE "shipping_feedback" (
    "id" SERIAL NOT NULL,
    "userDimensions" JSONB NOT NULL,
    "calculationResult" JSONB,
    "feedbackTypes" JSONB NOT NULL,
    "customFeedback" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shipping_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "shipping_feedback_createdAt_idx" ON "shipping_feedback"("createdAt");
