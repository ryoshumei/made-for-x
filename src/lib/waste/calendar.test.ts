import { buildRecurrenceRule, buildIcs, nextOccurrence } from './calendar';
import type { Schedule } from './types';

const iso = (d: Date | null) =>
  d
    ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    : null;

describe('nextOccurrence (Google Calendar seed date)', () => {
  // from = Tue 2026-06-23
  const from = new Date(2026, 5, 23);

  it('monthly 1st Wednesday seeds on a real 1st Wednesday', () => {
    const s: Schedule = {
      wasteType: 'non_burnable',
      frequency: 'monthly',
      dayOfWeek: ['水'],
      weekOfMonth: [1],
    };
    // June 2026 1st Wed (3rd) is past → next is July 1, 2026 (a Wednesday, 1st of month)
    expect(iso(nextOccurrence(s, from))).toBe('2026-07-01');
  });

  it('weekly multi-day seeds on the earliest upcoming weekday', () => {
    const s: Schedule = { wasteType: 'burnable', frequency: 'weekly', dayOfWeek: ['月', '木'] };
    // from Tue 6/23 → Thu 6/25 (before next Mon 6/29)
    expect(iso(nextOccurrence(s, from))).toBe('2026-06-25');
  });

  it('monthly day_of_month seeds on the next matching day', () => {
    const s: Schedule = {
      wasteType: 'recyclable',
      frequency: 'monthly',
      dayOfMonth: [13, 27],
    };
    expect(iso(nextOccurrence(s, from))).toBe('2026-06-27');
  });

  it('collection_dates seeds on the earliest future date', () => {
    const s: Schedule = {
      wasteType: 'hazardous',
      frequency: 'scheduled',
      collectionDates: ['2026-06-08', '2026-12-07'],
    };
    expect(iso(nextOccurrence(s, from))).toBe('2026-12-07');
  });
});

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
    expect(ics).toContain('DTEND;VALUE=DATE:20260609');
    expect(ics).toContain('DTEND;VALUE=DATE:20261208');
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
