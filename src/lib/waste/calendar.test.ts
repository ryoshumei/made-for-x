import { buildRecurrenceRule, buildIcs } from './calendar';
import type { Schedule } from './types';

describe('buildRecurrenceRule', () => {
  it('weekly → WEEKLY by day', () => {
    const s: Schedule = { wasteType: 'burnable', frequency: 'weekly', dayOfWeek: ['月', '木'] };
    expect(buildRecurrenceRule(s)).toBe('RRULE:FREQ=WEEKLY;BYDAY=MO,TH');
  });
  it('biweekly → WEEKLY interval 2', () => {
    const s: Schedule = { wasteType: 'x', frequency: 'biweekly', dayOfWeek: ['水'] };
    expect(buildRecurrenceRule(s)).toBe('RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=WE');
  });
  it('monthly nth weekday → MONTHLY BYDAY with ordinal', () => {
    const s: Schedule = {
      wasteType: 'x',
      frequency: 'monthly',
      dayOfWeek: ['木'],
      weekOfMonth: [2],
    };
    expect(buildRecurrenceRule(s)).toBe('RRULE:FREQ=MONTHLY;BYDAY=2TH');
  });
  it('monthly by day of month → MONTHLY BYMONTHDAY', () => {
    const s: Schedule = { wasteType: 'x', frequency: 'monthly', dayOfMonth: [13, 27] };
    expect(buildRecurrenceRule(s)).toBe('RRULE:FREQ=MONTHLY;BYMONTHDAY=13,27');
  });
  it('explicit-date schedules have no recurrence rule', () => {
    const s: Schedule = { wasteType: 'x', frequency: 'scheduled', collectionDates: ['2026-06-08'] };
    expect(buildRecurrenceRule(s)).toBeNull();
  });
});

describe('buildIcs', () => {
  it('emits one VEVENT per collection date', () => {
    const ics = buildIcs('電池類収集', ['2026-06-08', '2026-12-07']);
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('DTSTART;VALUE=DATE:20260608');
    expect(ics).toContain('DTSTART;VALUE=DATE:20261207');
    expect((ics.match(/BEGIN:VEVENT/g) ?? []).length).toBe(2);
    expect(ics.trim().endsWith('END:VCALENDAR')).toBe(true);
  });

  it('different waste types on same date produce different UIDs', () => {
    const ics1 = buildIcs('カン', ['2026-04-02']);
    const ics2 = buildIcs('びん', ['2026-04-02']);
    const uid1 = ics1.split('\r\n').find((l) => l.startsWith('UID:'));
    const uid2 = ics2.split('\r\n').find((l) => l.startsWith('UID:'));
    expect(uid1).toBeDefined();
    expect(uid2).toBeDefined();
    expect(uid1).not.toBe(uid2);
  });
});
