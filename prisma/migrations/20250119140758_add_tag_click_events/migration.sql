-- CreateTable
CREATE TABLE "tag_click_events" (
    "id" SERIAL NOT NULL,
    "tagId" TEXT NOT NULL,
    "pageContext" TEXT NOT NULL,
    "clickCount" INTEGER NOT NULL DEFAULT 1,
    "date" DATE NOT NULL DEFAULT CURRENT_DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tag_click_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tag_click_events_tagId_pageContext_date_key" ON "tag_click_events"("tagId", "pageContext", "date");

-- CreateIndex
CREATE INDEX "tag_click_events_tagId_idx" ON "tag_click_events"("tagId");

-- CreateIndex
CREATE INDEX "tag_click_events_pageContext_idx" ON "tag_click_events"("pageContext");

-- CreateIndex
CREATE INDEX "tag_click_events_date_idx" ON "tag_click_events"("date");
