import { PrismaClient } from '@prisma/client';
import {
  ShippingDimensions,
  ShippingOption,
  ShippingGroup,
  ShippingResult,
  CalculationInput,
} from './types';

/**
 * Fetches fixed price shipping options based on dimensions
 * @param dimensions - The shipping dimensions
 * @param prisma - Prisma client instance
 * @returns Array of fixed shipping options
 */
export async function getFixedPriceOptions(
  dimensions: ShippingDimensions,
  prisma: PrismaClient
): Promise<ShippingOption[]> {
  const { length, width, height } = dimensions;

  const fixedOptions = await prisma.shippingOption.findMany({
    where: {
      status: 'active',
      service: {
        status: 'active',
        mercariCategory: {
          status: 'active',
        },
      },
      // Size filter conditions
      AND: [
        {
          OR: [{ maxLengthCm: null }, { maxLengthCm: { gte: length } }],
        },
        {
          OR: [{ maxWidthCm: null }, { maxWidthCm: { gte: width } }],
        },
        {
          OR: [{ maxHeightCm: null }, { maxHeightCm: { gte: height } }],
        },
        {
          OR: [{ maxThicknessCm: null }, { maxThicknessCm: { gte: height } }],
        },
        {
          OR: [{ maxSizeCm: null }, { maxSizeCm: { gte: length + width + height } }],
        },
        {
          OR: [{ minLengthCm: null }, { minLengthCm: { lte: length } }],
        },
        {
          OR: [{ minWidthCm: null }, { minWidthCm: { lte: width } }],
        },
      ],
    },
    include: {
      service: {
        include: {
          mercariCategory: true,
        },
      },
    },
    orderBy: [
      { service: { mercariCategory: { categoryName: 'asc' } } },
      { totalPrice: 'asc' },
      { sortOrder: 'asc' },
    ],
  });

  return fixedOptions.map((option) => ({
    id: option.id,
    categoryName: option.service.mercariCategory.categoryName,
    serviceName: option.service.serviceName,
    optionName: option.optionName,
    totalPrice: option.totalPrice,
    basePrice: option.basePrice,
    packagingPrice: option.packagingPrice,
    packagingName: option.packagingName,
    packagingDetails: option.packagingDetails,
    requiresSpecialPackaging: option.requiresSpecialPackaging,
    maxWeightKg: option.maxWeightKg ? Number(option.maxWeightKg) : null,
    maxSizeCm: option.maxSizeCm,
    maxLengthCm: option.maxLengthCm ? Number(option.maxLengthCm) : null,
    maxWidthCm: option.maxWidthCm ? Number(option.maxWidthCm) : null,
    maxHeightCm: option.maxHeightCm ? Number(option.maxHeightCm) : null,
    maxThicknessCm: option.maxThicknessCm ? Number(option.maxThicknessCm) : null,
    minLengthCm: option.minLengthCm ? Number(option.minLengthCm) : null,
    minWidthCm: option.minWidthCm ? Number(option.minWidthCm) : null,
    deliveryInfo: null,
    pickupRestrictions: option.pickupRestrictions,
    priceType: 'fixed',
    sizeTierName: null,
  }));
}

/**
 * Fetches tiered price shipping options based on dimensions
 * @param dimensions - The shipping dimensions
 * @param prisma - Prisma client instance
 * @returns Array of tiered shipping options
 */
