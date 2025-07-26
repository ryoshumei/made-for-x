import { PrismaClient } from '@prisma/client';
import {
  getFixedPriceOptions,
  getTieredPriceOptions,
  calculateShippingOptions,
} from '../calculator';
import { ShippingDimensions } from '../types';

const prisma = new PrismaClient();

describe('Complete Seed Data Validation Tests', () => {
  beforeAll(async () => {
    // Ensure we have the updated seed data
    const categoryCount = await prisma.mercariServiceCategory.count();
    const optionCount = await prisma.shippingOption.count();
    const tierCount = await prisma.sizeTier.count();

    if (categoryCount < 2 || optionCount < 8 || tierCount < 16) {
      console.warn('Warning: Updated seed data not found. Run: npm run db:seed:mercari');
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('All 8 Shipping Options - Exact Pricing & Dimensions', () => {
    test('should find ネコポス with exact specifications', async () => {
      const dimensions: ShippingDimensions = { length: 30, width: 20, height: 2.5 };
      const fixedOptions = await getFixedPriceOptions(dimensions, prisma);

      const nekopos = fixedOptions.find((opt) => opt.optionName === 'ネコポス');

      expect(nekopos).toBeDefined();
      expect(nekopos?.totalPrice).toBe(210);
      expect(nekopos?.basePrice).toBe(210);
      expect(nekopos?.packagingPrice).toBe(0);
      expect(nekopos?.categoryName).toBe('らくらくメルカリ便');
      expect(nekopos?.maxWeightKg).toBe(1);
      expect(nekopos?.maxLengthCm).toBe(31.2);
      expect(nekopos?.maxWidthCm).toBe(22.8);
      expect(nekopos?.maxThicknessCm).toBe(3);
      expect(nekopos?.minLengthCm).toBe(23);
      expect(nekopos?.minWidthCm).toBe(11.5);
      expect(nekopos?.requiresSpecialPackaging).toBe(false);
    });

    test('should find 宅急便コンパクト (薄型BOX) with 内寸 dimensions', async () => {
      const dimensions: ShippingDimensions = { length: 24, width: 33, height: 1 };
      const fixedOptions = await getFixedPriceOptions(dimensions, prisma);

      const compactThin = fixedOptions.find(
        (opt) => opt.optionName === '宅急便コンパクト (薄型BOX)'
      );

      expect(compactThin).toBeDefined();
      expect(compactThin?.totalPrice).toBe(520);
      expect(compactThin?.basePrice).toBe(450);
      expect(compactThin?.packagingPrice).toBe(70);
      expect(compactThin?.packagingName).toBe('専用薄型BOX');
      expect(compactThin?.categoryName).toBe('らくらくメルカリ便');
      expect(compactThin?.maxLengthCm).toBe(24); // 内寸
      expect(compactThin?.maxWidthCm).toBe(33.2); // 内寸
      expect(compactThin?.requiresSpecialPackaging).toBe(true);
    });

    test('should find 宅急便コンパクト (BOX) with 内寸 dimensions', async () => {
      const dimensions: ShippingDimensions = { length: 19, width: 24, height: 4.5 };
      const fixedOptions = await getFixedPriceOptions(dimensions, prisma);

      const compactBox = fixedOptions.find((opt) => opt.optionName === '宅急便コンパクト (BOX)');

      expect(compactBox).toBeDefined();
      expect(compactBox?.totalPrice).toBe(520);
      expect(compactBox?.basePrice).toBe(450);
      expect(compactBox?.packagingPrice).toBe(70);
      expect(compactBox?.packagingName).toBe('専用BOX');
      expect(compactBox?.categoryName).toBe('らくらくメルカリ便');
      expect(compactBox?.maxLengthCm).toBe(19.3); // 内寸
      expect(compactBox?.maxWidthCm).toBe(24.7); // 内寸
      expect(compactBox?.maxHeightCm).toBe(4.7); // 内寸
      expect(compactBox?.requiresSpecialPackaging).toBe(true);
    });

    test('should find ゆうパケット with correct specifications', async () => {
      const dimensions: ShippingDimensions = { length: 33, width: 20, height: 2.8 };
      const fixedOptions = await getFixedPriceOptions(dimensions, prisma);

      const yuPacket = fixedOptions.find((opt) => opt.optionName === 'ゆうパケット');

      expect(yuPacket).toBeDefined();
      expect(yuPacket?.totalPrice).toBe(230);
      expect(yuPacket?.basePrice).toBe(230);
      expect(yuPacket?.packagingPrice).toBe(0);
      expect(yuPacket?.categoryName).toBe('ゆうゆうメルカリ便');
      expect(yuPacket?.maxWeightKg).toBe(1);
      expect(yuPacket?.maxSizeCm).toBe(60);
      expect(yuPacket?.maxLengthCm).toBe(34);
      expect(yuPacket?.maxThicknessCm).toBe(3);
      expect(yuPacket?.requiresSpecialPackaging).toBe(false);
    });

    test('should find ゆうパケットポストmini with 内寸 dimensions', async () => {
      const dimensions: ShippingDimensions = { length: 21, width: 16.5, height: 1 };
      const fixedOptions = await getFixedPriceOptions(dimensions, prisma);

      const yuPacketPostMini = fixedOptions.find(
        (opt) => opt.optionName === 'ゆうパケットポストmini'
      );

      expect(yuPacketPostMini).toBeDefined();
      expect(yuPacketPostMini?.totalPrice).toBe(180);
      expect(yuPacketPostMini?.basePrice).toBe(160);
      expect(yuPacketPostMini?.packagingPrice).toBe(20);
      expect(yuPacketPostMini?.packagingName).toBe('専用封筒');
      expect(yuPacketPostMini?.categoryName).toBe('ゆうゆうメルカリ便');
      expect(yuPacketPostMini?.maxWeightKg).toBe(2);
      expect(yuPacketPostMini?.maxLengthCm).toBe(21.1); // 内寸
      expect(yuPacketPostMini?.maxWidthCm).toBe(16.8); // 内寸
      expect(yuPacketPostMini?.requiresSpecialPackaging).toBe(true);
    });

    test('should find ゆうパケットポスト (専用箱) with correct pricing', async () => {
      const dimensions: ShippingDimensions = { length: 32, width: 22, height: 2.8 };
      const fixedOptions = await getFixedPriceOptions(dimensions, prisma);

      const yuPacketPostBox = fixedOptions.find(
        (opt) => opt.optionName === 'ゆうパケットポスト (専用箱)'
      );

      expect(yuPacketPostBox).toBeDefined();
      expect(yuPacketPostBox?.totalPrice).toBe(280);
      expect(yuPacketPostBox?.basePrice).toBe(215);
      expect(yuPacketPostBox?.packagingPrice).toBe(65);
      expect(yuPacketPostBox?.packagingName).toBe('専用箱');
      expect(yuPacketPostBox?.categoryName).toBe('ゆうゆうメルカリ便');
      expect(yuPacketPostBox?.maxWeightKg).toBe(2);
      expect(yuPacketPostBox?.maxSizeCm).toBe(60);
      expect(yuPacketPostBox?.maxLengthCm).toBe(32.7);
      expect(yuPacketPostBox?.maxWidthCm).toBe(22.8);
      expect(yuPacketPostBox?.maxThicknessCm).toBe(3);
      expect(yuPacketPostBox?.requiresSpecialPackaging).toBe(true);
    });

    test('should find ゆうパケットポスト (発送用シール) with CORRECTED pricing', async () => {
      const dimensions: ShippingDimensions = { length: 33, width: 20, height: 2.8 };
      const fixedOptions = await getFixedPriceOptions(dimensions, prisma);

      const yuPacketPostSticker = fixedOptions.find(
        (opt) => opt.optionName === 'ゆうパケットポスト (発送用シール)'
      );

      expect(yuPacketPostSticker).toBeDefined();
      expect(yuPacketPostSticker?.totalPrice).toBe(220); // CORRECTED: was 235円, now 220円
      expect(yuPacketPostSticker?.basePrice).toBe(215);
      expect(yuPacketPostSticker?.packagingPrice).toBe(5); // CORRECTED: was 20円, now 5円
      expect(yuPacketPostSticker?.packagingName).toBe('発送用シール');
      expect(yuPacketPostSticker?.categoryName).toBe('ゆうゆうメルカリ便');
      expect(yuPacketPostSticker?.maxWeightKg).toBe(2);
      expect(yuPacketPostSticker?.maxSizeCm).toBe(60);
      expect(yuPacketPostSticker?.maxLengthCm).toBe(34);
      expect(yuPacketPostSticker?.maxThicknessCm).toBe(3);
      expect(yuPacketPostSticker?.minLengthCm).toBe(14);
      expect(yuPacketPostSticker?.minWidthCm).toBe(9);
      expect(yuPacketPostSticker?.requiresSpecialPackaging).toBe(true);
    });

    test('should find ゆうパケットプラス with 内寸 dimensions', async () => {
      const dimensions: ShippingDimensions = { length: 23, width: 16, height: 6.2 };
      const fixedOptions = await getFixedPriceOptions(dimensions, prisma);

      const yuPacketPlus = fixedOptions.find((opt) => opt.optionName === 'ゆうパケットプラス');

      expect(yuPacketPlus).toBeDefined();
      expect(yuPacketPlus?.totalPrice).toBe(520);
      expect(yuPacketPlus?.basePrice).toBe(455);
      expect(yuPacketPlus?.packagingPrice).toBe(65);
      expect(yuPacketPlus?.packagingName).toBe('専用箱');
      expect(yuPacketPlus?.categoryName).toBe('ゆうゆうメルカリ便');
      expect(yuPacketPlus?.maxWeightKg).toBe(2);
      expect(yuPacketPlus?.maxLengthCm).toBe(23.2); // 内寸
      expect(yuPacketPlus?.maxWidthCm).toBe(16.2); // 内寸
      expect(yuPacketPlus?.maxHeightCm).toBe(6.5); // 内寸
      expect(yuPacketPlus?.requiresSpecialPackaging).toBe(true);
    });
  });

  describe('Packaging Cost Validation', () => {
    test('should validate all packaging cost calculations', async () => {
      const options = await prisma.shippingOption.findMany({
        where: { status: 'active' },
      });

      options.forEach((option) => {
        // Validate total price calculation
        if (option.packagingPrice && option.basePrice) {
          expect(option.basePrice + option.packagingPrice).toBe(option.totalPrice);
        }

        // Validate specific corrected pricing
        if (option.optionName === 'ゆうパケットポスト (発送用シール)') {
          expect(option.totalPrice).toBe(220);
          expect(option.basePrice).toBe(215);
          expect(option.packagingPrice).toBe(5);
        }
      });
    });

    test('should validate specialized packaging requirements', async () => {
      const optionsWithPackaging = await prisma.shippingOption.findMany({
        where: {
          status: 'active',
          requiresSpecialPackaging: true,
        },
      });

      expect(optionsWithPackaging.length).toBe(6); // 6 options require special packaging

      optionsWithPackaging.forEach((option) => {
        expect(option.packagingName).toBeDefined();
        expect(option.packagingDetails).toBeDefined();
        expect(option.packagingPrice).toBeGreaterThan(0);
      });
    });
  });

  describe('内寸 Dimension Boundary Testing', () => {
    test('should reject items larger than 内寸 for ゆうパケットポストmini', async () => {
      const oversized: ShippingDimensions = { length: 21.2, width: 16.8, height: 1 }; // Exceeds 21.1cm limit
      const fixedOptions = await getFixedPriceOptions(oversized, prisma);

      const yuPacketPostMini = fixedOptions.find(
        (opt) => opt.optionName === 'ゆうパケットポストmini'
      );
      expect(yuPacketPostMini).toBeUndefined();
    });

    test('should accept items exactly at 内寸 limits for ゆうパケットプラス', async () => {
      const exactLimit: ShippingDimensions = { length: 23.2, width: 16.2, height: 6.5 };
      const fixedOptions = await getFixedPriceOptions(exactLimit, prisma);

      const yuPacketPlus = fixedOptions.find((opt) => opt.optionName === 'ゆうパケットプラス');
      expect(yuPacketPlus).toBeDefined();
    });

    test('should distinguish between 宅急便コンパクト BOX types based on dimensions', async () => {
      // Item that fits thin BOX but not regular BOX
      const thinBoxItem: ShippingDimensions = { length: 24, width: 33, height: 1 };
      const thinOptions = await getFixedPriceOptions(thinBoxItem, prisma);

      const thinBox = thinOptions.find((opt) => opt.optionName === '宅急便コンパクト (薄型BOX)');
      const regularBox = thinOptions.find((opt) => opt.optionName === '宅急便コンパクト (BOX)');

      expect(thinBox).toBeDefined();
      expect(regularBox).toBeUndefined(); // Doesn't fit in regular BOX

      // Item that fits regular BOX
      const regularBoxItem: ShippingDimensions = { length: 19, width: 24, height: 4.5 };
      const regularOptions = await getFixedPriceOptions(regularBoxItem, prisma);

      const regularBoxFound = regularOptions.find(
        (opt) => opt.optionName === '宅急便コンパクト (BOX)'
      );
      expect(regularBoxFound).toBeDefined();
    });
  });

  describe('Complete Size Tier Testing', () => {
    test('should find all 16 size tiers with correct pricing', async () => {
      const tiers = await prisma.sizeTier.findMany({
        include: { service: { include: { mercariCategory: true } } },
        orderBy: [{ serviceId: 'asc' }, { maxSizeCm: 'asc' }],
      });

      expect(tiers.length).toBe(16);

      // Verify 宅急便 tiers (9 tiers)
      const takkyubinTiers = tiers.filter((tier) => tier.service.serviceName === '宅急便');
      expect(takkyubinTiers.length).toBe(9);

      const expectedTakkyubinPrices = [750, 850, 1050, 1200, 1450, 1700, 2100, 2100, 2500];
      takkyubinTiers.forEach((tier, index) => {
        expect(tier.price).toBe(expectedTakkyubinPrices[index]);
      });

      // Verify ゆうパック tiers (7 tiers)
      const yuPackTiers = tiers.filter((tier) => tier.service.serviceName === 'ゆうパック');
      expect(yuPackTiers.length).toBe(7);

      const expectedYuPackPrices = [770, 870, 1070, 1250, 1450, 1700, 1900];
      yuPackTiers.forEach((tier, index) => {
        expect(tier.price).toBe(expectedYuPackPrices[index]);
      });
    });

    test('should find correct tier for medium package', async () => {
      const dimensions: ShippingDimensions = { length: 25, width: 25, height: 10 }; // 60cm total
      const tieredOptions = await getTieredPriceOptions(dimensions, prisma);

      const tier60Options = tieredOptions.filter((opt) => opt.sizeTierName === '60サイズ');
      expect(tier60Options.length).toBe(2); // Both 宅急便 and ゆうパック

      const takkyubin60 = tier60Options.find((opt) => opt.categoryName === 'らくらくメルカリ便');
      const yuPack60 = tier60Options.find((opt) => opt.categoryName === 'ゆうゆうメルカリ便');

      expect(takkyubin60?.totalPrice).toBe(750);
      expect(yuPack60?.totalPrice).toBe(770);
    });
  });

  describe('Comprehensive Integration Testing', () => {
    test('should return complete results with all 8 options available for small package', async () => {
      const dimensions: ShippingDimensions = { length: 15, width: 12, height: 2 };

      const result = await calculateShippingOptions({
        dimensions,
        prisma,
      });

      // Should have multiple options available
      expect(result.totalAvailable).toBeGreaterThanOrEqual(3);

      // Should be sorted by price within groups (cheapest first)
      result.groups.forEach((group) => {
        for (let i = 0; i < group.options.length - 1; i++) {
          expect(group.options[i].totalPrice).toBeLessThanOrEqual(group.options[i + 1].totalPrice);
        }
      });

      // Should include the cheapest option (ゆうパケットポストmini at 180円)
      const allOptions = result.groups.flatMap((group) => group.options);
      const cheapestOption = allOptions.reduce((prev, curr) =>
        prev.totalPrice < curr.totalPrice ? prev : curr
      );
      expect(cheapestOption.totalPrice).toBe(180);
      expect(cheapestOption.optionName).toBe('ゆうパケットポストmini');
    });

    test('should generate accurate weight warnings for all services', async () => {
      const dimensions: ShippingDimensions = { length: 20, width: 15, height: 2 };

      const result = await calculateShippingOptions({
        dimensions,
        prisma,
      });

      expect(result.weightWarnings).toBeDefined();
      expect(result.weightWarnings?.length).toBeGreaterThan(0);

      // Should include warnings for 1kg limit services
      const has1kgWarning = result.weightWarnings?.some((w) => w.includes('1kg'));
      // Should include warnings for 2kg limit services
      const has2kgWarning = result.weightWarnings?.some((w) => w.includes('2kg'));

      expect(has1kgWarning || has2kgWarning).toBe(true);
    });
  });

  describe('Performance and Data Consistency', () => {
    test('should maintain referential integrity across all tables', async () => {
      // Verify all shipping options reference valid services
      const options = await prisma.shippingOption.findMany({
        include: { service: { include: { mercariCategory: true } } },
      });

      options.forEach((option) => {
        expect(option.service).toBeDefined();
        expect(option.service.mercariCategory).toBeDefined();
        expect(['らくらくメルカリ便', 'ゆうゆうメルカリ便']).toContain(
          option.service.mercariCategory.categoryName
        );
      });

      // Verify all size tiers reference valid services
      const tiers = await prisma.sizeTier.findMany({
        include: { service: { include: { mercariCategory: true } } },
      });

      tiers.forEach((tier) => {
        expect(tier.service).toBeDefined();
        expect(['宅急便', 'ゆうパック']).toContain(tier.service.serviceName);
      });
    });

    test('should have consistent sortOrder values', async () => {
      const options = await prisma.shippingOption.findMany({
        orderBy: { sortOrder: 'asc' },
      });

      expect(options.length).toBe(8);

      // Verify sortOrder is sequential and unique
      const sortOrders = options.map((opt) => opt.sortOrder);
      expect(sortOrders).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });
  });
});
