import { PrismaClient } from '@prisma/client';
import { calculateShippingOptions } from '../calculator';

const prisma = new PrismaClient();

describe('Shipping Height Constraints', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('宅急便コンパクト (薄型BOX) height constraints', () => {
    test('should include 薄型BOX for items within 0.9cm height', async () => {
      const result = await calculateShippingOptions({
        dimensions: { length: 24, width: 33.2, height: 0.9 },
        prisma,
      });

      const thinBoxOption = result.groups
        .flatMap((group) => group.options)
        .find((option) => option.optionName === '宅急便コンパクト (薄型BOX)');

      expect(thinBoxOption).toBeDefined();
      expect(thinBoxOption?.maxHeightCm).toBe(0.9);
    });

    test('should exclude 薄型BOX for items over 0.9cm height', async () => {
      const result = await calculateShippingOptions({
        dimensions: { length: 24, width: 33.2, height: 1.0 },
        prisma,
      });

      const thinBoxOption = result.groups
        .flatMap((group) => group.options)
        .find((option) => option.optionName === '宅急便コンパクト (薄型BOX)');

      expect(thinBoxOption).toBeUndefined();
    });
  });

  describe('ゆうパケットポストmini height constraints', () => {
    test('should include ゆうパケットポストmini for items within 3cm height', async () => {
      const result = await calculateShippingOptions({
        dimensions: { length: 21.1, width: 16.8, height: 3.0 },
        prisma,
      });

      const miniOption = result.groups
        .flatMap((group) => group.options)
        .find((option) => option.optionName === 'ゆうパケットポストmini');

      expect(miniOption).toBeDefined();
      expect(miniOption?.maxHeightCm).toBe(3.0);
    });

    test('should exclude ゆうパケットポストmini for items over 3cm height', async () => {
      const result = await calculateShippingOptions({
        dimensions: { length: 21.1, width: 16.8, height: 3.1 },
        prisma,
      });

      const miniOption = result.groups
        .flatMap((group) => group.options)
        .find((option) => option.optionName === 'ゆうパケットポストmini');

      expect(miniOption).toBeUndefined();
    });
  });

  describe('Height rejection scenarios', () => {
    test('should reject 薄型BOX for items exactly 1mm over limit (1.0cm)', async () => {
      const result = await calculateShippingOptions({
        dimensions: { length: 24, width: 33.2, height: 1.0 },
        prisma,
      });

      const thinBoxOption = result.groups
        .flatMap((group) => group.options)
        .find((option) => option.optionName === '宅急便コンパクト (薄型BOX)');

      expect(thinBoxOption).toBeUndefined();
    });

    test('should reject 薄型BOX for items significantly over limit (2cm)', async () => {
      const result = await calculateShippingOptions({
        dimensions: { length: 24, width: 33.2, height: 2.0 },
        prisma,
      });

      const thinBoxOption = result.groups
        .flatMap((group) => group.options)
        .find((option) => option.optionName === '宅急便コンパクト (薄型BOX)');

      expect(thinBoxOption).toBeUndefined();
    });

    test('should reject ゆうパケットポストmini for items exactly 1mm over limit (3.1cm)', async () => {
      const result = await calculateShippingOptions({
        dimensions: { length: 21.1, width: 16.8, height: 3.1 },
        prisma,
      });

      const miniOption = result.groups
        .flatMap((group) => group.options)
        .find((option) => option.optionName === 'ゆうパケットポストmini');

      expect(miniOption).toBeUndefined();
    });

    test('should reject ゆうパケットポストmini for items significantly over limit (5cm)', async () => {
      const result = await calculateShippingOptions({
        dimensions: { length: 21.1, width: 16.8, height: 5.0 },
        prisma,
      });

      const miniOption = result.groups
        .flatMap((group) => group.options)
        .find((option) => option.optionName === 'ゆうパケットポストmini');

      expect(miniOption).toBeUndefined();
    });
  });

  describe('Edge cases for corrected height values', () => {
    test('should handle exact height match for 薄型BOX', async () => {
      const result = await calculateShippingOptions({
        dimensions: { length: 24, width: 33.2, height: 0.9 },
        prisma,
      });

      const hasValidOptions = result.groups.some((group) =>
        group.options.some((option) => option.optionName === '宅急便コンパクト (薄型BOX)')
      );

      expect(hasValidOptions).toBe(true);
    });

    test('should handle exact height match for ゆうパケットポストmini', async () => {
      const result = await calculateShippingOptions({
        dimensions: { length: 21.1, width: 16.8, height: 3.0 },
        prisma,
      });

      const hasValidOptions = result.groups.some((group) =>
        group.options.some((option) => option.optionName === 'ゆうパケットポストmini')
      );

      expect(hasValidOptions).toBe(true);
    });
  });
});
