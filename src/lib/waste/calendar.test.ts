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
  it('emits one VEVENT per date across multiple groups', () => {
    const ics = buildIcs([
      { title: 'カン収集', dates: ['2026-07-03', '2026-07-17'] },
      { title: 'ビン・ガラス収集', dates: ['2026-08-05'] },
    ]);
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect((ics.match(/BEGIN:VEVENT/g) ?? []).length).toBe(3);
    expect(ics).toContain('SUMMARY:カン収集');
    expect(ics).toContain('SUMMARY:ビン・ガラス収集');
    expect(ics).toContain('DTSTART;VALUE=DATE:20260703');
    expect(ics).toContain('DTSTART;VALUE=DATE:20260717');
    expect(ics).toContain('DTSTART;VALUE=DATE:20260805');
    expect(ics).toContain('DTEND;VALUE=DATE:20260704');
    expect(ics).toContain('DTEND;VALUE=DATE:20260806');
    expect(ics.trim().endsWith('END:VCALENDAR')).toBe(true);
  });

  it('every VEVENT has a DTSTAMP', () => {
    const ics = buildIcs([{ title: 'カン収集', dates: ['2026-07-03', '2026-07-17'] }]);
    expect((ics.match(/DTSTAMP:\d{8}T\d{6}Z/g) ?? []).length).toBe(2);
  });

  it('escapes backslash, comma, semicolon and newline in SUMMARY/DESCRIPTION', () => {
    const ics = buildIcs([
      {
        title: 'A,B;C\\D',
        dates: ['2026-07-03'],
        description: '地域: 区分1（大網白里市）\nメモ, 注意; 済',
      },
    ]);
    expect(ics).toContain('SUMMARY:A\\,B\\;C\\\\D');
    expect(ics).toContain('DESCRIPTION:地域: 区分1（大網白里市）\\nメモ\\, 注意\\; 済');
  });

  it('UIDs are unique across the whole file even for same title and date', () => {
    const ics = buildIcs([
      { title: 'カン収集', dates: ['2026-07-03'] },
      { title: 'カン収集', dates: ['2026-07-03'] },
    ]);
    const uids = ics.split('\r\n').filter((l) => l.startsWith('UID:'));
    expect(uids.length).toBe(2);
    expect(new Set(uids).size).toBe(2);
  });

  it('omits DESCRIPTION when not provided', () => {
    const ics = buildIcs([{ title: 'カン収集', dates: ['2026-07-03'] }]);
    expect(ics).not.toContain('DESCRIPTION:');
  });
});
