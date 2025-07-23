import {
  groupShippingOptions,
  generateWeightWarnings,
  calculateShippingOptions,
} from '../calculator';
import { ShippingOption, ShippingDimensions } from '../types';

// Mock Prisma client
const mockPrisma = {
  shippingOption: {
    findMany: jest.fn(),
  },
  sizeTier: {
    findMany: jest.fn(),
  },
  $disconnect: jest.fn(),
};

// Sample shipping options for testing
const sampleFixedOptions: ShippingOption[] = [
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
  {
    id: 2,
    categoryName: 'ゆうゆうメルカリ便',
    serviceName: 'ゆうパケット',
    optionName: 'ゆうパケット',
    totalPrice: 230,
    basePrice: 230,
    packagingPrice: 0,
    packagingName: null,
    packagingDetails: null,
    requiresSpecialPackaging: false,
    maxWeightKg: 1,
    maxSizeCm: 60,
    maxLengthCm: 34,
    maxWidthCm: 25,
    maxHeightCm: 3,
    maxThicknessCm: 3,
    minLengthCm: null,
    minWidthCm: null,
    deliveryInfo: '標準配送',
    pickupRestrictions: null,
    priceType: 'fixed',
    sizeTierName: null,
  },
  {
    id: 3,
    categoryName: 'らくらくメルカリ便',
    serviceName: 'ネコポス',
    optionName: 'ネコポス Plus',
    totalPrice: 250,
    basePrice: 250,
    packagingPrice: 0,
    packagingName: null,
    packagingDetails: null,
    requiresSpecialPackaging: false,
    maxWeightKg: 2,
    maxSizeCm: 70,
    maxLengthCm: 35,
    maxWidthCm: 25,
    maxHeightCm: 4,
    maxThicknessCm: 4,
    minLengthCm: null,
    minWidthCm: null,
    deliveryInfo: '翌日配達',
    pickupRestrictions: null,
    priceType: 'fixed',
    sizeTierName: null,
  },
];

describe('groupShippingOptions', () => {
  test('should group options by service category', () => {
    const groups = groupShippingOptions(sampleFixedOptions);

    expect(groups).toHaveLength(2);

    const rakurakuGroup = groups.find((g) => g.categoryName === 'らくらくメルカリ便');
    const yuyuGroup = groups.find((g) => g.categoryName === 'ゆうゆうメルカリ便');

    expect(rakurakuGroup).toBeDefined();
    expect(yuyuGroup).toBeDefined();
    expect(rakurakuGroup!.options).toHaveLength(2);
    expect(yuyuGroup!.options).toHaveLength(1);
  });

  test('should limit to 3 options per group', () => {
    const manyOptions: ShippingOption[] = Array.from({ length: 5 }, (_, i) => ({
      ...sampleFixedOptions[0],
      id: i + 1,
      optionName: `Option ${i + 1}`,
    }));

    const groups = groupShippingOptions(manyOptions);

    expect(groups).toHaveLength(1);
    expect(groups[0].options).toHaveLength(3);
  });

  test('should handle empty options array', () => {
    const groups = groupShippingOptions([]);

    expect(groups).toHaveLength(0);
  });

  test('should exclude groups with no options', () => {
    const onlyRakuraku = sampleFixedOptions.filter(
      (opt) => opt.categoryName === 'らくらくメルカリ便'
    );

    const groups = groupShippingOptions(onlyRakuraku);

    expect(groups).toHaveLength(1);
    expect(groups[0].categoryName).toBe('らくらくメルカリ便');
  });
});

describe('generateWeightWarnings', () => {
  test('should generate weight warnings for options with weight limits', () => {
    const warnings = generateWeightWarnings(sampleFixedOptions);

    expect(warnings).toHaveLength(3);
    expect(warnings).toContain('ネコポス: 最大重量1kg');
    expect(warnings).toContain('ゆうパケット: 最大重量1kg');
    expect(warnings).toContain('ネコポス Plus: 最大重量2kg');
  });

  test('should remove duplicate warnings', () => {
    const duplicateOptions = [
      sampleFixedOptions[0], // 1kg
      sampleFixedOptions[0], // 1kg (duplicate)
      sampleFixedOptions[2], // 2kg
    ];

    const warnings = generateWeightWarnings(duplicateOptions);

    expect(warnings).toHaveLength(2);
    expect(warnings.filter((w) => w.includes('1kg'))).toHaveLength(1);
  });

  test('should ignore options without weight limits', () => {
    const noWeightOptions: ShippingOption[] = [
      {
        ...sampleFixedOptions[0],
        maxWeightKg: null,
      },
    ];

    const warnings = generateWeightWarnings(noWeightOptions);

    expect(warnings).toHaveLength(0);
  });

  test('should handle empty options array', () => {
    const warnings = generateWeightWarnings([]);

    expect(warnings).toHaveLength(0);
  });
});

describe('calculateShippingOptions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should calculate shipping options successfully', async () => {
    // Mock database responses
    mockPrisma.shippingOption.findMany.mockResolvedValue([]);
    mockPrisma.sizeTier.findMany.mockResolvedValue([]);

    const dimensions: ShippingDimensions = { length: 10, width: 10, height: 10 };

    const result = await calculateShippingOptions({
      dimensions,
      prisma: mockPrisma as any,
    });

    expect(result.groups).toHaveLength(0);
    expect(result.totalAvailable).toBe(0);
    expect(result.invalidReasons).toContain('適切な配送オプションがありません');
  });

  test('should handle database errors gracefully', async () => {
    mockPrisma.shippingOption.findMany.mockRejectedValue(new Error('Database error'));

    const dimensions: ShippingDimensions = { length: 10, width: 10, height: 10 };

    await expect(
      calculateShippingOptions({
        dimensions,
        prisma: mockPrisma as any,
      })
    ).rejects.toThrow('配送オプションの計算中にエラーが発生しました');
  });

  test('should return weight warnings when options have weight limits', async () => {
    const mockShippingOption = {
      id: 1,
      optionName: 'Test Option',
      totalPrice: 200,
      basePrice: 200,
      packagingPrice: 0,
      packagingName: null,
      packagingDetails: null,
      requiresSpecialPackaging: false,
      maxWeightKg: 1.5,
      maxSizeCm: 60,
      maxLengthCm: 30,
      maxWidthCm: 20,
      maxHeightCm: 3,
      maxThicknessCm: 3,
      minLengthCm: null,
      minWidthCm: null,
      pickupRestrictions: null,
      sortOrder: 1,
      status: 'active',
      service: {
        serviceName: 'Test Service',
        deliveryInfo: 'Test Delivery',
        mercariCategory: {
          categoryName: 'らくらくメルカリ便',
        },
      },
    };

    mockPrisma.shippingOption.findMany.mockResolvedValue([mockShippingOption]);
    mockPrisma.sizeTier.findMany.mockResolvedValue([]);

    const dimensions: ShippingDimensions = { length: 10, width: 10, height: 10 };

    const result = await calculateShippingOptions({
      dimensions,
      prisma: mockPrisma as any,
    });

    expect(result.weightWarnings).toBeDefined();
    expect(result.weightWarnings!.length).toBeGreaterThan(0);
  });
});
