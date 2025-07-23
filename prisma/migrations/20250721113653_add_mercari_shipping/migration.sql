-- CreateTable
CREATE TABLE "mercari_service_categories" (
    "id" SERIAL NOT NULL,
    "categoryName" TEXT NOT NULL,
    "categoryNameEn" TEXT,
    "underlyingCarrier" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mercari_service_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_services" (
    "id" SERIAL NOT NULL,
    "mercariCategoryId" INTEGER NOT NULL,
    "serviceName" TEXT NOT NULL,
    "serviceNameEn" TEXT,
    "sizeCategory" TEXT,
    "deliveryInfo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "description" TEXT,
    "referenceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipping_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_options" (
    "id" SERIAL NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "optionName" TEXT NOT NULL,
    "optionNameEn" TEXT,
    "totalPrice" INTEGER NOT NULL,
    "basePrice" INTEGER,
    "packagingPrice" INTEGER,
    "packagingName" TEXT,
    "packagingDetails" TEXT,
    "requiresSpecialPackaging" BOOLEAN NOT NULL DEFAULT false,
    "maxWeightKg" DECIMAL(5,2),
    "maxSizeCm" INTEGER,
    "maxLengthCm" DECIMAL(5,1),
    "maxWidthCm" DECIMAL(5,1),
    "maxHeightCm" DECIMAL(5,1),
    "maxThicknessCm" DECIMAL(3,1),
    "minLengthCm" DECIMAL(5,1),
    "minWidthCm" DECIMAL(5,1),
    "pickupRestrictions" JSONB,
    "status" TEXT NOT NULL DEFAULT 'active',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipping_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "size_tiers" (
    "id" SERIAL NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "tierName" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "maxWeightKg" DECIMAL(5,2),
    "maxSizeCm" INTEGER,
    "effectiveFrom" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveUntil" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "size_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mercari_service_categories_categoryName_key" ON "mercari_service_categories"("categoryName");

-- CreateIndex
CREATE INDEX "mercari_service_categories_categoryName_idx" ON "mercari_service_categories"("categoryName");

-- CreateIndex
CREATE INDEX "shipping_services_mercariCategoryId_idx" ON "shipping_services"("mercariCategoryId");

-- CreateIndex
CREATE INDEX "shipping_services_serviceName_idx" ON "shipping_services"("serviceName");

-- CreateIndex
CREATE INDEX "shipping_options_serviceId_idx" ON "shipping_options"("serviceId");

-- CreateIndex
CREATE INDEX "shipping_options_totalPrice_idx" ON "shipping_options"("totalPrice");

-- CreateIndex
CREATE INDEX "shipping_options_maxLengthCm_maxWidthCm_maxHeightCm_maxThic_idx" ON "shipping_options"("maxLengthCm", "maxWidthCm", "maxHeightCm", "maxThicknessCm");

-- CreateIndex
CREATE INDEX "shipping_options_maxSizeCm_idx" ON "shipping_options"("maxSizeCm");

-- CreateIndex
CREATE INDEX "shipping_options_maxWeightKg_idx" ON "shipping_options"("maxWeightKg");

-- CreateIndex
CREATE INDEX "shipping_options_sortOrder_idx" ON "shipping_options"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "shipping_options_serviceId_optionName_key" ON "shipping_options"("serviceId", "optionName");

-- CreateIndex
CREATE INDEX "size_tiers_serviceId_idx" ON "size_tiers"("serviceId");

-- CreateIndex
CREATE INDEX "size_tiers_maxSizeCm_maxWeightKg_idx" ON "size_tiers"("maxSizeCm", "maxWeightKg");

-- CreateIndex
CREATE INDEX "size_tiers_price_idx" ON "size_tiers"("price");

-- CreateIndex
CREATE UNIQUE INDEX "size_tiers_serviceId_tierName_effectiveFrom_key" ON "size_tiers"("serviceId", "tierName", "effectiveFrom");

-- AddForeignKey
ALTER TABLE "shipping_services" ADD CONSTRAINT "shipping_services_mercariCategoryId_fkey" FOREIGN KEY ("mercariCategoryId") REFERENCES "mercari_service_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_options" ADD CONSTRAINT "shipping_options_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "shipping_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "size_tiers" ADD CONSTRAINT "size_tiers_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "shipping_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
