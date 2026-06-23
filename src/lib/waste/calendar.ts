// src/lib/waste/calendar.ts
import type { Schedule } from './types';

const JP_TO_RRULE_DAY: Record<string, string> = {
  月: 'MO',
  火: 'TU',
  水: 'WE',
  木: 'TH',
  金: 'FR',
  土: 'SA',
  日: 'SU',
};

export function buildRecurrenceRule(s: Schedule): string | null {
  const days = (s.dayOfWeek ?? []).map((d) => JP_TO_RRULE_DAY[d]).filter(Boolean);
  switch (s.frequency) {
    case 'weekly':
      return days.length ? `RRULE:FREQ=WEEKLY;BYDAY=${days.join(',')}` : null;
    case 'biweekly':
      return days.length ? `RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=${days.join(',')}` : null;
    case 'monthly':
      if (s.dayOfMonth && s.dayOfMonth.length) {
        return `RRULE:FREQ=MONTHLY;BYMONTHDAY=${s.dayOfMonth.join(',')}`;
      }
      if (s.weekOfMonth && s.weekOfMonth.length && days.length) {
        const byday = s.weekOfMonth.flatMap((w) => days.map((d) => `${w}${d}`)).join(',');
        return `RRULE:FREQ=MONTHLY;BYDAY=${byday}`;
      }
      return null;
    default:
      return null; // scheduled / on_demand → use ICS or no recurrence
  }
}

const JP_DAY_TO_JS: Record<string, number> = {
  日: 0,
  月: 1,
  火: 2,
  水: 3,
  木: 4,
  金: 5,
  土: 6,
};

/**
 * The first calendar date on/after `from` that matches a recurring schedule's
 * pattern. This is the seed (DTSTART) for a Google Calendar recurrence: it MUST
 * be a real instance of the rule, otherwise Google infers the wrong recurrence
 * from the start date (e.g. seeding a "1st Wednesday" rule on the 4th Wednesday
 * makes Google show "monthly on the fourth Wednesday").
 *
 * Returns null if nothing matches within a year (e.g. empty pattern).
 */
export function nextOccurrence(s: Schedule, from: Date): Date | null {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());

  // Explicit-date schedules: the earliest date that hasn't passed.
  if (s.collectionDates && s.collectionDates.length) {
    const future = s.collectionDates
      .map((d) => new Date(`${d}T00:00:00`))
      .filter((d) => d.getTime() >= start.getTime())
      .sort((a, b) => a.getTime() - b.getTime());
    return future[0] ?? null;
  }

  const days = (s.dayOfWeek ?? []).map((d) => JP_DAY_TO_JS[d]).filter((n) => n !== undefined);

  for (let i = 0; i < 400; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    if (s.frequency === 'monthly' && s.dayOfMonth && s.dayOfMonth.length) {
      if (s.dayOfMonth.includes(d.getDate())) return d;
    } else if (s.frequency === 'monthly' && s.weekOfMonth && s.weekOfMonth.length) {
      const nth = Math.ceil(d.getDate() / 7); // nth occurrence of this weekday in its month
      if (days.includes(d.getDay()) && s.weekOfMonth.includes(nth)) return d;
    } else if (days.includes(d.getDay())) {
      return d; // weekly / biweekly
    }
  }
  return null;
}

function nextDayYmd(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
}

export function buildIcs(title: string, isoDates: string[]): string {
  const slug = title.replace(/\s+/g, '').slice(0, 12);
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//madeforx//waste//JA'];
  isoDates.forEach((iso, i) => {
    const ymd = iso.replace(/-/g, '');
    lines.push(
      'BEGIN:VEVENT',
      `UID:waste-${slug}-${ymd}-${i}@madeforx.com`,
      `SUMMARY:${title}`,
      `DTSTART;VALUE=DATE:${ymd}`,
      `DTEND;VALUE=DATE:${nextDayYmd(iso)}`,
      'END:VEVENT'
    );
  });
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
