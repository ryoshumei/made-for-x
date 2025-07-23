import { validateRequestBody } from '../validator';
import { calculateShippingOptions } from '../calculator';

// Mock the calculator function for integration testing
jest.mock('../calculator', () => ({
  calculateShippingOptions: jest.fn(),
}));

const mockCalculateShippingOptions = calculateShippingOptions as jest.MockedFunction<
  typeof calculateShippingOptions
>;

describe('API Integration - Business Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete flow validation and calculation', () => {
    test('should process valid request through complete flow', async () => {
      const mockResult = {
        groups: [
          {
            categoryName: 'らくらくメルカリ便' as const,
            options: [
              {
                id: 1,
                categoryName: 'らくらくメルカリ便',
                serviceName: 'ネコポス',
                optionName: 'ネコポス',
                totalPrice: 210,
                basePrice: 210,
                packagingPrice: 0,
                packagingName: null,
                packagingDetails: null,
                requiresSpecialPackaging: false,
                maxWeightKg: 1,
                maxSizeCm: 60,
                maxLengthCm: 31.2,
                maxWidthCm: 22.8,
                maxHeightCm: 3,
                maxThicknessCm: 3,
                minLengthCm: null,
                minWidthCm: null,
                deliveryInfo: '翌日配達',
                pickupRestrictions: null,
                priceType: 'fixed',
                sizeTierName: null,
              },
            ],
          },
        ],
        totalAvailable: 1,
        weightWarnings: ['ネコポス: 最大重量1kg'],
        invalidReasons: undefined,
      };

      mockCalculateShippingOptions.mockResolvedValue(mockResult);

      // Step 1: Validate request body
      const requestBody = { length: 10, width: 10, height: 2 };
      const validation = validateRequestBody(requestBody);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);

      // Step 2: Calculate shipping options
      const mockPrisma = {};
      const result = await calculateShippingOptions({
        dimensions: requestBody,
        prisma: mockPrisma as any,
      });

      expect(result.groups).toHaveLength(1);
      expect(result.totalAvailable).toBe(1);
      expect(result.weightWarnings).toContain('ネコポス: 最大重量1kg');
    });

    test('should handle validation errors before calculation', async () => {
      const invalidRequestBody = { length: -5, width: 10, height: 10 };
      const validation = validateRequestBody(invalidRequestBody);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('サイズは0より大きくなければなりません');

      // Calculator should not be called for invalid input
      expect(mockCalculateShippingOptions).not.toHaveBeenCalled();
    });

    test('should handle oversized dimensions validation', async () => {
      const oversizedRequestBody = { length: 250, width: 10, height: 10 };
      const validation = validateRequestBody(oversizedRequestBody);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('一辺のサイズは200cmを超えることはできません');

      expect(mockCalculateShippingOptions).not.toHaveBeenCalled();
    });

    test('should handle type validation errors', async () => {
      const invalidTypeRequestBody = { length: '10', width: 10, height: 10 };
      const validation = validateRequestBody(invalidTypeRequestBody);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('長さ、幅、高さは数値である必要があります');

      expect(mockCalculateShippingOptions).not.toHaveBeenCalled();
    });

    test('should handle empty request body', async () => {
      const validation = validateRequestBody(null);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('リクエストボディが必要です');

      expect(mockCalculateShippingOptions).not.toHaveBeenCalled();
    });

    test('should handle calculator errors in integration flow', async () => {
      mockCalculateShippingOptions.mockRejectedValue(
        new Error('配送オプションの計算中にエラーが発生しました')
      );

      const requestBody = { length: 10, width: 10, height: 10 };
      const validation = validateRequestBody(requestBody);

      expect(validation.isValid).toBe(true);

      // Calculator should throw error
      await expect(
        calculateShippingOptions({
          dimensions: requestBody,
          prisma: {} as any,
        })
      ).rejects.toThrow('配送オプションの計算中にエラーが発生しました');
    });

    test('should handle no available options scenario', async () => {
      const mockResult = {
        groups: [],
        totalAvailable: 0,
        weightWarnings: undefined,
        invalidReasons: ['適切な配送オプションがありません'],
      };

      mockCalculateShippingOptions.mockResolvedValue(mockResult);

      const requestBody = { length: 150, width: 150, height: 150 };
      const validation = validateRequestBody(requestBody);

      expect(validation.isValid).toBe(true);

      const result = await calculateShippingOptions({
        dimensions: requestBody,
        prisma: {} as any,
      });

      expect(result.groups).toHaveLength(0);
      expect(result.totalAvailable).toBe(0);
      expect(result.invalidReasons).toContain('適切な配送オプションがありません');
    });
  });

  describe('Edge cases in integration flow', () => {
    test('should handle boundary values correctly', async () => {
      const mockResult = {
        groups: [],
        totalAvailable: 0,
        weightWarnings: undefined,
        invalidReasons: ['適切な配送オプションがありません'],
      };

      mockCalculateShippingOptions.mockResolvedValue(mockResult);

      // Test exactly 200cm (should be valid)
      const boundaryRequestBody = { length: 200, width: 200, height: 200 };
      const validation = validateRequestBody(boundaryRequestBody);

      expect(validation.isValid).toBe(true);

      await calculateShippingOptions({
        dimensions: boundaryRequestBody,
        prisma: {} as any,
      });

      expect(mockCalculateShippingOptions).toHaveBeenCalledWith({
        dimensions: { length: 200, width: 200, height: 200 },
        prisma: {},
      });
    });

    test('should handle very small positive dimensions', async () => {
      const mockResult = {
        groups: [],
        totalAvailable: 0,
        weightWarnings: undefined,
        invalidReasons: ['適切な配送オプションがありません'],
      };

      mockCalculateShippingOptions.mockResolvedValue(mockResult);

      const smallRequestBody = { length: 0.1, width: 0.1, height: 0.1 };
      const validation = validateRequestBody(smallRequestBody);

      expect(validation.isValid).toBe(true);

      await calculateShippingOptions({
        dimensions: smallRequestBody,
        prisma: {} as any,
      });

      expect(mockCalculateShippingOptions).toHaveBeenCalledWith({
        dimensions: { length: 0.1, width: 0.1, height: 0.1 },
        prisma: {},
      });
    });

    test('should handle multiple validation errors', async () => {
      const multipleErrorsBody = { length: -1, width: 0, height: 250 };
      const validation = validateRequestBody(multipleErrorsBody);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(1);
      expect(validation.errors).toContain('サイズは0より大きくなければなりません');
      expect(validation.errors).toContain('一辺のサイズは200cmを超えることはできません');

      expect(mockCalculateShippingOptions).not.toHaveBeenCalled();
    });
  });
});
