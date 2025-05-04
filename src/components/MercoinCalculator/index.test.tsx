import { calculateProfit } from './index';
import { Transaction } from './types';
import { validateFileCount, validateFileNames } from './index';

describe('MercoinCalculator Profit Calculation', () => {
  // BTC test cases
  describe('BTC Calculations', () => {
    it('should calculate BTC profit correctly with JPY transactions', () => {
      const transactions: Transaction[] = [
        {
          取引種別: '購入',
          通貨ペア: 'BTC/JPY',
          増加数量: 0.1,
          減少数量: 1000000,
          約定金額: 1000000,
          増加通貨名: 'BTC',
        },
        {
          取引種別: '売却',
          通貨ペア: 'BTC/JPY',
          増加数量: 1200000,
          減少数量: 0.08,
          約定金額: 1200000,
          増加通貨名: 'JPY',
        },
      ];

      const result = calculateProfit(transactions, 'BTC');
      expect(result.totalBuy).toBe(1000000);
      expect(result.totalSell).toBe(1200000);
      expect(result.totalBuyQuantity).toBe(0.1);
      expect(result.totalSellQuantity).toBe(0.08);
      expect(result.profit).toBe(200000);
    });

    it('should include POINT purchases in BTC calculations', () => {
      const transactions: Transaction[] = [
        {
          取引種別: '購入',
          通貨ペア: 'BTC/POINT',
          増加数量: 0.05,
          減少数量: 500000,
          約定金額: 500000,
          増加通貨名: 'BTC',
        },
        {
          取引種別: '売却',
          通貨ペア: 'BTC/JPY',
          増加数量: 600000,
          減少数量: 0.05,
          約定金額: 600000,
          増加通貨名: 'JPY',
        },
      ];

      const result = calculateProfit(transactions, 'BTC');
      expect(result.totalBuy).toBe(500000);
      expect(result.totalSell).toBe(600000);
      expect(result.totalBuyQuantity).toBe(0.05);
      expect(result.totalSellQuantity).toBe(0.05);
      expect(result.profit).toBe(100000);
    });

    it('should include received BTC in calculations', () => {
      const transactions: Transaction[] = [
        {
          取引種別: '受取',
          通貨ペア: 'BTC',
          増加数量: 0.02,
          減少数量: 0,
          約定金額: 200000,
          増加通貨名: 'BTC',
        },
        {
          取引種別: '売却',
          通貨ペア: 'BTC/JPY',
          増加数量: 300000,
          減少数量: 0.02,
          約定金額: 300000,
          増加通貨名: 'JPY',
        },
      ];

      const result = calculateProfit(transactions, 'BTC');
      expect(result.totalBuy).toBe(200000);
      expect(result.totalSell).toBe(300000);
      expect(result.totalBuyQuantity).toBe(0.02);
      expect(result.totalSellQuantity).toBe(0.02);
      expect(result.profit).toBe(100000);
    });

    // Add real data test cases
    it('should calculate BTC profit correctly with real data', () => {
      const transactions: Transaction[] = [
        {
          取引種別: '購入',
          通貨ペア: 'BTC/POINT',
          増加数量: 0.05,
          減少数量: 500000,
          約定金額: 500000,
          増加通貨名: 'BTC',
        },
        {
          取引種別: '受取',
          通貨ペア: 'BTC',
          増加数量: 0.02,
          減少数量: 0,
          約定金額: 200000,
          増加通貨名: 'BTC',
        },
        {
          取引種別: '購入',
          通貨ペア: 'BTC/POINT',
          増加数量: 0.0000177,
          減少数量: 177,
          約定金額: 177,
          増加通貨名: 'BTC',
        },
        {
          取引種別: '売却',
          通貨ペア: 'BTC/JPY',
          増加数量: 1200000,
          減少数量: 0.08,
          約定金額: 1200000,
          増加通貨名: 'JPY',
        },
      ];

      const result = calculateProfit(transactions, 'BTC');
      expect(result.totalBuy).toBe(700177);
      expect(result.totalSell).toBe(1200000);
      expect(result.totalBuyQuantity).toBe(0.0700177);
      expect(result.totalSellQuantity).toBe(0.08);
      expect(result.profit).toBe(499823);
    });
  });

  // ETH test cases
  describe('ETH Calculations', () => {
    it('should calculate ETH profit correctly with real data', () => {
      const transactions: Transaction[] = [
        {
          取引種別: '購入',
          通貨ペア: 'ETH/JPY',
          増加数量: 1.5,
          減少数量: 500000,
          約定金額: 500000,
          増加通貨名: 'ETH',
        },
        {
          取引種別: '購入',
          通貨ペア: 'ETH/POINT',
          増加数量: 0.8,
          減少数量: 300000,
          約定金額: 300000,
          増加通貨名: 'ETH',
        },
        {
          取引種別: '受取',
          通貨ペア: 'ETH',
          増加数量: 0.3,
          減少数量: 0,
          約定金額: 150000,
          増加通貨名: 'ETH',
        },
        {
          取引種別: '売却',
          通貨ペア: 'ETH/JPY',
          増加数量: 600000,
          減少数量: 1.0,
          約定金額: 600000,
          増加通貨名: 'JPY',
        },
      ];

      const result = calculateProfit(transactions, 'ETH');
      expect(result.totalBuy).toBe(950000);
      expect(result.totalSell).toBe(600000);
      expect(result.totalBuyQuantity).toBeCloseTo(2.6, 10);
      expect(result.totalSellQuantity).toBe(1.0);
      expect(result.profit).toBe(-350000);
    });
  });

  // Edge cases test
  describe('Edge Cases', () => {
    it('should handle empty transaction list', () => {
      const result = calculateProfit([], 'BTC');
      expect(result.totalBuy).toBe(0);
      expect(result.totalSell).toBe(0);
      expect(result.totalBuyQuantity).toBe(0);
      expect(result.totalSellQuantity).toBe(0);
      expect(result.profit).toBe(0);
    });

    it('should ignore invalid currency pairs', () => {
      const transactions: Transaction[] = [
        {
          取引種別: '購入',
          通貨ペア: 'BTC/USD', // 无效的货币对
          増加数量: 0.1,
          減少数量: 10000,
          約定金額: 10000,
          増加通貨名: 'BTC',
        },
        {
          取引種別: '送金',
          通貨ペア: 'BTC',
          増加数量: 0.05,
          減少数量: 0,
          約定金額: 0,
          増加通貨名: 'BTC',
        },
      ];

      const result = calculateProfit(transactions, 'BTC');
      expect(result.totalBuy).toBe(0);
      expect(result.totalSell).toBe(0);
      expect(result.totalBuyQuantity).toBe(0);
      expect(result.totalSellQuantity).toBe(0);
      expect(result.profit).toBe(0);
    });
  });
});

