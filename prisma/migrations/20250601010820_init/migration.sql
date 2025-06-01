-- CreateTable
CREATE TABLE "WasteCollectionSchedule" (
    "id" SERIAL NOT NULL,
    "areaName" TEXT NOT NULL,
    "zipcode" TEXT NOT NULL,
    "addressDetail" TEXT,
    "burnableDay1" INTEGER NOT NULL,
    "burnableDay2" INTEGER NOT NULL,
    "burnableTime" TEXT NOT NULL,
    "nonBurnableWeekNumber" INTEGER,
    "nonBurnableDayOfWeek" INTEGER,
    "recyclableDay" INTEGER NOT NULL,
    "valuableDay" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WasteCollectionSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WasteCollectionSchedule_areaName_idx" ON "WasteCollectionSchedule"("areaName");

-- CreateIndex
CREATE INDEX "WasteCollectionSchedule_zipcode_idx" ON "WasteCollectionSchedule"("zipcode");

-- CreateIndex
CREATE INDEX "WasteCollectionSchedule_areaName_zipcode_idx" ON "WasteCollectionSchedule"("areaName", "zipcode");

-- CreateIndex
CREATE INDEX "WasteCollectionSchedule_burnableDay1_burnableDay2_idx" ON "WasteCollectionSchedule"("burnableDay1", "burnableDay2");

-- CreateIndex
CREATE INDEX "WasteCollectionSchedule_recyclableDay_idx" ON "WasteCollectionSchedule"("recyclableDay");
