import { formatSchedule } from './schedule-format';
import type { Schedule } from './types';

const base: Schedule = { wasteType: 'burnable', frequency: 'weekly' };

describe('formatSchedule', () => {
  it('weekly', () => {
    expect(formatSchedule({ ...base, dayOfWeek: ['月', '木'] })).toBe('毎週 月・木');
  });
  it('biweekly', () => {
    expect(formatSchedule({ ...base, frequency: 'biweekly', dayOfWeek: ['水'] })).toBe('隔週 水');
  });
  it('monthly by nth weekday', () => {
    expect(
      formatSchedule({ ...base, frequency: 'monthly', dayOfWeek: ['木'], weekOfMonth: [2] })
    ).toBe('毎月 第2 木');
  });
  it('monthly by day of month', () => {
    expect(formatSchedule({ ...base, frequency: 'monthly', dayOfMonth: [13, 27] })).toBe(
      '毎月 13日・27日'
    );
  });
  it('scheduled explicit dates', () => {
    expect(
      formatSchedule({
        ...base,
        frequency: 'scheduled',
        collectionDates: ['2026-06-08', '2026-12-07'],
      })
    ).toBe('指定日 6/8・12/7');
  });
  it('on_demand', () => {
    expect(formatSchedule({ ...base, frequency: 'on_demand' })).toBe('申込制');
  });
});