describe('MercoinCalculator File Validation', () => {
  describe('File Count Validation', () => {
    it('should validate correct number of files', () => {
      const files = {
        length: 12,
        item: () => null,
        [Symbol.iterator]: function* (this: { length: number }) {
          for (let i = 0; i < this.length; i++) {
            yield { name: `2024${(i + 1).toString().padStart(2, '0')}.csv` };
          }
        },
      } as unknown as FileList;
      expect(validateFileCount(files)).toBe(true);
    });

    it('should reject incorrect number of files', () => {
      const files = {
        length: 11,
        item: () => null,
        [Symbol.iterator]: function* (this: { length: number }) {
          for (let i = 0; i < this.length; i++) {
            yield { name: `2024${(i + 1).toString().padStart(2, '0')}.csv` };
          }
        },
      } as unknown as FileList;
      expect(validateFileCount(files)).toBe(false);
    });
  });

  describe('File Name Validation', () => {
    it('should validate correct file names', () => {
      const files = {
        length: 12,
        [Symbol.iterator]: function* () {
          for (let i = 1; i <= 12; i++) {
            yield { name: `2024${i.toString().padStart(2, '0')}.csv` };
          }
        },
        item: (index: number) => ({
          name: `2024${(index + 1).toString().padStart(2, '0')}.csv`,
        }),
      } as unknown as FileList;
      expect(validateFileNames(files)).toBe(true);
    });

    it('should reject files from different years', () => {
      const files = {
        length: 12,
        [Symbol.iterator]: function* () {
          yield { name: '202401.csv' };
          yield { name: '202302.csv' };
          for (let i = 3; i <= 12; i++) {
            yield { name: `2024${i.toString().padStart(2, '0')}.csv` };
          }
        },
        item: (index: number) => {
          if (index === 0) return { name: '202401.csv' };
          if (index === 1) return { name: '202302.csv' };
          return { name: `2024${(index + 1).toString().padStart(2, '0')}.csv` };
        },
      } as unknown as FileList;
      expect(validateFileNames(files)).toBe(false);
    });

    it('should reject invalid file name format', () => {
      const files = {
        length: 12,
        [Symbol.iterator]: function* () {
          yield { name: 'invalid.csv' };
          for (let i = 2; i <= 12; i++) {
            yield { name: `2024${i.toString().padStart(2, '0')}.csv` };
          }
        },
        item: (index: number) => {
          if (index === 0) return { name: 'invalid.csv' };
          return { name: `2024${(index + 1).toString().padStart(2, '0')}.csv` };
        },
      } as unknown as FileList;
      expect(validateFileNames(files)).toBe(false);
    });

    it('should reject missing months', () => {
      const files = {
        length: 12,
        [Symbol.iterator]: function* () {
          for (let i = 1; i <= 11; i++) {
            yield { name: `2024${i.toString().padStart(2, '0')}.csv` };
          }
          yield { name: '202413.csv' };
        },
        item: (index: number) => {
          if (index === 11) return { name: '202413.csv' };
          return { name: `2024${(index + 1).toString().padStart(2, '0')}.csv` };
        },
      } as unknown as FileList;
      expect(validateFileNames(files)).toBe(false);
    });
  });
});
