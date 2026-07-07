/*
  Warnings:

  - You are about to drop the `WasteCollectionSchedule` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "WasteCollectionSchedule";

-- CreateTable
CREATE TABLE "waste_cities" (
    "id" SERIAL NOT NULL,
    "cityCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "prefecture" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "waste_cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waste_areas" (
    "id" SERIAL NOT NULL,
    "cityId" INTEGER NOT NULL,
    "areaName" TEXT NOT NULL,
    "addressDetail" TEXT,
    "searchText" TEXT NOT NULL,
    "schedules" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "waste_areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waste_postal_codes" (
    "id" SERIAL NOT NULL,
    "zipcode" TEXT NOT NULL,
    "cityId" INTEGER NOT NULL,
    "townName" TEXT NOT NULL,

    CONSTRAINT "waste_postal_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "waste_cities_cityCode_key" ON "waste_cities"("cityCode");

-- CreateIndex
CREATE INDEX "waste_cities_prefecture_idx" ON "waste_cities"("prefecture");

-- CreateIndex
CREATE INDEX "waste_areas_cityId_idx" ON "waste_areas"("cityId");

-- CreateIndex
CREATE INDEX "waste_postal_codes_zipcode_idx" ON "waste_postal_codes"("zipcode");

-- CreateIndex
CREATE INDEX "waste_postal_codes_cityId_idx" ON "waste_postal_codes"("cityId");

-- AddForeignKey
ALTER TABLE "waste_areas" ADD CONSTRAINT "waste_areas_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "waste_cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waste_postal_codes" ADD CONSTRAINT "waste_postal_codes_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "waste_cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
