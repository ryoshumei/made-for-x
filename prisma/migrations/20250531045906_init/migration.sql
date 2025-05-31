-- CreateTable
CREATE TABLE "GarbageArea" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "areaName" TEXT NOT NULL,
    "burnableDays" TEXT NOT NULL,
    "burnableTime" TEXT NOT NULL,
    "nonBurnableWeek" TEXT NOT NULL,
    "recyclableDay" TEXT NOT NULL,
    "valuableDay" TEXT NOT NULL,
    "addressDetail" TEXT,
    "zipcode" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "GarbageArea_areaName_idx" ON "GarbageArea"("areaName");

-- CreateIndex
CREATE INDEX "GarbageArea_zipcode_idx" ON "GarbageArea"("zipcode");

-- CreateIndex
CREATE INDEX "GarbageArea_areaName_zipcode_idx" ON "GarbageArea"("areaName", "zipcode");
