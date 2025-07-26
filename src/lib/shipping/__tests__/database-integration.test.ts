import { PrismaClient } from '@prisma/client';
import {
  getFixedPriceOptions,
  getTieredPriceOptions,
  calculateShippingOptions,
} from '../calculator';
import { ShippingDimensions } from '../types';

const prisma = new PrismaClient();

describe('Database Integration Tests', () => {
  beforeAll(async () => {
    // Ensure we have test data - check if seed data exists
    const categoryCount = await prisma.mercariServiceCategory.count();
    if (categoryCount === 0) {
      console.warn('Warning: No seed data found. Run: npm run seed');
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Real Data Validation', () => {
    test('should find ネコポス for valid package (25x15x2)', async () => {
      const dimensions: ShippingDimensions = { length: 25, width: 15, height: 2 };

      const fixedOptions = await getFixedPriceOptions(dimensions, prisma);

      // Should find ネコポス (210円) - meets min requirements (23x11.5x3)
      const nekopos = fixedOptions.find((opt) => opt.optionName === 'ネコポス');
      expect(nekopos).toBeDefined();
      expect(nekopos?.totalPrice).toBe(210);
      expect(nekopos?.categoryName).toBe('らくらくメルカリ便');
      expect(nekopos?.maxWeightKg).toBe(1);
      expect(nekopos?.maxThicknessCm).toBe(3);
    });

    test('should find ゆうパケット for A4 package (30x20x2)', async () => {
      const dimensions: ShippingDimensions = { length: 30, width: 20, height: 2 };

      const fixedOptions = await getFixedPriceOptions(dimensions, prisma);

      // Should find ゆうパケット (230円)
      const yuPacket = fixedOptions.find((opt) => opt.optionName === 'ゆうパケット');
      expect(yuPacket).toBeDefined();
      expect(yuPacket?.totalPrice).toBe(230);
      expect(yuPacket?.categoryName).toBe('ゆうゆうメルカリ便');
      expect(yuPacket?.maxSizeCm).toBe(60);
    });

    test('should find size tiers for medium package (25x25x10)', async () => {
      const dimensions: ShippingDimensions = { length: 25, width: 25, height: 10 };

      const tieredOptions = await getTieredPriceOptions(dimensions, prisma);

      // Should find 60サイズ options (60cm total)
      const tier60Options = tieredOptions.filter((opt) => opt.sizeTierName === '60サイズ');
      expect(tier60Options.length).toBeGreaterThan(0);

      // Verify price accuracy
      const rakurakuTier60 = tier60Options.find((opt) => opt.categoryName === 'らくらくメルカリ便');
      const yuyuTier60 = tier60Options.find((opt) => opt.categoryName === 'ゆうゆうメルカリ便');

      expect(rakurakuTier60?.totalPrice).toBe(750); // 宅急便 60サイズ
      expect(yuyuTier60?.totalPrice).toBe(770); // ゆうパック 60サイズ
    });

    test('should respect size constraints accurately', async () => {
      // Test ネコポス size limits (31.2 x 22.8 x 3.0)
      const oversizedLength: ShippingDimensions = { length: 32, width: 20, height: 2 };
      const oversizedWidth: ShippingDimensions = { length: 30, width: 23, height: 2 };
      const oversizedThickness: ShippingDimensions = { length: 30, width: 20, height: 3.1 };

      const [noLengthMatch, noWidthMatch, noThicknessMatch] = await Promise.all([
        getFixedPriceOptions(oversizedLength, prisma),
        getFixedPriceOptions(oversizedWidth, prisma),
        getFixedPriceOptions(oversizedThickness, prisma),
      ]);

      // Should NOT find ネコポス for oversized packages
      expect(noLengthMatch.find((opt) => opt.optionName === 'ネコポス')).toBeUndefined();
      expect(noWidthMatch.find((opt) => opt.optionName === 'ネコポス')).toBeUndefined();
      expect(noThicknessMatch.find((opt) => opt.optionName === 'ネコポス')).toBeUndefined();
    });

    test('should calculate complete shipping options with real data', async () => {
      const dimensions: ShippingDimensions = { length: 15, width: 12, height: 5 };

      const result = await calculateShippingOptions({
        dimensions,
        prisma,
      });

      // Should have multiple options
      expect(result.totalAvailable).toBeGreaterThan(0);
      expect(result.groups.length).toBeGreaterThan(0);

      // Should include both categories
      const categoryNames = result.groups.map((g) => g.categoryName);
      expect(categoryNames).toContain('らくらくメルカリ便');
      expect(categoryNames).toContain('ゆうゆうメルカリ便');

      // All options should be sorted by price
      result.groups.forEach((group) => {
        for (let i = 0; i < group.options.length - 1; i++) {
          expect(group.options[i].totalPrice).toBeLessThanOrEqual(group.options[i + 1].totalPrice);
        }
      });
    });
  });

  describe('Edge Cases with Real Data', () => {
    test('should handle minimum size package (1x1x1)', async () => {
      const dimensions: ShippingDimensions = { length: 1, width: 1, height: 1 };

      const result = await calculateShippingOptions({
        dimensions,
        prisma,
      });

      // Should find some options for very small package
      expect(result.totalAvailable).toBeGreaterThan(0);
    });

    test('should handle maximum ネコポス size (31.2x22.8x3.0)', async () => {
      const dimensions: ShippingDimensions = { length: 31.2, width: 22.8, height: 3.0 };

      const fixedOptions = await getFixedPriceOptions(dimensions, prisma);
      const nekopos = fixedOptions.find((opt) => opt.optionName === 'ネコポス');

      expect(nekopos).toBeDefined();
      expect(nekopos?.totalPrice).toBe(210);
    });

    test('should handle large package requiring size tiers', async () => {
      const dimensions: ShippingDimensions = { length: 60, width: 40, height: 20 }; // 120cm total

      const tieredOptions = await getTieredPriceOptions(dimensions, prisma);

      // Should find 120サイズ tier options
      const tier120Options = tieredOptions.filter((opt) => opt.sizeTierName === '120サイズ');
      expect(tier120Options.length).toBeGreaterThan(0);

      // Should NOT find smaller tier options
      const tier100Options = tieredOptions.filter((opt) => opt.sizeTierName === '100サイズ');
      expect(tier100Options.length).toBe(0);
    });

    test('should handle very large package with limited options', async () => {
      const dimensions: ShippingDimensions = { length: 300, width: 300, height: 300 };

      const result = await calculateShippingOptions({
        dimensions,
        prisma,
      });

      // May have some options without size constraints (like 宅急便コンパクト)
      // The important thing is that size-constrained options are filtered out
      console.log(`Large package result: ${result.totalAvailable} options found`);
      if (result.totalAvailable > 0) {
        result.groups.forEach((group) => {
          group.options.forEach((option) => {
            console.log(
              `Found: ${option.optionName} - constraints: maxSize=${option.maxSizeCm}, maxLength=${option.maxLengthCm}`
            );
          });
        });
      }

      // Should have very few or no options - test that size filtering works
      expect(result.totalAvailable).toBeLessThanOrEqual(2);
    });
  });

  describe('Weight Warnings Accuracy', () => {
    test('should generate accurate weight warnings from real data', async () => {
      const dimensions: ShippingDimensions = { length: 30, width: 20, height: 2 };

      const result = await calculateShippingOptions({
        dimensions,
        prisma,
      });

      expect(result.weightWarnings).toBeDefined();
      expect(result.weightWarnings?.length).toBeGreaterThan(0);

      // Should include actual weight limits from database
      const hasNekoposWarning = result.weightWarnings?.some(
        (w) => w.includes('ネコポス') && w.includes('1kg')
      );
      const hasYuPacketWarning = result.weightWarnings?.some(
        (w) => w.includes('ゆうパケット') && w.includes('1kg')
      );

      expect(hasNekoposWarning || hasYuPacketWarning).toBe(true);
    });
  });

  describe('Data Consistency Validation', () => {
    test('should verify all active services have valid categories', async () => {
      const services = await prisma.shippingService.findMany({
        where: { status: 'active' },
        include: { mercariCategory: true },
      });

      services.forEach((service) => {
        expect(service.mercariCategory).toBeDefined();
        expect(service.mercariCategory.status).toBe('active');
        expect(['らくらくメルカリ便', 'ゆうゆうメルカリ便']).toContain(
          service.mercariCategory.categoryName
        );
      });
    });

    test('should verify all shipping options have valid constraints', async () => {
      const options = await prisma.shippingOption.findMany({
        where: { status: 'active' },
      });

      options.forEach((option) => {
        // Price should be positive
        expect(option.totalPrice).toBeGreaterThan(0);

        // If has packaging price, should be consistent
        if (option.packagingPrice) {
          expect(option.basePrice).toBeDefined();
          expect(option.basePrice! + option.packagingPrice).toBe(option.totalPrice);
        }

        // Size constraints should be logical
        if (option.maxLengthCm && option.minLengthCm) {
          expect(Number(option.maxLengthCm)).toBeGreaterThan(Number(option.minLengthCm));
        }
        if (option.maxWidthCm && option.minWidthCm) {
          expect(Number(option.maxWidthCm)).toBeGreaterThan(Number(option.minWidthCm));
        }
      });
    });

    test('should verify size tiers are logically ordered', async () => {
      const tiers = await prisma.sizeTier.findMany({
        orderBy: [{ serviceId: 'asc' }, { maxSizeCm: 'asc' }],
      });

      let currentServiceId = -1;
      let lastMaxSize = -1;
      let lastPrice = -1;

      tiers.forEach((tier) => {
        if (tier.serviceId !== currentServiceId) {
          currentServiceId = tier.serviceId;
          lastMaxSize = -1;
          lastPrice = -1;
        }

        if (tier.maxSizeCm) {
          expect(tier.maxSizeCm).toBeGreaterThan(lastMaxSize);
          expect(tier.price).toBeGreaterThanOrEqual(lastPrice); // Allow equal prices for same-tier options
          lastMaxSize = tier.maxSizeCm;
          lastPrice = tier.price;
        }
      });
    });
  });
});
