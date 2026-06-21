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

  it('monthly with 12 collectionDates caps at 4 with ellipsis', () => {
    expect(
      formatSchedule({
        ...base,
        frequency: 'monthly',
        collectionDates: [
          '2026-04-02',
          '2026-05-01',
          '2026-06-01',
          '2026-07-02',
          '2026-08-03',
          '2026-09-01',
          '2026-10-01',
          '2026-11-02',
          '2026-12-01',
          '2027-01-04',
          '2027-02-01',
          '2027-03-01',
        ],
      })
    ).toBe('指定日 4/2・5/1・6/1・7/2…');
  });

  it('scheduled with 2 dates shows both without ellipsis', () => {
    expect(
      formatSchedule({
        ...base,
        frequency: 'scheduled',
        collectionDates: ['2026-06-08', '2026-12-07'],
      })
    ).toBe('指定日 6/8・12/7');
  });
});
