import { calculateBridgePlan } from '../bridge-calculator';
import { Holiday } from '../types';

// Helper to create holiday objects
function h(dateStr: string, name: string): Holiday {
  return { date: new Date(dateStr), name, nameEn: '' };
}

describe('calculateBridgePlan', () => {
  describe('simple cases', () => {
    test('holiday on Friday → 3-day weekend, no PTO needed', () => {
      const holiday = h('2026-01-02', 'テスト祝日'); // 2026-01-02 is a Friday
      const allHolidays = [holiday];

      const result = calculateBridgePlan(holiday.date, allHolidays);

      expect(result.ptoDaysNeeded).toBe(0);
      expect(result.totalDaysOff).toBe(3); // Fri + Sat + Sun
    });

    test('holiday on Monday → 3-day weekend, no PTO needed', () => {
      const holiday = h('2026-01-12', '成人の日'); // 2026-01-12 is a Monday
      const allHolidays = [holiday];

      const result = calculateBridgePlan(holiday.date, allHolidays);

      expect(result.ptoDaysNeeded).toBe(0);
      expect(result.totalDaysOff).toBe(3); // Sat + Sun + Mon
    });

    test('holiday on Wednesday → bridge to weekend with PTO', () => {
      // 2026-04-29 is a Wednesday (昭和の日)
      const holiday = h('2026-04-29', '昭和の日');
      const allHolidays = [holiday];

      const result = calculateBridgePlan(holiday.date, allHolidays);

      // Best plan: take Thu+Fri off (2 PTO) → 5 days (Wed-Sun)
      // Or take Mon+Tue off (2 PTO) → 5 days (Sat-Wed)
      // Both are 2 PTO for 5 days — either is valid
      expect(result.ptoDaysNeeded).toBeLessThanOrEqual(2);
      expect(result.totalDaysOff).toBeGreaterThanOrEqual(5);
    });

    test('holiday on Thursday → take Friday off for 4-day weekend', () => {
      const holiday = h('2026-05-07', 'テスト祝日'); // 2026-05-07 is a Thursday
      const allHolidays = [holiday];

      const result = calculateBridgePlan(holiday.date, allHolidays);

      // Take Friday off → Thu+Fri+Sat+Sun = 4 days, 1 PTO
      expect(result.ptoDaysNeeded).toBe(1);
      expect(result.totalDaysOff).toBe(4);
    });
  });

  describe('cluster detection', () => {
    test('Golden Week cluster with bridge opportunity', () => {
      // Golden Week 2026:
      // Apr 29 (Wed) - 昭和の日
      // May 3 (Sun) - 憲法記念日
      // May 4 (Mon) - みどりの日
      // May 5 (Tue) - こどもの日
      // May 6 (Wed) - 振替休日 (substitute for May 3 falling on Sunday)
      const holidays = [
        h('2026-04-29', '昭和の日'),
        h('2026-05-03', '憲法記念日'),
        h('2026-05-04', 'みどりの日'),
        h('2026-05-05', 'こどもの日'),
        h('2026-05-06', '振替休日'),
      ];

      const result = calculateBridgePlan(new Date('2026-04-29'), holidays);

      // The cluster includes Apr 29 (Wed) through May 6 (Wed)
      // Gap: Apr 30 (Thu), May 1 (Fri) are workdays
      // May 2 (Sat), May 3-6 are off
      // Taking Apr 30 + May 1 off (2 PTO) bridges to:
      // Apr 29 (Wed) through May 6 (Wed) = 8 days
      expect(result.ptoDaysNeeded).toBeLessThanOrEqual(3);
      expect(result.totalDaysOff).toBeGreaterThanOrEqual(8);
    });

    test('consecutive holidays merge into cluster', () => {
      // Two holidays on Thu+Fri
      const holidays = [
        h('2026-05-07', 'テスト祝日A'), // Thursday
        h('2026-05-08', 'テスト祝日B'), // Friday
      ];

      const result = calculateBridgePlan(new Date('2026-05-07'), holidays);

      // Thu + Fri + Sat + Sun = 4 days, 0 PTO
      expect(result.ptoDaysNeeded).toBe(0);
      expect(result.totalDaysOff).toBe(4);
    });
  });

  describe('multi-holiday cluster header', () => {
    test('bridge plan returns full range while input holiday is the anchor', () => {
      const holidays = [
        h('2026-04-29', '昭和の日'),
        h('2026-05-03', '憲法記念日'),
        h('2026-05-04', 'みどりの日'),
        h('2026-05-05', 'こどもの日'),
        h('2026-05-06', '振替休日'),
      ];

      const result = calculateBridgePlan(new Date('2026-04-29'), holidays);

      // The plan should span beyond just Apr 29
      expect(result.endDate.getTime()).toBeGreaterThan(new Date('2026-04-29').getTime());
      // The start date should include the anchor holiday
      expect(result.startDate.getTime()).toBeLessThanOrEqual(new Date('2026-04-29').getTime());
    });
  });

  describe('PTO cap', () => {
    test('never suggests more than 3 PTO days', () => {
      // Holiday on Wednesday, isolated (no nearby holidays/weekends to cluster with)
      const holiday = h('2026-06-10', 'テスト祝日'); // Wednesday
      const allHolidays = [holiday];

      const result = calculateBridgePlan(holiday.date, allHolidays);

      expect(result.ptoDaysNeeded).toBeLessThanOrEqual(3);
    });
  });

  describe('edge cases', () => {
    test('holiday on Saturday with substitute Monday', () => {
      const holidays = [
        h('2026-07-18', 'テスト祝日'), // Saturday
        h('2026-07-20', '振替休日'), // Monday (substitute)
      ];

      const result = calculateBridgePlan(new Date('2026-07-18'), holidays);

      // Sat + Sun + Mon(substitute) = 3 days, 0 PTO
      expect(result.ptoDaysNeeded).toBe(0);
      expect(result.totalDaysOff).toBe(3);
    });
  });
});