export async function getTieredPriceOptions(
  dimensions: ShippingDimensions,
  prisma: PrismaClient
): Promise<ShippingOption[]> {
  const { length, width, height } = dimensions;
  const sizeSum = length + width + height;

  const sizeTiers = await prisma.sizeTier.findMany({
    where: {
      service: {
        status: 'active',
        mercariCategory: {
          status: 'active',
        },
      },
      // Size filter: 3-side sum <= maxSizeCm
      OR: [{ maxSizeCm: null }, { maxSizeCm: { gte: sizeSum } }],
      // Validity period filter
      AND: [
        {
          OR: [{ effectiveUntil: null }, { effectiveUntil: { gte: new Date() } }],
        },
      ],
    },
    include: {
      service: {
        include: {
          mercariCategory: true,
        },
      },
    },
    orderBy: [{ service: { mercariCategory: { categoryName: 'asc' } } }, { price: 'asc' }],
  });

  return sizeTiers.map((tier) => ({
    id: tier.id + 10000, // Avoid ID conflicts
    categoryName: tier.service.mercariCategory.categoryName,
    serviceName: tier.service.serviceName,
    optionName: `${tier.service.serviceName} (${tier.tierName})`,
    totalPrice: tier.price,
    basePrice: tier.price,
    packagingPrice: 0,
    packagingName: null,
    packagingDetails: null,
    requiresSpecialPackaging: false,
    maxWeightKg: tier.maxWeightKg ? Number(tier.maxWeightKg) : null,
    maxSizeCm: tier.maxSizeCm,
    maxLengthCm: null,
    maxWidthCm: null,
    maxHeightCm: null,
    maxThicknessCm: null,
    minLengthCm: null,
    minWidthCm: null,
    deliveryInfo: null,
    pickupRestrictions: null,
    priceType: 'tiered',
    sizeTierName: tier.tierName,
  }));
}

/**
 * Groups shipping options by service category
 * @param options - Array of shipping options
 * @returns Array of shipping groups
 */
export function groupShippingOptions(options: ShippingOption[]): ShippingGroup[] {
  const rakurakuOptions = options
    .filter((opt) => opt.categoryName === 'らくらくメルカリ便')
    .slice(0, 3); // Maximum 3 options per group

  const yuyuOptions = options
    .filter((opt) => opt.categoryName === 'ゆうゆうメルカリ便')
    .slice(0, 3); // Maximum 3 options per group

  const groups: ShippingGroup[] = [
    ...(rakurakuOptions.length > 0
      ? [{ categoryName: 'らくらくメルカリ便' as const, options: rakurakuOptions }]
      : []),
    ...(yuyuOptions.length > 0
      ? [{ categoryName: 'ゆうゆうメルカリ便' as const, options: yuyuOptions }]
      : []),
  ];

  return groups;
}

/**
 * Generates weight limit warnings from shipping options
 * @param options - Array of shipping options
 * @returns Array of weight warning messages
 */
export function generateWeightWarnings(options: ShippingOption[]): string[] {
  const weightWarnings = options
    .filter((opt) => opt.maxWeightKg)
    .map((opt) => `${opt.optionName}: 最大重量${opt.maxWeightKg}kg`)
    .filter((warning, index, array) => array.indexOf(warning) === index); // Remove duplicates

  return weightWarnings;
}

/**
 * Main function to calculate shipping options based on dimensions
 * @param input - Calculation input containing dimensions and prisma client
 * @returns Shipping calculation result
 */
export async function calculateShippingOptions(input: CalculationInput): Promise<ShippingResult> {
  const { dimensions, prisma } = input;

  try {
    const [fixedOptions, tieredOptions] = await Promise.all([
      getFixedPriceOptions(dimensions, prisma),
      getTieredPriceOptions(dimensions, prisma),
    ]);

    // Merge all options
    const allOptions = [...fixedOptions, ...tieredOptions];

    // Group options by service category
    const groups = groupShippingOptions(allOptions);

    // Generate weight warnings
    const weightWarnings = generateWeightWarnings(allOptions);

    const result: ShippingResult = {
      groups,
      totalAvailable: allOptions.length,
      weightWarnings: weightWarnings.length > 0 ? weightWarnings : undefined,
      invalidReasons: allOptions.length === 0 ? ['適切な配送オプションがありません'] : undefined,
    };

    return result;
  } catch (error) {
    console.error('Shipping calculation error:', error);
    throw new Error('配送オプションの計算中にエラーが発生しました');
  }
}
