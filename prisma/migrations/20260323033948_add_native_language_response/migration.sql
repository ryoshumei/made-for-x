-- CreateTable
CREATE TABLE "native_language_responses" (
    "id" SERIAL NOT NULL,
    "language" TEXT NOT NULL,
    "responseCount" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "native_language_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "native_language_responses_language_key" ON "native_language_responses"("language");
